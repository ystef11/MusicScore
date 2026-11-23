import { platform } from '@mu-native/common'
import { createExtendedStoreChunk } from '@ug/store'
import { createSelector } from 'reselect'

import { quizConstants } from '../constants/quizConstants'
import {
    QuizApi,
    QuizApiData,
    type TQuizAnswers,
    type TQuizDataItem,
    type TQuizIds,
    type TQuizItemData,
    TTourQuizData,
    type TTourQuizDataNew,
} from '../types/quizTypes'

const SOCIAL_PROOF_QUIZ_TYPE = 'social_proof'

const getIsSocialProofStep = (quizItem?: TQuizDataItem) => {
    try {
        return JSON.parse(quizItem?.settings || '{}')?.quizType === SOCIAL_PROOF_QUIZ_TYPE
    } catch (e) {
        return false
    }
}

type TTourInstallScreenState = {
    quizStep: number
    lastQuizStep: number
    quizAnswersNames: string[]
    quizQuestions: string[]
    tourQuizDataNew: TTourQuizDataNew
    quizAnswers: TQuizAnswers
    quizAnswersValues: Record<string, string[]>
    quizAnalyticsQuestions: Record<string, string>
    quizAnalyticsUi: Record<string, string>
    userName: string
    isQuizUpdated: boolean
    isUpdateMode: boolean
    isLoadingQuiz: boolean
    quizId: number
    quizExternalId: string | number
    abQuizData: {
        id: number | undefined
        variation: number | undefined
    }
    isNeedToUpdateAnswers: boolean
    quizIds: TQuizIds[]
    isOpenApproveModal: boolean
}

const initialState = {
    quizId: platform.isIos ? QuizApiData.iOS : QuizApiData.android,
    quizExternalId: platform.isIos ? QuizApi.iOS : QuizApi.android,
    lastQuizStep: 2,
    tourQuizDataNew: {
        0: quizConstants.instrumentList,
        1: quizConstants.genreList,
        2: quizConstants.levelsList,
    },
    quizAnswers: {},
    quizAnswersValues: {},
    quizStep: 0,
    quizQuestions: [],
    quizAnalyticsQuestions: {
        id37: 'instrument',
        id40: 'genre',
        id43: 'level',
        id85: 'age',
        id100: 'goal1',
        id103: 'goal2',
    },
    quizAnalyticsUi: {
        id37: 'question',
        id40: 'question',
        id43: 'question',
        id85: 'question',
        id100: 'question',
        id103: 'question',
    },
    quizAnswersNames: [],
    userName: '',
    isQuizUpdated: false,
    isUpdateMode: false,
    isLoadingQuiz: false,
    abQuizData: {
        id: undefined,
        variation: undefined,
    },
    isNeedToUpdateAnswers: true,
    quizIds: [],
    isOpenApproveModal: false,
}

export const quizStoreChunk = createExtendedStoreChunk<TTourInstallScreenState>({
    storeKey: 'quiz',
    treeKey: 'modules',
})({
    persist: ['userName', 'quizIds', 'quizId', 'quizExternalId'],
    initialState,
    actions: {
        resetState: () => ({ ...initialState }),
        resetTourStep: () => ({
            quizStep: 0,
            isUpdateMode: false,
        }),
        setTourQuiz: (tourQuizDataNew: TTourQuizData, state) => {
            const {
                pages = [],
                id,
                ab_test: abTest = null,
                external_id: quizExternalId,
            } = tourQuizDataNew
            if (!pages?.length || !id) return initialState

            const quizAnalyticsQuestions = pages.reduce(
                (acc, item) => ({
                    ...acc,
                    [`id${item.id}`]: item.external_id,
                }),
                {},
            )

            const quizIds = pages
                .filter(item => item.type === 'question')
                .map(item => item.id as TQuizIds)

            const quizAnalyticsUi = pages.reduce(
                (acc, item) => ({
                    ...acc,
                    [`id${item.id}`]: item.type,
                }),
                {},
            )

            const quizData = pages.reduce(
                (acc, item, index) => ({
                    ...acc,
                    [index]: {
                        ...item,
                        ...(item?.answers
                            ? {
                                  answers: item.answers.map(quizItem => ({
                                      ...quizItem,
                                      data: quizItem.children || [],
                                  })),
                              }
                            : {}),
                    },
                }),
                {},
            ) as TTourQuizDataNew

            return {
                lastQuizStep: pages.length - 1,
                quizAnalyticsQuestions,
                quizId: id,
                quizIds,
                quizExternalId,
                tourQuizDataNew: quizData,
                quizAnalyticsUi,
                abQuizData: {
                    id: abTest?.ab_test_id,
                    variation: abTest?.variation,
                },
            }
        },
        setTourQuizDataFlatItem: (
            { answerId, title, isMultiSelect, isOverride = false },
            { quizStep, tourQuizDataNew, quizAnswers, quizAnswersValues },
        ) => {
            const currentQuizItemId = `id${tourQuizDataNew[quizStep].id}`

            const currentAnswers = quizAnswers[currentQuizItemId] || []
            const quizAnswersCurrentStep =
                currentAnswers.includes(answerId) && !isOverride
                    ? currentAnswers.filter(answer => answer !== answerId)
                    : [...(isMultiSelect ? currentAnswers : []), answerId]

            const currentQuizAnswersValues = quizAnswersValues[currentQuizItemId] || []

            const quizAnswersValuesStep =
                currentQuizAnswersValues.includes(title) && !isOverride
                    ? currentQuizAnswersValues.filter(answer => answer !== title)
                    : [...(isMultiSelect ? currentQuizAnswersValues : []), title]

            return {
                quizAnswers: {
                    ...quizAnswers,
                    [currentQuizItemId]: quizAnswersCurrentStep,
                },
                quizAnswersValues: {
                    ...quizAnswersValues,
                    [currentQuizItemId]: quizAnswersValuesStep,
                },
            }
        },
        setQuizStepCustom: (
            { skipNextAnswersIds = null }: { skipNextAnswersIds: number[] | null },
            { lastQuizStep, quizStep, quizAnswers },
        ) => {
            if (lastQuizStep === quizStep) {
                return {
                    quizStep: quizStep + 1,
                }
            }

            const isNeedToSkipNextQuizStep =
                skipNextAnswersIds?.length &&
                quizAnswers[quizStep]?.some(answerId => skipNextAnswersIds.includes(answerId))
            const indexSkip = isNeedToSkipNextQuizStep ? 1 : 0

            return {
                quizStep: quizStep + indexSkip + 1,
            }
        },
        setTourDataCustom: ({ tourAnswers }: { tourAnswers: TQuizItemData[] }, state) => {
            if (!tourAnswers?.length) return { ...initialState, isUpdateMode: true }

            const { quizIds: currentQuizIds, quizAnalyticsQuestions } = state

            const { quizAnswersNames, quizIds } = tourAnswers.reduce(
                (acc: { quizAnswersNames: string[]; quizIds: string[] }, item, index) => ({
                    quizAnswersNames: [
                        ...acc.quizAnswersNames,
                        ...(!!currentQuizIds?.length && currentQuizIds[index] === item.quiz_page_id
                            ? item.values.map(item => item.value)
                            : []),
                    ],
                    quizIds: [...acc.quizIds, item.quiz_page_id.toString()],
                }),
                { quizAnswersNames: [], quizIds: [] },
            )

            const quizAnswers = tourAnswers.reduce(
                (acc, item) => ({
                    ...acc,
                    [`id${item.quiz_page_id}`]: item?.values?.length
                        ? item?.values.map(item => item.answer_id)
                        : [],
                }),
                {},
            ) as TQuizAnswers

            const tourDataSelectedValues = tourAnswers.reduce(
                (acc, item) => ({
                    ...acc,
                    [`id${item.quiz_page_id}`]: item?.values?.length
                        ? item?.values.map(item => item.value)
                        : [],
                }),
                {},
            )

            const quizQuestions = Object.entries(quizAnswers).reduce(
                (acc: string[], item) =>
                    [
                        ...acc,
                        ...Array.from(
                            { length: item[1].length },
                            () =>
                                quizAnalyticsQuestions[
                                    quizConstants.oldIdsAnswersMap[
                                        item[0] as keyof typeof quizConstants.oldIdsAnswersMap
                                    ] || item[0]
                                ],
                        ),
                    ] as string[],
                [],
            )
            if (
                quizQuestions.some(item => !item) ||
                quizAnswersNames.length !== quizQuestions.length
            )
                return { ...initialState, isUpdateMode: true }
            return {
                quizAnswers,
                quizIds: quizIds as unknown as TQuizIds[],
                quizAnswersNames,
                quizQuestions,
                quizAnswersValues: tourDataSelectedValues,
            }
        },
        setPartialFieldsCustom: (marketingPartialsFields: Partial<TTourInstallScreenState>) => ({
            ...marketingPartialsFields,
        }),
    },
})

export const getTourQuizDataNew = createSelector(
    quizStoreChunk.props.getTourQuizDataNew,
    quizStoreChunk.props.getQuizStep,
    (quizData, step) => quizData[step],
)

export const getLastProgressBarStep = createSelector(
    quizStoreChunk.props.getTourQuizDataNew,
    quizStoreChunk.props.getLastQuizStep,
    (quizData, lastQuizStep) =>
        Array.from({ length: lastQuizStep + 1 }, (_, index) => index).reduce(
            (lastStep, step) =>
                step === lastQuizStep && getIsSocialProofStep(quizData[step]) ? lastStep : step,
            lastQuizStep,
        ),
)

export const getIsStudent = createSelector(quizStoreChunk.props.getQuizAnswers, quizAnswers => {
    const answersIdsArray = Object.values(quizAnswers).flat()

    return answersIdsArray.some(answerId => quizConstants.idsStudents.includes(answerId))
})

export const getAgeId = createSelector(quizStoreChunk.props.getQuizAnswers, quizAnswers => {
    return quizAnswers[quizConstants.ageQuestionIndex]?.[0] as 1015 | 1018
})

export const getCurrentQuizQuestionId = createSelector(
    quizStoreChunk.props.getTourQuizDataNew,
    quizStoreChunk.props.getQuizStep,
    (quizData, step) =>
        `id${
            quizData[step]?.id ||
            quizConstants.mapStepIds[step as keyof typeof quizConstants.mapStepIds]
        }`,
)

export const getInstrumentValues = createSelector(
    quizStoreChunk.props.getQuizAnswers,
    quizAnswers => {
        return quizAnswers[quizConstants.instrumentQuestionIndex]
    },
)

export const getFirstTourInstrument = createSelector(
    quizStoreChunk.props.getQuizAnswersValues,
    quizAnswersValues =>
        quizAnswersValues[quizConstants.instrumentQuestionIndex]?.[0]?.toLowerCase(),
)

export const getFirstTourLevel = createSelector(
    quizStoreChunk.props.getQuizAnswersValues,
    quizAnswersValues => quizAnswersValues[quizConstants.levelQuestionIndex]?.[0]?.toLowerCase(),
)
