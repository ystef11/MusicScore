import { memo } from 'react'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'

import { AppText, brandColors, layoutHelpers } from '@mu-native/ds'
import { omrStoreChunk } from '@mu-native/omr'
import { useActions, useValues } from '@ug/store'

const styles = StyleSheet.create({
    photosContainer: {
        zIndex: 10,
        width: layoutHelpers.getResponsiveSizeExtended(60),
        height: layoutHelpers.getResponsiveSizeExtended(60),
        position: 'absolute',
        left: layoutHelpers.getResponsiveSizeExtended(20),
        bottom: layoutHelpers.getResponsiveSizeExtended(120),
    },
    currentPhotoStyle: {
        width: '100%',
        height: '100%',
    },
    badgePhotos: {
        backgroundColor: brandColors.accentPrimary,
        borderRadius: 50,
        width: layoutHelpers.getResponsiveSizeExtended(20),
        height: layoutHelpers.getResponsiveSizeExtended(20),
        position: 'absolute',
        zIndex: 10,
        right: layoutHelpers.getResponsiveSizeExtended(4),
        top: layoutHelpers.getResponsiveSizeExtended(4),
        justifyContent: 'center',
        alignItems: 'center',
    },
})

export const PhotosContainer = memo(() => {
    const actions = useActions({
        addPhoto: omrStoreChunk.actions.addPhoto,
        setCurrentPhoto: omrStoreChunk.actions.setCurrentPhoto,
        setIsEditMode: omrStoreChunk.actions.setIsEditMode,
    })
    const [photos] = useValues([omrStoreChunk.props.getPhotos])

    if (photos.length === 0) return null

    const lastPhoto = photos[photos.length - 1]

    const onPressPhoto = () => {
        actions.setIsEditMode(true)
        actions.setCurrentPhoto(lastPhoto)
    }

    return (
        <View style={styles.photosContainer}>
            <TouchableOpacity onPress={onPressPhoto}>
                <Image
                    source={{ uri: lastPhoto }}
                    resizeMode="cover"
                    style={styles.currentPhotoStyle}
                />
                <View style={styles.badgePhotos}>
                    <AppText
                        brandColor="backgroundDefault"
                        adaptiveSize
                        font="f15w400"
                        rawText={photos.length}
                    />
                </View>
            </TouchableOpacity>
        </View>
    )
})
