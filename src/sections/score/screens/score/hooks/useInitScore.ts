import { useEffect, useRef } from 'react'

import { generalModule, platform } from '@mu-native/common'
import { NavigationService, Screen, useNavigation } from '@mu-native/navigation'
import { Orientation, systemStoreChunk, useAppState } from '@mu-native/system'
import { useValues } from '@ug/store'

/**
 * Orientation the screen should be locked to while focused (phones only).
 * `null` keeps the legacy behaviour: unlock so the user can rotate freely.
 */
export type ScoreLockOrientation = 'landscape' | 'portrait' | null

export const useInitScore = (lockOrientation: ScoreLockOrientation = null) => {
    const navigation = useNavigation()
    const [keepAwake] = useValues([systemStoreChunk.props.getKeepAwake])
    useAppState(nextAppState => {
        if (nextAppState.match(/inactive|background/)) {
            generalModule.keepAwake(false)
        } else {
            generalModule.keepAwake(keepAwake)
        }
    })

    useEffect(() => {
        generalModule.keepAwake(keepAwake)
        return () => {
            generalModule.keepAwake(false)
        }
    }, [keepAwake])

    // Rotating mid-transition makes iOS cancel the push and pop the screen back,
    // so orientation is applied only once the screen has settled.
    const isTransitioningRef = useRef(true)

    // This effect must NOT lock back to portrait in its cleanup — otherwise
    // switching the DISPLAY MODE (which re-runs the effect) would flip to
    // landscape and immediately back to portrait. Restoring portrait on leave
    // is handled by the effect below.
    useEffect(() => {
        const applyOrientation = () => {
            // Tablets stay free to rotate.
            if (platform.isTablet) {
                Orientation.unlockAllOrientations()
                return
            }
            // Force and keep the requested orientation regardless of how the user
            // holds the phone. `null` = legacy behaviour: unlock after entry.
            if (lockOrientation === 'landscape') {
                Orientation.lockToLandscape()
            } else if (lockOrientation === 'portrait') {
                Orientation.lockToPortrait()
            } else {
                setTimeout(() => {
                    Orientation.unlockAllOrientations()
                }, 500)
            }
        }

        // @ts-expect-error - transitionStart event exists on native stack navigator
        const transitionStart = navigation.addListener('transitionStart', () => {
            isTransitioningRef.current = true
        })
        // @ts-expect-error - transitionEnd event exists on native stack navigator
        const transitionEnd = navigation.addListener('transitionEnd', () => {
            isTransitioningRef.current = false
            if (navigation.isFocused()) applyOrientation()
        })

        // A DISPLAY MODE change on an already settled screen triggers no
        // transition, so it applies right away.
        if (navigation.isFocused() && !isTransitioningRef.current) applyOrientation()

        return () => {
            transitionStart()
            transitionEnd()
        }
    }, [navigation, lockOrientation])

    // Restore portrait when leaving the screen (blur / unmount) on phones.
    useEffect(() => {
        const lock = () => {
            setTimeout(() => {
                const currentRoute = NavigationService.getTopRoute()
                const screens = [Screen.autoGradeOnboardingScreen, Screen.autogradeScreen]
                if (screens.includes(currentRoute?.name)) return
                if (!platform.isTablet) Orientation.lockToPortrait()
            }, 1000)
        }

        const blur = navigation.addListener('blur', lock)
        return () => {
            blur()
            lock()
        }
    }, [navigation])
}
