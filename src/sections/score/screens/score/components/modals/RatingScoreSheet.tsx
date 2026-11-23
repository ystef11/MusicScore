import React, { useCallback, useEffect, useRef, useState } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'

import {
    brandColors,
    brandFontsStyles,
    colors,
    KeyboardSpacer,
    MuseButton,
    NativeBottomSheet,
    NativeBottomSheetRef,
    SheetTitle,
    showAlertNotification,
    useAppSafeArea,
} from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { scoreTestIds } from '@mu/mu-mobile-test-id'
import { needToAskAppReview, reviewAppStoreChunk } from '@mu-native/reviewApp'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { appEventsEmitter } from '@mu-native/system'
import { useActions, useValues } from '@ug/store'

import { getScoreMetaEvent } from '../../../../../../App/constants/scoreAnalytic'
import {
    ActionSheetContexts,
    updateCurrentScore,
} from '../../../../../../App/Controllers/ScoreActionsController'
import type { MSScoreT } from '../../../../../../App/Model/MSScore'
import {
    requestReviewApp,
    RequestReviewAppSources,
} from '../../../../../../App/ReviewApp/ReviewAppController'
import { rateScore } from '../../../../../../App/Services/RatingProvider'
import reportEvent from '../../../../../../App/Utils/Analytics'
import { RateEbookStars } from '../../../../../ebooks/screens/ebooksMain/new/components/details/DigitalEbookRateSheet'

const textMap = {
    [ActionSheetContexts.FAVORITE]: {
        rateScoreText: {
            title: translate('native.scoreLiked.rateScoreText.title'),
            subtitle: translate('native.scoreLiked.rateScoreText.subtitle'),
        },
        reviewAppText: {
            title: translate('native.scoreLiked.reviewAppText.title'),
            subtitle: translate('native.scoreLiked.reviewAppText.subtitle'),
        },
    },
    [ActionSheetContexts.ADD_TO_SONGBOOK]: {
        rateScoreText: {
            title: translate('native.scoreSaved.rateScoreText.title'),
            subtitle: translate('native.scoreLiked.rateScoreText.subtitle'),
        },
        reviewAppText: {
            title: translate('native.scoreLiked.reviewAppText.title'),
            subtitle: translate('native.scoreLiked.reviewAppText.subtitle'),
        },
    },
    [ActionSheetContexts.SCORE_DETAILS]: {
        rateScoreText: {
            title: translate('native.score_modals.rate_score'),
            subtitle: translate('native.ebooks.rate_book_description'),
        },
        reviewAppText: {
            title: translate('native.scoreLiked.reviewAppText.title'),
            subtitle: translate('native.scoreLiked.reviewAppText.subtitle'),
        },
    },
    default: {
        rateScoreText: {
            title: translate('native.score_modals.rate_score'),
            subtitle: translate('native.score_modals.rate_score_hint'),
        },
        reviewAppText: {
            title: translate('native.score_modals.rating_saved'),
            subtitle: translate('native.score_modals.rating_saved_hint'),
        },
    },
}

const ratings = [
    RT_EVENTS.RATING_STAR_1_CLICK,
    RT_EVENTS.RATING_STAR_2_CLICK,
    RT_EVENTS.RATING_STAR_3_CLICK,
    RT_EVENTS.RATING_STAR_4_CLICK,
    RT_EVENTS.RATING_STAR_5_CLICK,
]

type TProps = {
    score: MSScoreT
    context: keyof typeof textMap
    onHide: () => void
}

function prepareEventParams(score: MSScoreT, context: keyof typeof textMap) {
    const eventExtraParams = {
        'params.key': ['context'],
        'params.str_value': [context],
        'params.value': [0],
    }
    return getScoreMetaEvent(score, undefined, eventExtraParams)
}

export const RatingScoreSheet: React.FC = () => {
    const sheetRef = useRef<NativeBottomSheetRef>(null)
    const [sheetData, setSheetData] = useState<
        { score: MSScoreT; context: keyof typeof textMap } | undefined
    >()

    useEffect(() => {
        if (sheetData) sheetRef.current?.present()
        return appEventsEmitter.on('presentScoreRate', (score, context) => {
            setSheetData({ score, context })
        })
    }, [sheetData])

    if (!sheetData) return null

    const onDismiss = () => setSheetData(undefined)
    const onHide = () => sheetRef.current?.dismiss()

    return (
        <NativeBottomSheet ref={sheetRef} onDismiss={onDismiss}>
            <RatingScoreView score={sheetData.score} context={sheetData.context} onHide={onHide} />
        </NativeBottomSheet>
    )
}

const RatingScoreView = ({ score, onHide, context }: TProps) => {
    const insets = useAppSafeArea({ bottom: 16 })
    const [comment, setComment] = useState<string | null>(null)
    const [rating, setRating] = useState<number | null>(score.userRating || null)
    const [rated, setRated] = useState(false)

    const [isAllowedToAskAppReview] = useValues([needToAskAppReview])
    const actions = useActions({
        submit: rateScore,
        updateCurrentScore,
        requestAppReviewAndHide: reviewAppStoreChunk.actions.requestAndHide,
    })

    const onPressStar = (rating: number) => {
        reportEvent(RT_EVENTS.SCORE_RATING_CLICK, getScoreMetaEvent(score))
        setRated(false)
        setRating(rating)
    }

    const changingRating = rated || (rating !== null && rating !== score.userRating)
    const needShowSayThanks =
        isAllowedToAskAppReview && changingRating && rating !== null && rating > 2

    const onSubmit = useCallback(async () => {
        if (!score || !rating) return
        if (rating === score.userRating) {
            onHide()
            return
        }

        const shouldHide = !isAllowedToAskAppReview || rating < 3
        if (shouldHide) onHide()
        if (context !== ActionSheetContexts.FAVORITE || shouldHide) {
            // don't show toast when context is FAVORITE *and* Review App flow is allowed to run
            showAlertNotification({
                title: translate('native.score_modals.rate_score_result'),
                expiresIn: 5000,
            })
        }
        await actions.submit({ score, rating, comment })
        setRated(true)
        reportEvent(ratings[rating])
        if (comment) {
            reportEvent(RT_EVENTS.SCORE_COMMENT, {
                ...getScoreMetaEvent(score),
                'params.key': ['type'],
                'params.str_value': ['comment'],
                'params.value': [0],
            })
        }
        actions.updateCurrentScore(score)
    }, [score.id, score.userRating, rating, comment, context])

    useEffect(() => {
        reportEvent(RT_EVENTS.RATING_STAR_SHOW, { context })
        reportEvent(RT_EVENTS.SCORE_RATE_SCORE_SHOW, prepareEventParams(score, context))
    }, [])

    useEffect(() => {
        if (needShowSayThanks && rated) {
            reportEvent('Rate: show button', {
                source: RequestReviewAppSources.RATE_SCORE,
            })
            reportEvent(
                RT_EVENTS.SCORE_RATE_APP_BUTTON_SHOW,
                prepareEventParams(score, context),
            )
        }
    }, [needShowSayThanks, rated])

    const reviewApp = () => {
        const eventExtraParams = {
            'params.key': ['context'],
            'params.str_value': [context],
            'params.value': [0],
        }
        const eventParams = getScoreMetaEvent(score, undefined, eventExtraParams)
        requestReviewApp(RequestReviewAppSources.RATE_SCORE, () => {
            reportEvent(RT_EVENTS.SCORE_RATE_APP_CLICK, eventParams)
            actions.requestAppReviewAndHide({ days: 14 })
            onHide()
        })
    }

    const textItems = textMap[context] ?? textMap.default
    const { rateScoreText, reviewAppText } = textItems
    const { title, subtitle } = rated && needShowSayThanks ? reviewAppText : rateScoreText

    return (
        <>
            <SheetTitle
                title={title}
                subtitle={subtitle}
                titleTestID={scoreTestIds.scoreDetailsSaveConfirmationTitle}
            />
            <>
                <RateEbookStars onPress={onPressStar} rating={rating ?? 0} />
                <View style={styles.content}>
                    {(!rated || (rated && !!comment)) && (
                        <TextInput
                            value={comment || ''}
                            onChangeText={setComment}
                            style={styles.newCommentInput}
                            multiline
                            disableFullscreenUI
                            placeholder={translate('native.add_comment_placeholder')}
                            placeholderTextColor={brandColors.contentInactive}
                        />
                    )}

                    {!rated && (
                        <MuseButton
                            title={translate('native.score_modals.rate_score')}
                            disabled={rating === null}
                            style={styles.button}
                            onPress={onSubmit}
                        />
                    )}
                    {needShowSayThanks && rated && (
                        <>
                            <MuseButton
                                title={translate('native.screen_tour.rate_text')}
                                disabled={rating === null}
                                style={styles.button}
                                onPress={reviewApp}
                            />
                            <Text style={styles.reviewAppText}>
                                {translate('native.score_action_sheet.your_review_helps')}
                            </Text>
                        </>
                    )}
                </View>
                <KeyboardSpacer
                    handleAndroid
                    defaultBottomSpacing={insets.bottom}
                    openedSpacing={8}
                />
            </>
        </>
    )
}

const styles = StyleSheet.create({
    content: {
        paddingHorizontal: 16,
        width: '100%',
    },

    newCommentInput: {
        padding: 12,
        marginBottom: 16,
        height: 80,
        borderWidth: 1,
        borderColor: brandColors.formDefault,
        borderRadius: 1,
        ...brandFontsStyles.f15w400,
        textAlignVertical: 'top',
    },

    button: {
        width: '100%',
    },
    reviewAppText: {
        color: colors.text900,
        marginTop: 8,
        textAlign: 'center',
        fontSize: 16,
        lineHeight: 24,
    },
})
