import { NativeModules, Platform } from 'react-native'
import { useCallback, useEffect, useRef } from 'react'

import { marketingStoreChunk, sources } from '@mu-native/marketing'
import { scoreStoreChunk, scoreThunks, TPlaybackStatus } from '@mu-native/score'
import { useActions, useValues } from '@ug/store'

import { checkPremiumThunk } from '../../../../../App/Controllers/ScoreActionsController.ts'
import reportEvent from '../../../../../App/Utils/Analytics'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { getScoreMetaEvent } from '../helpers/scoreHelpers.ts'

export const useOnPressPlayHandler = () => {
    const timeout = useRef<ReturnType<typeof setTimeout>>(null)
    const [
        score,
        isPro,
        isKeyboardVisible,
        pageLayoutType,
        playbackStatus,
        isPlaying,
        isAutoScrollModalShown,
        openScoreCount,
    ] = useValues([
        scoreStoreChunk.props.getCurrentScore,
        marketingStoreChunk.props.getIsPro,
        scoreStoreChunk.props.getIsKeyboardVisible,
        scoreStoreChunk.props.getPageLayoutType,
        scoreStoreChunk.props.getPlaybackStatus,
        scoreStoreChunk.props.getIsPlaying,
        scoreStoreChunk.props.getIsAutoScrollModalShown,
        scoreStoreChunk.props.getOpenScoreCount,
    ])
    const actions = useActions({
        markAutoScrollModalShown: scoreStoreChunk.actions.setIsAutoScrollModalShown,
        setPartialFieldsCustom: marketingStoreChunk.actions.setPartialFieldsCustom,
        togglePlay: scoreThunks.toggleScorePlay,
        setIsAutoScrollOfferVisible: scoreStoreChunk.actions.setIsAutoScrollOfferVisible,
        checkPremiumThunk,
    })
    const prevPlaybackStatus = useRef<TPlaybackStatus>(TPlaybackStatus.STATE_EMPTY)

    useEffect(() => {
        if (!prevPlaybackStatus.current && playbackStatus && timeout.current) {
            clearTimeout(timeout.current)
        }
        prevPlaybackStatus.current = playbackStatus
    }, [playbackStatus])

    const showPaymentModalKeyboard = useCallback(() => {
        actions.setPartialFieldsCustom({
            source: sources.keyboard,
            inAppForSale: score,
            featureText: 'marketing_text.keyboard',
        })
        actions.checkPremiumThunk()
    }, [])
    const showPaymentModalAutoScroll = useCallback(() => {
        actions.setPartialFieldsCustom({
            source: sources.autoScroll,
            inAppForSale: score,
            featureText: 'marketing_text.auto_scroll',
        })
        actions.checkPremiumThunk()
    }, [])

    const onPressPlay = useCallback(() => {
        if (timeout.current) {
            clearTimeout(timeout.current)
        }

        reportEvent(isPlaying ? RT_EVENTS.SCORE_PLAY_PAUSE : RT_EVENTS.SCORE_PLAY_CLICK, {
            ...getScoreMetaEvent(score),
            'params.key': ['is_keyboard_active'],
            'params.str_value': [`${isKeyboardVisible}`],
            'params.value': [+isKeyboardVisible],
        })

        if (Platform.OS === 'android' && NativeModules.WebScoreSource && !score?.isPdf) {
            actions.togglePlay()
            return
        }

        if (playbackStatus === TPlaybackStatus.STATE_PLAYING) {
            actions.togglePlay()
        } else if (isKeyboardVisible) {
            if (isPro || score?.isPurchased) {
                actions.togglePlay()
            } else {
                showPaymentModalKeyboard()
            }
        } else if (pageLayoutType === 'vertical') {
            if (isPro || score?.isPurchased) {
                actions.togglePlay()
            } else {
                actions.togglePlay()

                timeout.current = setTimeout(() => {
                    actions.togglePlay()
                    showPaymentModalAutoScroll()
                }, 20000)
            }
        } else if (!isAutoScrollModalShown && openScoreCount === 2) {
            actions.markAutoScrollModalShown(true)
            actions.setIsAutoScrollOfferVisible(true)
        } else {
            actions.togglePlay()
        }
    }, [
        playbackStatus,
        isKeyboardVisible,
        isPro,
        score?.isPurchased,
        pageLayoutType,
        isAutoScrollModalShown,
        openScoreCount,
        showPaymentModalAutoScroll,
        showPaymentModalKeyboard,
        isPlaying,
    ])

    return onPressPlay
}
