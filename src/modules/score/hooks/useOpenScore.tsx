import { useCallback } from 'react'
import { Platform } from 'react-native'

import {
    getScoreInfoScreenFeatureFlag,
    registerScoreInfoScreenExp,
    useScoreInfoScreenFeatureFlag,
} from '@mu-native/ab'
import { store, type DispatchFun } from '@mu-native/common'
import { NavigationService, Screen, useAppNavigation } from '@mu-native/navigation'
import { useActions } from '@ug/store'

import { isScoreFromCatalog, type MSScoreT } from '../../../App/Model/MSScore'
import { scoreStoreChunk } from '../store/scoreStoreChunk'

type OpenScoreParams = Record<string, unknown>

/**
 * `isSuccessLoading` is store-wide and only cleared when a player screen unmounts, which a
 * native stack does after the dismiss animation. A player pushed before that would read the
 * previous score's `true` on its first render, so it is cleared on the way in.
 */
const resetPlayerLoadedFlag = () =>
    store.dispatch(scoreStoreChunk.actions.setIsSuccessLoading(false))

const canOpenScoreInfo = (score: MSScoreT) =>
    Platform.OS !== 'android' && !score.isPdf && !score.webSourceUrl && isScoreFromCatalog(score)

/**
 * Single entry point for opening a score from anywhere in the app (MUP-13932).
 *
 * Android opens the reader directly, with score information in its header.
 * Eligible scores on other platforms can open the Score Info experiment.
 */
export function useOpenScore() {
    const navigation = useAppNavigation()
    const showInfoScreen = useScoreInfoScreenFeatureFlag()
    const actions = useActions({ registerScoreInfoScreenExp })

    return useCallback(
        (score: MSScoreT, params?: OpenScoreParams) => {
            const isEligible = canOpenScoreInfo(score)

            if (isEligible) actions.registerScoreInfoScreenExp()

            const target = isEligible && showInfoScreen ? Screen.scoreInfo : Screen.score
            if (target === Screen.score) resetPlayerLoadedFlag()
            navigation.push(target, { score, ...params })
        },
        [navigation, showInfoScreen, actions],
    )
}

/**
 * Shortcut that jumps straight to the Score Play screen (practice), bypassing
 * the Score Info screen (MUP-13932). Used by the Play pill on library score
 * items. PDF scores have no interactive player, so callers should hide the
 * shortcut for them.
 */
export function useOpenScorePlay() {
    const navigation = useAppNavigation()

    return useCallback(
        (score: MSScoreT, params?: OpenScoreParams) => {
            resetPlayerLoadedFlag()
            navigation.push(Screen.scorePlay, { score, ...params })
        },
        [navigation],
    )
}

/**
 * Imperative variant of {@link useOpenScore} for use outside React components
 * (thunks, deep-link / offline-file handlers). `method` chooses push vs replace.
 */
export function navigateToScore(
    score: MSScoreT | { id: number; [key: string]: unknown },
    params?: OpenScoreParams,
    method: 'push' | 'replace' = 'push',
) {
    const isEligible = canOpenScoreInfo(score as MSScoreT)

    if (isEligible) (store.dispatch as DispatchFun)(registerScoreInfoScreenExp())

    const target = isEligible && getScoreInfoScreenFeatureFlag() ? Screen.scoreInfo : Screen.score
    if (target === Screen.score) resetPlayerLoadedFlag()
    NavigationService[method](target, { score, ...params })
}
