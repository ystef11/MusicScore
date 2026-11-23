import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useDerivedValue,
    withTiming,
} from 'react-native-reanimated'
import {
    Camera,
    CameraDevice,
    CameraRuntimeError,
    Point,
    useCameraFormat,
} from 'react-native-vision-camera'

import { platform } from '@mu-native/common'
import {
    brandColors,
    CommonTouchable,
    globalStyles,
    layoutHelpers,
    Loader,
    MuseButton,
} from '@mu-native/ds'
import { bolt } from '@mu-native/icons/bolt'
import { boltOff } from '@mu-native/icons/boltOff'
import { send } from '@mu-native/icons/send'
import { Screen, useAppNavigation } from '@mu-native/navigation'
import { omrStoreChunk } from '@mu-native/omr'
import { useIsFocused } from '@react-navigation/native'
import { useActions, useValues } from '@ug/store'

import reportEvent from '../../../../../App/Utils/Analytics.ts'
import SentryUtils from '../../../../../App/Utils/Sentry'
import { CloseLayerCircle } from '../components/CloseLayerCircle.tsx'
import { NoCameraComponent } from '../components/NoCameraComponent.tsx'

import { isCameraUnavailable, isFocusUnsupported } from './cameraErrors'
import { PhotosContainer } from './containers/PhotosContainer.tsx'
import { PreviewPhotoContainer } from './containers/PreviewPhotoContainer.tsx'
import { isFocusCancelled } from './focusCancelled'

// The session can also stall without reporting anything, and the screen has no
// other way out of the loader.
const PREVIEW_START_TIMEOUT = 10000

const styles = StyleSheet.create({
    circleButtonStyle: {
        position: 'absolute',
        width: layoutHelpers.getResponsiveSizeExtended(48),
        borderRadius: 50,
        zIndex: 10,
        alignItems: 'center',
    },
    flashIconStyle: {
        top: layoutHelpers.getResponsiveSizeExtended(60),
        right: layoutHelpers.getResponsiveSizeExtended(20),
    },
    takePhotoStyle: {
        alignSelf: 'center',
        bottom: layoutHelpers.getResponsiveSizeExtended(36),
    },
    // eslint-disable-next-line react-native/no-color-literals
    shutterRing: {
        width: 72,
        height: 72,
        borderRadius: 36,
        borderWidth: 2,
        borderColor: brandColors.exceptionConstantWhite,
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    shutterDisc: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: brandColors.exceptionConstantWhite,
    },
    switchCameraStyle: {
        top: layoutHelpers.getResponsiveSizeExtended(60),
        right: layoutHelpers.getResponsiveSizeExtended(80),
    },
    sendButtonStyle: {
        right: layoutHelpers.getResponsiveSizeExtended(20),
        bottom: layoutHelpers.getResponsiveSizeExtended(50),
    },
})

export const CameraContainer = memo(({ device }: { device: CameraDevice }) => {
    const isActive = useIsFocused()
    const { goBack, navigate } = useAppNavigation()

    const [photos] = useValues([omrStoreChunk.props.getPhotos])
    const actions = useActions({
        switchCamera: omrStoreChunk.actions.switchCamera,
        setCurrentPhoto: omrStoreChunk.actions.setCurrentPhoto,
        clearOnUnmount: omrStoreChunk.actions.clearOnUnmount,
    })

    const [isActiveCamera, setIsActiveCamera] = useState(false)
    const [hasSessionError, setHasSessionError] = useState(false)
    const [isFlash, setIsFlash] = useState(false)
    const cameraRef = useRef<Camera>(null)
    const opacityModal = useDerivedValue(() =>
        withTiming(isActiveCamera && isActive ? 1 : 0, { duration: 200 }),
    )
    const opacityModalStyle = useAnimatedStyle(() => ({
        opacity: opacityModal.value,
    }))

    useEffect(() => {
        reportEvent('Temp Upload Step Show', {
            value: 'scanner',
        })
        return () => {
            actions.clearOnUnmount({})
        }
    }, [])

    useEffect(() => {
        const isWaitingForPreview = isActive && !isActiveCamera && !hasSessionError
        const timer = isWaitingForPreview
            ? setTimeout(() => setHasSessionError(true), PREVIEW_START_TIMEOUT)
            : undefined

        return () => clearTimeout(timer)
    }, [isActive, isActiveCamera, hasSessionError])

    const onSwitchFlash = () => {
        setIsFlash(prevFlash => !prevFlash)
    }

    const onSwitchCamera = () => {
        actions.switchCamera({})
    }

    const onCameraInitialized = () => {
        setIsActiveCamera(true)
    }

    const onCameraError = (error: CameraRuntimeError) => {
        if (!isCameraUnavailable(error)) SentryUtils.sendMessage('cameraSession', error)
        // Recovery only happens while the preview runs; before that the screen would
        // sit on the loader forever.
        if (!isActiveCamera) setHasSessionError(true)
    }

    const takePhoto = async () => {
        try {
            const file = await cameraRef?.current?.takePhoto({
                flash: isFlash && device.hasFlash ? 'on' : 'off',
            })

            if (file?.path)
                actions.setCurrentPhoto(platform.isAndroid ? `file://${file.path}` : file.path)
        } catch (error) {
            // Nobody awaited this either, and a shutter that fails on a session that
            // never started leaves the user pressing a button that does nothing.
            SentryUtils.sendMessage('takePhoto', error)
            if (!isActiveCamera) setHasSessionError(true)
        }
    }

    const onOpenUploadScreen = () => {
        navigate(Screen.screenOmrUploadPhotos)
    }

    const focus = useCallback(
        (point: Point) => {
            if (!device.supportsFocus) return
            // Nobody awaited this, so a rejected focus became an unhandled one.
            cameraRef?.current?.focus(point).catch((error: unknown) => {
                if (isFocusCancelled(error) || isFocusUnsupported(error)) return
                SentryUtils.sendMessage('cameraFocus', error)
            })
        },
        [device],
    )

    const gesture = Gesture.Tap().onEnd(({ x, y }) => {
        runOnJS(focus)({ x, y })
    })

    const format = useCameraFormat(
        device,
        platform.isIos
            ? [{ photoResolution: 'max', videoResolution: 'max' }]
            : [{ photoResolution: { width: 1080, height: 1920 } }, { photoAspectRatio: 1.9 }],
    )

    if (hasSessionError) return <NoCameraComponent goBack={goBack} />

    return (
        <View style={StyleSheet.absoluteFill}>
            <Animated.View style={[StyleSheet.absoluteFill, opacityModalStyle]}>
                <GestureDetector gesture={gesture}>
                    <Camera
                        ref={cameraRef}
                        style={StyleSheet.absoluteFill}
                        device={device}
                        photo
                        preview={isActive}
                        isActive={isActive}
                        onPreviewStarted={onCameraInitialized}
                        onError={onCameraError}
                        photoQualityBalance="speed"
                        enableZoomGesture
                        outputOrientation="preview"
                        format={format}
                    />
                </GestureDetector>
            </Animated.View>
            {!isActiveCamera && <Loader />}
            <CloseLayerCircle goBack={goBack} />
            <PreviewPhotoContainer />
            <PhotosContainer />
            <CommonTouchable
                style={[styles.circleButtonStyle, styles.takePhotoStyle]}
                isHapticEnabled
                onPress={takePhoto}
            >
                <View style={styles.shutterRing}>
                    <View style={styles.shutterDisc} />
                </View>
            </CommonTouchable>
            {device.hasFlash && (
                <MuseButton
                    style={[globalStyles.absolute, styles.flashIconStyle]}
                    type="secondary"
                    onPress={onSwitchFlash}
                    startIcon={isFlash ? bolt : boltOff}
                />
            )}
            <MuseButton
                style={[globalStyles.absolute, styles.sendButtonStyle]}
                type="secondary"
                disabled={photos.length === 0}
                startIcon={send}
                onPress={onOpenUploadScreen}
            />
        </View>
    )
})
