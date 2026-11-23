import React, { useEffect, useRef } from 'react'

import { marketingConstants, subscriptionsRtHelpers, TSources } from '@mu-native/marketing'
import { useValues } from '@ug/store'

/* eslint-disable import/no-relative-packages */
import MetricaEvents from '../../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../../App/Utils/Analytics'
import { quizConstants } from '../constants/quizConstants.ts'
import { getCurrentQuizQuestionId, quizStoreChunk } from '../store/quizStoreChunk'

const { getRtParamsBySource } = subscriptionsRtHelpers

const TourQuizRtAnalytics = ({
    source = marketingConstants.sources.tourInstall,
}: {
    source?: TSources
}) => {
    const [
        quizId,
        currentQuizStep,
        lastQuizStep,
        quizAnswers,
        quizAnalyticsQuestions,
        isUpdateMode,
        quizAnalyticsUi,
    ] = useValues([
        getCurrentQuizQuestionId,
        quizStoreChunk.props.getQuizStep,
        quizStoreChunk.props.getLastQuizStep,
        quizStoreChunk.props.getQuizAnswersValues,
        quizStoreChunk.props.getQuizAnalyticsQuestions,
        quizStoreChunk.props.getIsUpdateMode,
        quizStoreChunk.props.getQuizAnalyticsUi,
    ])

    const prevQuizId = useRef(quizId)
    const prevStepProps = useRef(currentQuizStep)
    const prevQuizAnswerProps = useRef(quizAnswers)

    useEffect(() => {
        if (currentQuizStep <= lastQuizStep) {
            const lengthAnswers = quizAnswers[quizId]?.length
            const prevLengthAnswers = prevQuizAnswerProps.current[quizId]?.length

            if (
                lengthAnswers &&
                (lengthAnswers > prevLengthAnswers ||
                    (lengthAnswers && !prevLengthAnswers) ||
                    (lengthAnswers === prevLengthAnswers &&
                        quizAnswers[quizId] !== prevQuizAnswerProps.current[quizId]))
            ) {
                reportEvent(MetricaEvents.TOUR_QUIZ_OPTION_SELECT, {
                    ...getRtParamsBySource({ source }),
                    ui: quizAnalyticsUi[quizId],
                    value: quizAnalyticsQuestions[quizId],
                    'quiz_answer.value': [quizAnswers[quizId][lengthAnswers - 1]],
                    'quiz_answer.question': [
                        quizAnalyticsQuestions[
                            quizConstants.oldIdsAnswersMap[
                                quizId as keyof typeof quizConstants.oldIdsAnswersMap
                            ] || quizId
                        ],
                    ],
                })
            }

            if (prevLengthAnswers && prevLengthAnswers > lengthAnswers) {
                reportEvent(MetricaEvents.TOUR_QUIZ_OPTION_UNSELECT, {
                    ...getRtParamsBySource({ source }),
                    ui: quizAnalyticsUi[quizId],
                    value: quizAnalyticsQuestions[quizId],
                    'quiz_answer.value': [
                        prevQuizAnswerProps.current[quizId][prevLengthAnswers - 1],
                    ],
                    'quiz_answer.question': [
                        quizAnalyticsQuestions[
                            quizConstants.oldIdsAnswersMap[
                                quizId as keyof typeof quizConstants.oldIdsAnswersMap
                            ] || quizId
                        ],
                    ],
                })
            }

            prevQuizAnswerProps.current = quizAnswers
        }
    }, [quizAnswers])

    useEffect(() => {
        reportEvent(MetricaEvents.TOUR_QUIZ_START, {
            ...getRtParamsBySource({ source }),
        })
    }, [])

    useEffect(() => {
        if (currentQuizStep <= lastQuizStep) {
            reportEvent(MetricaEvents.TOUR_QUIZ_STEP_VIEW, {
                value: quizAnalyticsQuestions[quizId],
                ui: quizAnalyticsUi[quizId],
                ...getRtParamsBySource({ source }),
            })
        }

        if (prevStepProps.current === currentQuizStep - 1) {
            const arrayQuestions = Object.entries(quizAnswers).reduce(
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
            const tourAnswerNames = Object.values(quizAnswers).flat()

            reportEvent(MetricaEvents.TOUR_QUIZ_STEP_SUCCESS, {
                ...getRtParamsBySource({ source }),
                ui: quizAnalyticsUi[prevQuizId.current],
                value: quizAnalyticsQuestions[prevQuizId.current],
                'quiz_answer.value': tourAnswerNames,
                'quiz_answer.question': arrayQuestions,
            })

            if (isUpdateMode) {
                reportEvent(MetricaEvents.TOUR_QUIZ_INSTRUMENT_UPDATE, {
                    ...getRtParamsBySource({ source }),
                    'quiz_answer.value': tourAnswerNames,
                    'quiz_answer.question': arrayQuestions,
                })
            }
        }
        prevStepProps.current = currentQuizStep
        prevQuizId.current = quizId
    }, [currentQuizStep])

    return null
}

export default React.memo(TourQuizRtAnalytics)
