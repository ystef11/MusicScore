import { NativeModules, Platform } from 'react-native'
import { DispatchFun, GetStateFun } from '@mu-native/common'
import { nativeDismissFittedSheet, staticSafeArea } from '@mu-native/ds'
import { marketingStoreChunk, sources } from '@mu-native/marketing'
import {
    convertPageLayoutToScrollMode,
    getPlaybackPosition,
    ScorePageLayoutOptionKey,
    scoreStoreChunk,
} from '@mu-native/score'
import { xtz } from '@mu-native/xtz'

import MetricaEvents from '../../../../App/constants/MetricaEvents.ts'
import { getScoreMetaEvent } from '../../../../App/constants/scoreAnalytic.ts'
import { checkPremiumThunk } from '../../../../App/Controllers/ScoreActionsController.ts'
import reportEvent from '../../../../App/Utils/Analytics.ts'

const setNoteSize = (noteSize: number) => {
    return async (_: DispatchFun, getState: GetStateFun) => {
        const score = scoreStoreChunk.props.getCurrentScore(getState())
        xtz.setNoteSize(noteSize)
        reportEvent(MetricaEvents.SCORE_ZOOM_SET, {
            ...getScoreMetaEvent(score),
            'params.key': ['zoom_value'],
            'params.str_value': [`${noteSize}`],
            'params.value': [noteSize],
        })
    }
}

const setIsCursorVisible = (isVisible: boolean) => {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        xtz.setPlayHeadVisible(isVisible)
        dispatch(scoreStoreChunk.actions.setIsCursorVisible(isVisible))
    }
}

const toggleCursorVisibility = () => {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        const isVisible = scoreStoreChunk.props.getIsCursorVisible(getState())
        const score = scoreStoreChunk.props.getCurrentScore(getState())
        reportEvent(
            isVisible
                ? MetricaEvents.SCORE_CURSOR_TOGGLE_OFF
                : MetricaEvents.SCORE_CURSOR_TOGGLE_ON,
            getScoreMetaEvent(score),
        )
        xtz.setPlayHeadVisible(!isVisible)
        dispatch(scoreStoreChunk.actions.setIsCursorVisible(!isVisible))
    }
}

const toggleLoop = () => {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        const isEnabled = scoreStoreChunk.props.getIsLoopEnabled(getState())
        xtz.setLoopEnabled(!isEnabled)
        dispatch(scoreStoreChunk.actions.setIsLoopEnabled(!isEnabled))
    }
}

const getXtzMargins = (pageLayoutType: ScorePageLayoutOptionKey, isKeyboardVisible: boolean) => {
    const safeArea = staticSafeArea()
    const getBottomMargin = () => {
        if (pageLayoutType !== 'vertical') return 16
        return isKeyboardVisible ? 80 : 64
    }
    return {
        top: safeArea.top + 16,
        bottom: getBottomMargin(),
        left: 20 + safeArea.left,
        right: 20 + safeArea.right,
    }
}

const setPageLayoutType = (pageLayoutType: ScorePageLayoutOptionKey) => {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        const scrollMode = convertPageLayoutToScrollMode(pageLayoutType)
        xtz.setScrollMode(scrollMode)
        dispatch(scoreStoreChunk.actions.setPageLayoutType(pageLayoutType))

        const isKeyboardVisible = scoreStoreChunk.props.getIsKeyboardVisible(getState())
        xtz.setMargin(getXtzMargins(pageLayoutType, isKeyboardVisible))
    }
}

const setIsKeyboardVisible = (isKeyboardVisible: boolean) => {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        dispatch(scoreStoreChunk.actions.setIsKeyboardVisible(isKeyboardVisible))

        const pageLayoutType = scoreStoreChunk.props.getPageLayoutType(getState())
        if (pageLayoutType === 'vertical') {
            xtz.setMargin(getXtzMargins(pageLayoutType, isKeyboardVisible))
        }
    }
}

export function setTranspose(transposeDiff: number, quiet = false) {
    return (dispatch: DispatchFun, getState: GetStateFun) => {
        const MAX_TRANSPOSE_DIFF = 12
        const MIN_TRANSPOSE_DIFF = -12
        const state = getState()
        const isPro = marketingStoreChunk.props.getIsPro(state)

        const scoreId = scoreStoreChunk.props.getCurrentScore(state)?.id
        const isPlaying = scoreStoreChunk.props.getIsPlaying(state)
        const currentScore = scoreStoreChunk.props.getCurrentScore(state)

        const localPlayback = Platform.OS === 'android' && !!NativeModules.WebScoreSource && !currentScore?.isPdf
        if (!localPlayback && !isPro && !currentScore?.isPurchased) {
            if (quiet) return

            dispatch(
                marketingStoreChunk.actions.setPartialFieldsCustom({
                    featureText: 'marketing_text.transpose',
                    source: sources.transpose,
                    inAppForSale: currentScore,
                }),
            )
            // Dismiss whichever sheet the transpose control lives in before the
            // paywall opens, otherwise it renders behind an open sheet. Legacy
            // player uses the general settings sheet; the new Score Play View
            // (MUP-13932) uses the dedicated transpose sheet.
            nativeDismissFittedSheet('scoreSettingsSheet')
            nativeDismissFittedSheet('transposeSheet')

            dispatch(checkPremiumThunk())
            return
        }

        if (transposeDiff > MAX_TRANSPOSE_DIFF || transposeDiff < MIN_TRANSPOSE_DIFF) {
            return
        }

        dispatch(scoreStoreChunk.actions.setTranspose({ transposeDiff }))
        xtz.setTranspose(transposeDiff)

        if (!localPlayback) setTimeout(() => {
            if (isPlaying) {
                const playbackPosition = getPlaybackPosition(scoreId)(getState())
                xtz.setCurrentSecond(playbackPosition, true, true)
            }
        }, 1000)
        reportEvent(MetricaEvents.SCORE_TRANSPOSE, {
            ...getScoreMetaEvent(currentScore),
            'params.key': ['transpose_value'],
            'params.str_value': [`${transposeDiff}`],
            'params.value': [transposeDiff],
        })
    }
}

export const scoreMutationThunks = {
    setNoteSize,
    toggleCursorVisibility,
    toggleLoop,
    setPageLayoutType,
    setTranspose,
    setIsCursorVisible,
    setIsKeyboardVisible,
}
