import { memo, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { useDidUpdate } from '@mu-native/common'
import { FastImage, layoutHelpers } from '@mu-native/ds'
import { getAssetsForPreloadReselect } from '@mu-native/dynamic-decor'
import { useValues } from '@ug/store'

const styles = StyleSheet.create({
    absoluteContainer: {
        position: 'absolute',
        zIndex: -10000,
    },
    imageStyle: { width: 1, height: 1 },
})
export const PreloadDecorContainer = memo(() => {
    const [assetsForPreload] = useValues([getAssetsForPreloadReselect])
    const [isNeedUpdated, setIsNeedUpdated] = useState(false)
    const loadLength = useRef(0)

    const onLoadImageEnd = () => {
        loadLength.current += 1
    }

    useDidUpdate(() => {
        if (loadLength.current === assetsForPreload.length) {
            setIsNeedUpdated(prevState => !prevState)
            loadLength.current = 0
        }
    }, [assetsForPreload[0]])

    if (loadLength.current === assetsForPreload.length) return null

    return (
        <View style={styles.absoluteContainer}>
            {assetsForPreload.map((assetUri, index) => (
                <FastImage
                    style={styles.imageStyle}
                    onLoadEnd={onLoadImageEnd}
                    key={`${index.toString()}`}
                    source={layoutHelpers.getUriSourceByImageUrl(assetUri)}
                />
            ))}
        </View>
    )
})
