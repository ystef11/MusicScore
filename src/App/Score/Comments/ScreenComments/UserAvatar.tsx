import { memo } from 'react'
import { Image, ImageSourcePropType, StyleSheet } from 'react-native'

import { style } from '@mu-native/ds'

const styles = StyleSheet.create({
    image: style.image({
        width: 44,
        height: 44,
        borderRadius: 22,
    }),
})

const UserAvatar = ({ source }: { source: ImageSourcePropType }) => {
    return <Image source={source} style={styles.image} />
}

export default memo(UserAvatar)
