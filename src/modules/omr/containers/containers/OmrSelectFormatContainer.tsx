import { memo, useState } from 'react'
import { Platform } from 'react-native'
import { launchImageLibrary } from 'react-native-image-picker'
import { dismissFittedPresented } from 'react-native-sheet2'

import { omrTestIds } from '@mu/mu-mobile-test-id'
import { authStoreChunk, getIsAuthorized } from '@mu-native/auth'
import { platform } from '@mu-native/common'
import { AppText, globalStyles, MuseButton, WarningContentView } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { marketingThunks, sources } from '@mu-native/marketing'
import { NavigationService, Screen } from '@mu-native/navigation'
import { OmrModalTypeEnum, omrStoreChunk, pickPdfFiles } from '@mu-native/omr'
import { scoreStoreChunk } from '@mu-native/score'
import { songbookStoreChunk } from '@mu-native/songbook'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../../../App/constants/MetricaEvents.ts'
import reportEvent from '../../../../App/Utils/Analytics.ts'
import { openMsczFileManagerWithPermissions } from '../../../../App/Utils/FileManager.ts'
import Utils from '../../../../App/Utils/Utils.ts'
import { arePickedPhotosAvailable } from '../../helpers/checkPickedPhotosHelper.ts'
import {
    MAX_OMR_FILES,
    MAX_OMR_PFG_TOTAL_SIZE,
    MAX_OMR_TOTAL_SIZE,
} from '../../helpers/pickPdfFilesHelper.ts'

interface Props {
    canUpload: boolean
}

export const OmrSelectFormatContainer = memo((props: Props) => {
    const [error, setError] = useState<string | undefined>()
    const [isPhotoLoading, setIsPhotoLoading] = useState(false)
    const actions = useActions({
        setOmrModalType: omrStoreChunk.actions.setOmrModalType,
        checkIsProPlusLogicThunk: marketingThunks.checkIsProPlusLogicThunk,
        checkIsProLogicThunk: marketingThunks.checkIsProLogicThunk,
        setIsVisible: authStoreChunk.actions.setIsVisible,
        addPdf: omrStoreChunk.actions.addPdf,
        addPhoto: omrStoreChunk.actions.addPhoto,
        setShowStoragePermissionModal: scoreStoreChunk.actions.setShowStoragePermissionModal,
        openMsczFileManagerWithPermissions,
    })
    const [orders, isAuth] = useValues([songbookStoreChunk.props.getOrderScores, getIsAuthorized])

    const onPreSelectCheck = (callback: () => void) => {
        if (!isAuth) {
            dismissFittedPresented()
            actions.setIsVisible(true)
            return
        }
        if (props.canUpload) {
            callback()
        } else {
            actions.checkIsProPlusLogicThunk({
                source: sources.scan,
                callbackAfterCheck: () => {
                    callback()
                },
            })
        }
    }

    const _onPhotoPress = async () => {
        setError(undefined)
        setIsPhotoLoading(true)
        try {
            const result = await launchImageLibrary({
                selectionLimit: MAX_OMR_FILES,
                mediaType: 'photo',
            })
            if (result.didCancel) return
            if (
                result.errorCode ||
                !result.assets ||
                !(await arePickedPhotosAvailable(result.assets.map(a => a.uri)))
            ) {
                setError(translate('native.screen_omr.error_photo_unavailable'))
                return
            }

            const MAX_FILE_SIZE = 5 * 1024 * 1024
            // eslint-disable-next-line no-restricted-syntax
            for (const asset of result.assets) {
                console.log(
                    '[OmrSelectFormatContainer.onPhotoPress]',
                    asset.fileSize,
                    MAX_FILE_SIZE,
                )
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
            console.log('[OmrSelectFormatContainer.onPhotoPress.error]', e)
        } finally {
            setIsPhotoLoading(false)
        }
    }

    const onPhotoPress = () => {
        reportEvent('Temp Upload Type Click', { value: 'scan from photo' })
        onPreSelectCheck(() => _onPhotoPress())
    }

    const onCameraPress = () => {
        reportEvent('Temp Upload Type Click', { value: 'scan from camera' })
        onPreSelectCheck(() => actions.setOmrModalType(OmrModalTypeEnum.OmrPhotoRules))
    }

    const selectPdfLogic = async () => {
        try {
            if (!props.canUpload) {
                return
            }
            const result = await pickPdfFiles()
            if (!result.ok) {
                setError(result.error)
                return
            }
            if (result.files.length > 1) {
                setError(translate('native.screen_omr.error_max_one_pdf'))
                return
            }
            const totalSize = result.files.reduce((sum, a) => sum + (a.size ?? 0), 0)
            if (totalSize > MAX_OMR_PFG_TOTAL_SIZE) {
                setError(translate('native.screen_omr.error_total_size_exceeds_50mb'))
                return
            }
            result.files.forEach(f => actions.addPdf(f.uri))
            dismissFittedPresented()
            NavigationService.navigate(Screen.screenOmrUploadPhotos)
        } catch (e) {
            console.log('[OmrSelectFormatContainer.selectPdfLogic.error]', e)
        }
    }

    const _onPressPdf = () => {
        reportEvent('Temp Upload Type Click', { value: 'pdf' })

        if (platform.isAndroid) {
            if (parseInt(Platform.Version as string, 10) >= 33) {
                selectPdfLogic()
            } else {
                Utils.onGrantStoragePermission(selectPdfLogic, () => {
                    reportEvent(MetricaEvents.PERMISSION_STORAGE_REQUEST)
                    actions.setShowStoragePermissionModal(true)
                })
            }

            return
        }
        selectPdfLogic()
    }
    const onPressPdf = async () => {
        onPreSelectCheck(() => _onPressPdf())
    }

    const runMsczFlow = async () => {
        try {
            await actions.openMsczFileManagerWithPermissions()
            dismissFittedPresented()
        } catch (e) {
            console.log('[OmrSelectFormatContainer.onPressMscz.error]', e)
        }
    }

    const onPressMscz = () => {
        reportEvent('Temp Upload Type Click', { value: 'musescore_studio' })

        if (orders.length) {
            runMsczFlow()
            return
        }

        actions.checkIsProLogicThunk({
            featureText: 'marketing_text.songbook',
            source: sources.songbook,
            callbackAfterCheck: runMsczFlow,
        })
    }

    return (
        <>
            <AppText
                testID={omrTestIds.selectFormat.chooseTitle}
                rawText={translate('native.screen_omr.choose_title')}
                textAlign="center"
                adaptiveSize
                font="f44w400Accent"
                style={globalStyles.mb24}
            />
            {!!error && (
                <>
                    <WarningContentView type="error" title={error} />
                    <AppText
                        style={globalStyles.mb24}
                        font="f17w400"
                        lineHeight={24}
                        rawText={translate('native.screen_omr.error_recommendation')}
                    />
                </>
            )}
            <MuseButton
                testID={omrTestIds.selectFormat.uploadMuseScoreStudioButton}
                title={translate('native.screen_omr.upload_musescore_studio_score')}
                type="secondary"
                onPress={onPressMscz}
                style={globalStyles.mb8}
            />
            <MuseButton
                testID={omrTestIds.selectFormat.uploadPdfButton}
                title={translate('native.screen_omr.upload_pdf_file')}
                type="secondary"
                onPress={onPressPdf}
                style={globalStyles.mb8}
            />
            <MuseButton
                testID={omrTestIds.selectFormat.uploadImageFromGalleryButton}
                title={translate('native.screen_omr.upload_image_from_gallery')}
                type="secondary"
                onPress={onPhotoPress}
                isLoading={isPhotoLoading}
                style={globalStyles.mb8}
            />
            <MuseButton
                testID={omrTestIds.selectFormat.scanFromPhotoButton}
                title={translate('native.screen_omr.scan_from_photo')}
                type="secondary"
                onPress={onCameraPress}
                style={globalStyles.mb8}
            />
        </>
    )
})
