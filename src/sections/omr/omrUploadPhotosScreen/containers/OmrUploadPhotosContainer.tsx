import { memo, useCallback, useEffect, useState } from 'react'
import { Dimensions, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import Pdf from 'react-native-pdf'

import {
    AppText,
    brandColors,
    globalStyles,
    Icon,
    layout,
    layoutHelpers,
    Loader,
    MuseButton,
    ProgressBar,
    staticSafeArea,
} from '@mu-native/ds'
import { checkmarkCircle } from '@mu-native/icons/checkmarkCircle'
import { chevronLeft } from '@mu-native/icons/chevronLeft'
import { closeCompact } from '@mu-native/icons/closeCompact'
import { translate } from '@mu-native/locale'
import { useAppNavigation } from '@mu-native/navigation'
import { omrStoreChunk } from '@mu-native/omr'
import { useActionsR, useValues } from '@ug/store'

import reportEvent from '../../../../App/Utils/Analytics.ts'
import NavigationService from '../../../../modules/navigation/services/NavigationService.ts'
import { sendOmrFilesThunk } from '../store/omrUploadScreenThunks.ts'

import { AiScanModalComponent } from './components/AiScanModalComponent.tsx'
import { CancelScanModalComponent } from './components/CancelScanModalComponent.tsx'

const GAP = layoutHelpers.getResponsiveSizeExtended(12)
const HORIZONTAL_PADDING = layout.baseMarginFromEdges * 2
const COLUMNS = 3
const IMAGE_WIDTH =
    (Dimensions.get('window').width - HORIZONTAL_PADDING - GAP * (COLUMNS - 1)) / COLUMNS

const DeleteButton = (props: { onPress?: () => void }) => (
    <TouchableOpacity onPress={props.onPress} style={styles.closePhotoContainer}>
        <Icon source={closeCompact} size={16} tint="white" style={styles.closeStyleIcon} />
    </TouchableOpacity>
)

export const OmrUploadPhotosContainer = memo(() => {
    const [didSendSuccess, setSendSuccess] = useState(false)
    const [photos, isLoading, pdfs, isOpenAiScanModalComponent, uploadProgress] = useValues([
        omrStoreChunk.props.getPhotos,
        omrStoreChunk.props.getIsLoading,
        omrStoreChunk.props.getPdfs,
        omrStoreChunk.props.getIsOpenAiScanModalComponent,
        omrStoreChunk.props.getUploadProgress,
    ])
    const actions = useActionsR({
        sendOmrFilesThunk,
        removedPhoto: omrStoreChunk.actions.removedPhoto,
        removedPdf: omrStoreChunk.actions.removedPdf,
        cleanup: omrStoreChunk.actions.cleanup,
    })
    const { pop } = useAppNavigation()

    const [isPaymentLayerWasShow, setIsPaymentLayerWasShow] = useState(false)

    const removedPhoto = useCallback(
        (photo: string) => () => {
            actions.removedPhoto(photo)
        },
        [actions],
    )

    const removedPdf = useCallback(
        (photo: string) => () => {
            actions.removedPdf(photo)
        },
        [actions],
    )

    useEffect(() => {
        if (photos.length || pdfs.length) {
            reportEvent('Temp Upload Step Show', { value: 'upload_success' })
        }

        return () => {
            if (!__DEV__) actions.cleanup()
        }
    }, [])

    const isReadyForScanning = photos.length || pdfs.length

    const uploadTitle = isReadyForScanning
        ? translate('native.screen_omr.file_uploading')
        : translate('native.screen_omr.upload_error')

    const onClose = useCallback(() => {
        console.log('[OmrUploadPhotosContainer.]', pdfs.length, photos.length)
        if (pdfs.length === 0 && photos.length === 0 && !isLoading) {
            pop(2)
            return
        }
        setIsPaymentLayerWasShow(prevState => !prevState)
    }, [isLoading, pdfs.length, photos.length, pop])

    const onSendPhotosPress = async () => {
        setSendSuccess(await actions.sendOmrFilesThunk())
    }

    if (didSendSuccess) {
        return (
            <View style={styles.base}>
                <View style={styles.header} />
                <Icon
                    source={checkmarkCircle}
                    tint={brandColors.statusSuccess}
                    size={72}
                    style={globalStyles.mb32}
                />
                <AppText
                    font="f44w400Accent"
                    rawText={translate('native.screen_omr.files_sent_title')}
                    textAlign="center"
                    style={globalStyles.mb32}
                />
                <AppText
                    font="f17w400"
                    rawText={translate('native.screen_omr.files_sent_description')}
                />
                <View style={globalStyles.flex1} />
                <MuseButton
                    onPress={() => {
                        NavigationService.goBack()
                    }}
                    title={translate('native.actions.okay')}
                    style={styles.button}
                />
            </View>
        )
    }

    return (
        <View style={styles.base}>
            <View style={styles.header}>
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={isLoading ? undefined : onClose}
                    style={styles.closeButton}
                >
                    <Icon source={chevronLeft} />
                </TouchableOpacity>
                <AppText
                    rawText={translate('native.screen_omr.ai_scan_title')}
                    textAlign="center"
                    font="f17w400"
                    style={styles.title}
                />
            </View>
            <ScrollView
                style={globalStyles.flex1FullWidth}
                contentContainerStyle={styles.uploadPhotosContainer}
                showsVerticalScrollIndicator={false}
            >
                <AppText
                    font="f44w400Accent"
                    rawText={
                        isReadyForScanning
                            ? uploadTitle
                            : translate('native.screen_omr.no_files_to_scan')
                    }
                    textAlign="center"
                    style={globalStyles.mb24}
                />
                {/* <ErrorBlockComponent */}
                {/*    isShow={isShowError} */}
                {/*    message={`Files are too large: maximum 20 MB \n(current - ${formatedSize})`} */}
                {/* /> */}
                <View style={styles.photosContainer}>
                    {!!pdfs.length &&
                        pdfs.map(p => (
                            <View key={p} style={styles.gridItem}>
                                <DeleteButton onPress={isLoading ? undefined : removedPdf(p)} />
                                <Pdf
                                    source={{ uri: p }}
                                    style={styles.pdf}
                                    showsHorizontalScrollIndicator={false}
                                    showsVerticalScrollIndicator={false}
                                    spacing={0}
                                    enableDoubleTapZoom={false}
                                    maxScale={1}
                                    minScale={0.5}
                                    onLoadProgress={e => {
                                        console.log('[OmrUploadPhotosContainer.progress]', e)
                                    }}
                                    onError={e => {
                                        console.log('[OmrUploadPhotosContainer.error]', e)
                                    }}
                                />
                            </View>
                        ))}
                    {photos.map((photo, index) => (
                        <View key={index} style={styles.gridItem}>
                            <DeleteButton onPress={isLoading ? undefined : removedPhoto(photo)} />
                            <Image
                                source={{ uri: photo }}
                                style={styles.gridItem}
                                resizeMode="cover"
                            />
                        </View>
                    ))}
                </View>
            </ScrollView>
            {isLoading && <Loader />}
            {isLoading && uploadProgress > 0 && (
                <View style={styles.progressContainer}>
                    <ProgressBar
                        progress={uploadProgress}
                        width={null}
                        color={brandColors.accentPrimary}
                        unfilledColor={brandColors.backgroundHighlight}
                        borderWidth={0}
                        height={6}
                        style={styles.progress}
                    />
                    <AppText
                        rawText={`${Math.round(uploadProgress * 100)}%`}
                        font="f13w400"
                        textAlign="center"
                        style={globalStyles.mt4}
                    />
                </View>
            )}
            <MuseButton
                onPress={onSendPhotosPress}
                title={translate('native.screen_omr.start_scanning')}
                disabled={!isReadyForScanning || isLoading}
                style={styles.button}
            />
            {isPaymentLayerWasShow && <CancelScanModalComponent onClose={onClose} />}
            {isOpenAiScanModalComponent && <AiScanModalComponent />}
        </View>
    )
})

const styles = StyleSheet.create({
    uploadPhotosContainer: {
        paddingTop: layoutHelpers.getResponsiveSizeExtended(24),
        width: '100%',
        paddingBottom: layoutHelpers.getResponsiveSizeExtended(120),
    },
    photosContainer: {
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: GAP,
        alignSelf: 'center',
    },
    gridItem: {
        width: IMAGE_WIDTH,
        aspectRatio: 3 / 4,
    },
    pdf: {
        width: '100%',
        height: '100%',
    },

    // eslint-disable-next-line react-native/no-color-literals
    closePhotoContainer: {
        zIndex: 10,
        position: 'absolute',
        right: layoutHelpers.getResponsiveSizeExtended(4),
        top: layoutHelpers.getResponsiveSizeExtended(4),
        width: 24,
        height: 24,
        backgroundColor: 'rgba(110,95,121, 0.6)',
        borderRadius: 50,
    },
    closeStyleIcon: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressContainer: {
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(20),
        paddingBottom: layoutHelpers.getResponsiveSizeExtended(12),
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: staticSafeArea().top,
        height: 44 + staticSafeArea().top,
        width: '100%',
    },

    base: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: layout.baseMarginFromEdges,
    },

    closeButton: {
        width: 44,
        height: 44,
        alignItems: 'flex-start',
        justifyContent: 'center',
        zIndex: 2,
    },

    title: {
        width: '100%',
        marginStart: -44,
    },

    button: {
        width: '100%',
        marginBottom: staticSafeArea().bottomWithAndroid,
    },

    progress: {
        width: '100%',
    },
})
