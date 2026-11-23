import React from 'react'
import { StyleProp, ViewStyle } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'

import { globalStyles } from '../../constants/layout'

type TRootViewComponent = {
    duration?: number
    withExiting?: boolean
    children: React.ReactNode
    style?: StyleProp<ViewStyle>
    delay?: number
}

export const FadeAnimationComponent = ({
    duration = 600,
    children,
    withExiting = true,
    style,
    delay = 0,
}: TRootViewComponent) => (
    <Animated.View
        style={[globalStyles.flex1FullWidth, style]}
        entering={FadeIn.duration(duration).delay(delay)}
        {...(withExiting && { exiting: FadeOut.duration(duration) })}
    >
        {children}
    </Animated.View>
)
