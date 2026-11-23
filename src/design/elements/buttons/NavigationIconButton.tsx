import { memo } from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'

import Icon, { type IconSource } from '../../components/Icon/Icon'
import { brandColors } from '../../constants/new/brandColors'
import { CommonTouchable } from '../CommonTouchable'

type Props = {
    icon?: IconSource
    onPress?: () => void
    color?: string
    isVisible?: boolean
    onLongPress?: () => void
    styles?: StyleProp<ViewStyle>
    testID?: string
    showBadge?: boolean
    isHapticEnabled?: boolean
}

export const NavigationIconButton = memo(
    ({
        onPress,
        color,
        isVisible = true,
        onLongPress,
        styles: style = {},
        showBadge = false,
        isHapticEnabled = false,
        testID,
        icon,
    }: Props) => {
        const imageStyle = {
            opacity: isVisible ? 1 : 0,
        }
        return (
            <CommonTouchable
                isHapticEnabled={isHapticEnabled}
                testID={testID}
                onPress={onPress}
                onLongPress={onLongPress}
                style={
                    [
                        style,
                        {
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 44,
                            height: 44,
                        },
                    ] as any
                }
            >
                {!!icon && (
                    <Icon
                        source={icon}
                        style={[imageStyle, styles.baseIconStyle]}
                        tint={color ?? brandColors.contentPrimary}
                    />
                )}

                {showBadge && <View style={styles.counterContainer} />}
            </CommonTouchable>
        )
    },
)

const styles = StyleSheet.create({
    counterContainer: {
        minWidth: 14,
        height: 14,
        borderRadius: 100,
        backgroundColor: brandColors.accentPrimary,
        position: 'absolute',
        top: 2,
        right: 4,
        borderWidth: 2,
        borderColor: brandColors.backgroundDefault,
    },

    baseIconStyle: {
        alignItems: 'center',
        justifyContent: 'center',
    },
})
