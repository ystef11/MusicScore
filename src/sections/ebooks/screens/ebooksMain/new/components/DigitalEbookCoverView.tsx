import { memo } from 'react'
import { Image, ImageStyle, StyleProp, StyleSheet, View } from 'react-native'

import { brandColors } from '@mu-native/ds'

type Props = {
    uri: string | undefined | null
    style?: StyleProp<ImageStyle>
    testID?: string
}

export const DigitalEbookCoverView = memo(({ uri, style, testID }: Props) => {
    if (!uri) return <View testID={testID} style={[style, styles.base]} />
    return <Image testID={testID} source={{ uri }} style={[style, styles.base]} />
})

const styles = StyleSheet.create({
    base: {
        borderWidth: 1,
        borderColor: brandColors.strokeDefault,
        overflow: 'hidden',
        backgroundColor: brandColors.strokeDefault,
        borderRadius: 2,
    },
})
