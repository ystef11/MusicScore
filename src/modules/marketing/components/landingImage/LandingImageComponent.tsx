import { memo } from 'react'
import { Image, ImageStyle, StyleSheet, View } from 'react-native'

import { layout, layoutHelpers, style } from '@mu-native/ds'
import { dynamicDecorStoreChunk } from '@mu-native/dynamic-decor'
import { useValues } from '@ug/store'

const styles = StyleSheet.create({
    landingImageStyle: {
        width: '100%',
        marginBottom: layoutHelpers.getResponsiveSizeExtended(layout.marginXm),
    },
    emptyBlock: {
        height: layoutHelpers.getResponsiveSizeExtended(20),
    },
})

const getDynamicImageStyle = (sftIconStyle: ImageStyle) => [
    styles.landingImageStyle,
    { height: layoutHelpers.getResponsiveSizeExtended((sftIconStyle?.height as number) || 100) },
    !!sftIconStyle && sftIconStyle,
]

const LandingImageComponent = () => {
    const [{ sft_icon: sftIcon, sftIconStyle }] = useValues([
        dynamicDecorStoreChunk.props.getActiveDecorData,
    ])

    if (!sftIcon) return <View style={styles.emptyBlock} />
    return (
        <Image
            style={getDynamicImageStyle(sftIconStyle)}
            source={layoutHelpers.getUriSourceByImageUrl(sftIcon)}
            resizeMode="contain"
        />
    )
}

export default memo(LandingImageComponent)
