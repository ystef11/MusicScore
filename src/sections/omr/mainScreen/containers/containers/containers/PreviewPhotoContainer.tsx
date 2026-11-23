import { memo, useEffect } from 'react'
import { Image, StyleSheet, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'

import { layoutHelpers, MuseButton, staticSafeArea } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { useAppNavigation } from '@mu-native/navigation'
import { omrStoreChunk } from '@mu-native/omr'
import { useActions, useValues } from '@ug/store'

import reportEvent from '../../../../../../App/Utils/Analytics.ts'
import { CloseLayerCircle } from '../../components/CloseLayerCircle.tsx'

const styles = StyleSheet.create({
    containerPreviewPhoto: {
        zIndex: 100,
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    currentPhotoStyle: { width: '100%', height: '100%' },
    buttonContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(20),
        paddingBottom: staticSafeArea().bottomWithAndroid + layoutHelpers.getResponsiveSizeExtended(16),
        gap: layoutHelpers.getResponsiveSizeExtended(12),
    },
    button: { width: '100%' },
})

export const PreviewPhotoContainer = memo(() => {
    const actions = useActions({
        addPhoto: omrStoreChunk.actions.addPhoto,
        setCurrentPhoto: omrStoreChunk.actions.setCurrentPhoto,
        deleteLastPhoto: omrStoreChunk.actions.deleteLastPhoto,
    })
    const [currentPhoto] = useValues([omrStoreChunk.props.getCurrentPhoto])
    const { goBack } = useAppNavigation()

    const deleteCurrentPhoto = () => {
        reportEvent('Temp Scanner Approval Click', {
            value: 'discard',
        })
        actions.deleteLastPhoto({})
        actions.setCurrentPhoto('')
    }

    const onPressAddPhoto = () => {
        reportEvent('Temp Scanner Approval Click', {
            value: 'accept',
        })
        actions.addPhoto(currentPhoto)
        actions.setCurrentPhoto('')
    }

    useEffect(() => {
        if (currentPhoto) {
            reportEvent('Temp Upload Step Show', {
                value: 'scanner_approval',
            })
        }
    }, [currentPhoto])

    if (!currentPhoto) return null

    return (
        <Animated.View entering={FadeInDown.duration(500)} style={styles.containerPreviewPhoto}>
            <Image
                source={{ uri: currentPhoto }}
                resizeMode="cover"
                style={styles.currentPhotoStyle}
            />
            <View style={styles.buttonContainer}>
                <MuseButton
                    onPress={onPressAddPhoto}
                    type="primary"
                    title={translate('native.screen_omr.upload')}
                    style={styles.button}
                />
                <MuseButton
                    onPress={deleteCurrentPhoto}
                    type="secondary"
                    title={translate('native.screen_omr.retake_photo')}
                    style={styles.button}
                />
            </View>
            <CloseLayerCircle goBack={goBack} />
        </Animated.View>
    )
})
