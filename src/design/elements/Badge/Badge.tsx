import { memo } from 'react'
import { View, StyleSheet } from 'react-native'

import { colors } from '../../constants/colors'

const styles = StyleSheet.create({
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 12,
        backgroundColor: colors.error,
        zIndex: 100,
    },
})

type TBadgeProps = {
    translateX?: number
    translateY?: number
    color?: string
}

export const Badge = memo(
    ({ translateX = 0, translateY = 0, color = colors.colorNotification }: TBadgeProps) => (
        <View
            style={[
                styles.badge,
                { backgroundColor: color, transform: [{ translateX }, { translateY }] },
            ]}
        />
    ),
)
