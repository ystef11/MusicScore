import React from 'react'
import Animated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated'

import { useIsPDFScoreDisplayed } from '../../hooks/useIsPDFScoreDisplayed'
import PianoKeyboard from '../piano/PianoKeyboard'
import { FloatingPlayerView } from '../scoreControl/FloatingPlayerView.tsx'

import { useScoreExperiment } from './useScoreExperiment.ts'

type TProps = {
    readonly dynamicOffset: SharedValue<number>
    readonly defaultOffset: number
    readonly bottom: number
}

export const ScoreControls = React.memo((props: TProps) => {
    const experiment = useScoreExperiment()
    const isPdf = useIsPDFScoreDisplayed()
    const { place } = experiment.keyboard
    const controlsAndKeyboardWrapperStyles = useAnimatedStyle(() => {
        const ignoreSafeArea = ['landscape', 'onTopOfSheet'].includes(place)
        const maxValueCompare = ignoreSafeArea ? 0 : props.bottom
        const bottom = Math.min(
            Math.max(props.dynamicOffset.value, maxValueCompare),
            props.defaultOffset,
        )
        const keyboardOffset = ['onTopOfSheet', 'landscape'].includes(place) ? 8 : 0
        return {
            position: 'absolute',
            bottom: bottom + keyboardOffset,
            left: 0,
            right: 0,
        }
    })

    return (
        <Animated.View style={controlsAndKeyboardWrapperStyles}>
            {experiment.controlsType.onTopOfBottomSheet.visible && <FloatingPlayerView />}
            {!isPdf && place === 'landscape' && <PianoKeyboard place="landscape" />}
            {!isPdf && place === 'onTopOfSheet' && <PianoKeyboard place="onTopOfSheet" />}
        </Animated.View>
    )
})
