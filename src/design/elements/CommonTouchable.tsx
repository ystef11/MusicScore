import { forwardRef, PropsWithChildren } from 'react'
import {
    StyleProp,
    TouchableOpacity,
    TouchableOpacityProps,
    type ViewInstance,
    ViewStyle,
} from 'react-native'

import { haptic } from '../utils/haptic'

type TProps = {
    readonly isHapticEnabled?: boolean
    readonly hitSlop?: number
    readonly onPress?: () => void
    readonly style?: StyleProp<ViewStyle>
    readonly disabled?: TouchableOpacityProps['disabled']
    readonly activeOpacity?: TouchableOpacityProps['activeOpacity']
    readonly testID?: TouchableOpacityProps['testID']
    readonly onLongPress?: TouchableOpacityProps['onLongPress']
    readonly onPressIn?: TouchableOpacityProps['onPressIn']
    readonly onPressOut?: TouchableOpacityProps['onPressOut']
    readonly onLayout?: TouchableOpacityProps['onLayout']
    readonly accessible?: TouchableOpacityProps['accessible']
}

export const CommonTouchable = forwardRef<ViewInstance, PropsWithChildren<TProps>>(
    (
        {
            children,
            onPress,
            isHapticEnabled = false,
            activeOpacity,
            style,
            hitSlop,
            disabled,
            testID,
            onLongPress,
            onPressIn,
            onPressOut,
            onLayout,
            accessible,
        },
        ref,
    ) => {
        const innerOnPress = () => {
            if (!onPress) return
            if (isHapticEnabled) haptic('impactLight')
            onPress?.()
        }

        return (
            <TouchableOpacity
                ref={ref}
                hitSlop={hitSlop}
                disabled={disabled}
                testID={testID}
                onLongPress={onLongPress}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                onLayout={onLayout}
                accessible={accessible}
                style={[style, { opacity: activeOpacity ?? 1 }]}
                activeOpacity={activeOpacity ?? 0.8}
                onPress={onPress ? innerOnPress : undefined}
            >
                {children}
            </TouchableOpacity>
        )
    },
)
