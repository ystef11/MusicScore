import { useEffect } from 'react'
import { StyleSheet } from 'react-native'

import { brandColors, Loader } from '@mu-native/ds'
import { useNavigation } from '@mu-native/navigation'
import { Orientation } from '@mu-native/system'
import { useActions, useValues } from '@ug/store'

import autogradeScreenStoreChunk from '../store/autogradeScreenStoreChunk.ts'

const styles = StyleSheet.create({
    loader: {
        backgroundColor: brandColors.backgroundDefault,
    },
})

const ORIENTATION_ANIMATION_DURATION = 500

export const AutogradeLoadingOverlay = () => {
    const navigation = useNavigation()
    const [isLoaded, isClosing] = useValues([
        autogradeScreenStoreChunk.props.getIsLoaded,
        autogradeScreenStoreChunk.props.getGracefullyClosingScreen,
    ])

    const actions = useActions({
        ...autogradeScreenStoreChunk.actions,
    })

    // Wait for screen transition to finish, then lock orientation
    useEffect(() => {
        let orientationTimer: ReturnType<typeof setTimeout> | undefined

        // transitionEnd is available in native-stack but not typed in the generic navigation type
        // @ts-expect-error - transitionEnd event exists on native stack navigator
        const unsubscribe = navigation.addListener('transitionEnd', () => {
            // Screen transition is complete, lock to landscape
            Orientation.lockToLandscape()

            // Wait for orientation animation to complete before loading XTZ
            orientationTimer = setTimeout(() => {
                actions.setIsOrientationLocked(true)
            }, ORIENTATION_ANIMATION_DURATION)
        })

        return () => {
            unsubscribe()
            if (orientationTimer) {
                clearTimeout(orientationTimer)
            }
        }
    }, [navigation])

    useEffect(() => {
        if (isClosing) {
            setTimeout(() => {
                Orientation.unlockAllOrientations()
            }, 500)
        }
    }, [isClosing])

    if (isLoaded && !isClosing) return null

    return <Loader style={styles.loader} />
}
