import React from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated'

import { scoreTestIds } from '@mu/mu-mobile-test-id'
import { platform } from '@mu-native/common'
import { FloatButton, layout, useAppSafeArea } from '@mu-native/ds'
import { chevronLeft } from '@mu-native/icons/chevronLeft'

import { useScoreExperiment } from '../scoreDetails/useScoreExperiment'

import { ScoreToolbar } from './ScoreToolbar'

type Props = {
    onClose: () => void
    isLoaded: boolean
}

export const ScoreHeaderButtons = React.memo(({ onClose, isLoaded }: Props) => {
    const { top: paddingTop } = useAppSafeArea({ top: 20 })
    const experiment = useScoreExperiment()
    const buttonSize = platform.isTablet ? 'large' : ('small' as const)

    const animatedStyle = useAnimatedStyle(() => {
        return { opacity: withTiming(experiment.headerType.visible ? 1 : 0, { duration: 250 }) }
    }, [experiment.headerType.visible])

    return (
        <Animated.View
            style={animatedStyle}
            pointerEvents={experiment.headerType.visible ? 'box-none' : 'none'}
        >
            <View
                style={[styles.container, { paddingTop: paddingTop + 20 }]}
                pointerEvents="box-none"
            >
                <FloatButton
                    onPress={onClose}
                    testID={scoreTestIds.scoreBack}
                    size={buttonSize}
                    endIcon={chevronLeft}
                />
                {isLoaded && <ScoreToolbar paddingTop={0} size={buttonSize} />}
            </View>
        </Animated.View>
    )
})

const styles = StyleSheet.create({
    container: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        flex: 1,
        marginHorizontal: layout.baseMarginFromEdges,
    },
})
