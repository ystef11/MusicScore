import { memo } from 'react'
import { Image, StyleSheet, TouchableOpacity } from 'react-native'

import { icons, layoutHelpers } from '@mu-native/ds'

type TProps = {
    onPress(): void
}

export const DebugButtonComponent = ({ onPress }: TProps) => (
    <TouchableOpacity style={styles.container} onPress={onPress}>
        <Image style={styles.icon} source={icons.bug} />
    </TouchableOpacity>
)

export const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        right: 0,
        top: layoutHelpers.getResponsiveSize(26),
        zIndex: 2,
    },
    icon: {
        height: layoutHelpers.getResponsiveSize(44),
        resizeMode: 'contain',
        width: layoutHelpers.getResponsiveSize(44),
    },
})

export default memo(DebugButtonComponent)
