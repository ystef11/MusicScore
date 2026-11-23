import { memo, useState } from 'react'
import { Platform, StyleSheet } from 'react-native'
import { launchImageLibrary } from 'react-native-image-picker'
import { dismissFittedPresented } from 'react-native-sheet2'

import { omrTestIds } from '@mu/mu-mobile-test-id'
import { authStoreChunk, getIsAuthorized } from '@mu-native/auth'
import { platform } from '@mu-native/common'
import { AppText, layout, MuseButton, WarningContentView } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { marketingThunks, sources } from '@mu-native/marketing'
import { NavigationService, Screen } from '@mu-native/navigation'
import { OmrModalTypeEnum, omrStoreChunk } from '@mu-native/omr'
import { scoreStoreChunk, scoreThunks } from '@mu-native/score'
import { songbookStoreChunk } from '@mu-native/songbook'
import { keepLocalCopy, pick, types } from '@react-native-documents/picker'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../../../App/constants/MetricaEvents.ts'
import { getFileExtension } from '../../../../App/Services/FilesProvider.ts'
import reportEvent from '../../../../App/Utils/Analytics.ts'
import Utils from '../../../../App/Utils/Utils.ts'
import {
    MAX_OMR_FILES,
    MAX_OMR_PFG_TOTAL_SIZE,
    MAX_OMR_TOTAL_SIZE,
} from '../../helpers/pickPdfFilesHelper.ts'

interface Props {
    canUpload: boolean
}

const MSCZ_EXTENSIONS = ['mscz', 'mscze']

// New-concept (MUP-13624) "Add a score" sheet. Same upload entries as
// OmrSelectFormatContainer, except MSCZ and PDF are merged into a single
// "Browse files" action that dispatches by the picked file's extension.
export const OmrAddScoreContainer = memo((props: Props) => {
    const [error, setError] = useState<string | undefined>()
    const actions = useActions({
        setOmrModalType: omrStoreChunk.actions.setOmrModalType,
        checkIsProPlusLogicThunk: marketingThunks.checkIsProPlusLogicThunk,
        checkIsProLogicThunk: marketingThunks.checkIsProLogicThunk,
        setIsVisible: authStoreChunk.actions.setIsVisible,
        addPdf: omrStoreChunk.actions.addPdf,
        addPhoto: omrStoreChunk.actions.addPhoto,
        setShowStoragePermissionModal: scoreStoreChunk.actions.setShowStoragePermissionModal,
        openOfflineFile: scoreThunks.openOfflineFile,
    })
    const [orders, isAuth] = useValues([songbookStoreChunk.props.getOrderScores, getIsAuthorized])

    const requireAuth = (callback: () => void) => {
        if (!isAuth) {
            dismissFittedPresented()
            actions.setIsVisible(true)
            return
        }
        callback()
    }

    // OMR (photo/camera/PDF) entries need upload quota, or the Pro+ funnel.
    const requireUploadQuota = (callback: () => void) => {
        if (props.canUpload) {
            callback()
        } else {
            actions.checkIsProPlusLogicThunk({
                source: sources.scan,
                callbackAfterCheck: callback,
            })
        }
    }

    const pickPhotos = async () => {
        try {
            const result = await launchImageLibrary({
                selectionLimit: MAX_OMR_FILES,
                mediaType: 'photo',
            })
            if (!result.assets) return

            const MAX_FILE_SIZE = 5 * 1024 * 1024
            // eslint-disable-next-line no-restricted-syntax
            for (const asset of result.assets) {
                if ((asset.fileSize ?? 0) > MAX_FILE_SIZE) {
                    setError(translate('native.screen_omr.error_file_size_exceeds_5mb'))
                    return
                }
            }

            const totalSize = result.assets.reduce((sum, a) => sum + (a.fileSize ?? 0), 0)
            if (totalSize > MAX_OMR_TOTAL_SIZE) {
                setError(translate('native.screen_omr.error_total_size_exceeds_75mb'))
                return
            }

            // eslint-disable-next-line no-restricted-syntax
            for (const asset of result.assets) {
                if (!asset.uri) return
                actions.addPhoto(asset.uri)
            }
            dismissFittedPresented()
            NavigationService.navigate(Screen.screenOmrUploadPhotos)
        } catch (e) {
            console.log('[OmrAddScoreContainer.pickPhotos.error]', e)
        }
    }

    const onGalleryPress = () => {
        reportEvent('Temp Upload Type Click', { value: 'scan from photo' })
        requireAuth(() => requireUploadQuota(pickPhotos))
    }

    const onCameraPress = () => {
        reportEvent('Temp Upload Type Click', { value: 'scan from camera' })
        requireAuth(() =>
            requireUploadQuota(() => actions.setOmrModalType(OmrModalTypeEnum.OmrPhotoRules)),
        )
    }

    const openPickedMscz = (uri: string) => {
        const open = () => {
            dismissFittedPresented()
            actions.openOfflineFile(uri)
        }
        if (orders.length) {
            open()
            return
        }
        actions.checkIsProLogicThunk({
            featureText: 'marketing_text.songbook',
            source: sources.songbook,
            callbackAfterCheck: open,
        })
    }

    const openPickedPdf = (uri: string, size: number | null) => {
        requireUploadQuota(() => {
            if ((size ?? 0) > MAX_OMR_PFG_TOTAL_SIZE) {
                setError(translate('native.screen_omr.error_total_size_exceeds_50mb'))
                return
            }
            actions.addPdf(uri)
            dismissFittedPresented()
            NavigationService.navigate(Screen.screenOmrUploadPhotos)
        })
    }

    const browseFiles = async () => {
        try {
            const [document] = await pick({ type: [types.allFiles] })
            if (!document) return

            const extension = getFileExtension(document.name ?? document.uri).toLowerCase()
            const isMscz = MSCZ_EXTENSIONS.includes(extension)
            if (!isMscz && extension !== 'pdf') {
                setError(translate('native.new_concept.upload.invalid_file_error'))
                return
            }

            // On Android, content:// URIs from the document picker have temporary
            // read permission that expires before the file is consumed (and carry
            // no extension for the mscz flow). Copy to local storage first.
            let { uri } = document
            if (platform.isAndroid) {
                const [localFile] = await keepLocalCopy({
                    files: [
                        {
                            uri: document.uri,
                            fileName: document.name ?? `score.${extension}`,
                        },
                    ],
                    destination: 'cachesDirectory',
                })
                if (localFile?.status === 'success') uri = localFile.localUri
            }

            if (isMscz) {
                reportEvent('Temp Upload Type Click', { value: 'musescore_studio' })
                openPickedMscz(uri)
            } else {
                reportEvent('Temp Upload Type Click', { value: 'pdf' })
                openPickedPdf(uri, document.size)
            }
        } catch (e) {
            console.log('[OmrAddScoreContainer.browseFiles.error]', e)
        }
    }

    const onBrowsePress = () => {
        reportEvent('Temp Upload Type Click', { value: 'browse files' })
        requireAuth(() => {
            if (platform.isAndroid && parseInt(Platform.Version as string, 10) < 33) {
                Utils.onGrantStoragePermission(browseFiles, () => {
                    reportEvent(MetricaEvents.PERMISSION_STORAGE_REQUEST)
                    actions.setShowStoragePermissionModal(true)
                })
                return
            }
            browseFiles()
        })
    }

    return (
        <>
            <AppText
                testID={omrTestIds.selectFormat.chooseTitle}
                rawText={translate('native.new_concept.upload.title')}
                textAlign="center"
                adaptiveSize
                font="f44w400Accent"
            />
            <AppText
                rawText={translate('native.new_concept.upload.description')}
                textAlign="center"
                font="f15w500"
                brandColor="contentSecondary"
                style={styles.subtitle}
            />
            {!!error && (
                <>
                    <WarningContentView type="error" title={error} />
                    <AppText
                        style={styles.errorRecommendation}
                        font="f17w400"
                        lineHeight={24}
                        rawText={translate('native.screen_omr.error_recommendation')}
                    />
                </>
            )}
            <MuseButton
                testID={omrTestIds.selectFormat.uploadImageFromGalleryButton}
                title={translate('native.new_concept.upload.from_gallery')}
                type="secondary"
                onPress={onGalleryPress}
                style={styles.button}
            />
            <MuseButton
                testID={omrTestIds.selectFormat.scanFromPhotoButton}
                title={translate('native.new_concept.upload.scan_with_camera')}
                type="secondary"
                onPress={onCameraPress}
                style={styles.button}
            />
            <MuseButton
                testID={omrTestIds.selectFormat.uploadPdfButton}
                title={translate('native.new_concept.upload.browse_files')}
                type="secondary"
                onPress={onBrowsePress}
                style={styles.button}
            />
        </>
    )
})

const styles = StyleSheet.create({
    subtitle: {
        marginTop: layout.marginXm,
        marginBottom: layout.marginLg,
    },
    errorRecommendation: {
        marginBottom: layout.marginLg,
    },
    button: {
        marginBottom: layout.marginSm,
    },
})
