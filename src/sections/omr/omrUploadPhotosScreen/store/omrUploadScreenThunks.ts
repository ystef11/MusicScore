import { NativeModules, Platform } from 'react-native'

import * as fs from '@dr.pogodin/react-native-fs'
import { apiRequest, isResponse, omrContracts } from '@mu-native/api'
import type { TMultipartFile } from '@mu-native/api'
import { TThunkActionR } from '@mu-native/common'
import { showAlertNotification } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { checkFileSizeHelper, omrStoreChunk } from '@mu-native/omr'

import { omrUploadErrorMessage } from './omrUploadError'

const convertHeicToJpeg = async (uri: string): Promise<string> => {
    if (Platform.OS !== 'ios') return uri
    try {
        return await NativeModules.HeicToJpegModule.convertToJpeg(uri)
    } catch {
        return uri
    }
}

const logFileSize = async (kind: string, uri: string) => {
    if (!__DEV__) return
    const stat = await fs.stat(uri)
    console.log(`[OmrUpload] ${kind} file`, { uri, size: checkFileSizeHelper(Number(stat.size)) })
}

const toPdfPart = async (uri: string): Promise<TMultipartFile> => {
    await logFileSize('PDF', uri)
    return { uri, name: 'pdfFile', type: 'application/pdf' }
}

const toPhotoPart = async (uri: string): Promise<TMultipartFile> => {
    await logFileSize('Photo', uri)
    const convertedUri = await convertHeicToJpeg(uri)
    return { uri: convertedUri, name: 'photo', type: 'image/jpeg' }
}

const errorTitle = async (error: unknown): Promise<string | undefined> => {
    if (isResponse(error)) return omrUploadErrorMessage(await error.text().catch(() => ''))
    return error?.toString()
}

export const sendOmrFilesThunk: TThunkActionR<boolean> = () => async (dispatch, getState) => {
    try {
        dispatch(omrStoreChunk.actions.setIsLoading(true))
        dispatch(omrStoreChunk.actions.setUploadProgress(0))

        const pdfs = omrStoreChunk.props.getPdfs(getState())
        const photos = omrStoreChunk.props.getPhotos(getState())

        const file = await Promise.all(pdfs.map(toPdfPart))
        // One HEIC conversion at a time: the iOS module decodes a full bitmap per file.
        const photoParts: TMultipartFile[] = []
        // eslint-disable-next-line no-restricted-syntax
        for (const photo of photos) {
            // eslint-disable-next-line no-await-in-loop
            photoParts.push(await toPhotoPart(photo))
        }

        const onProgress = (progress: number) => {
            console.log('[OmrUpload] Progress', `${Math.round(progress * 100)}%`)
            dispatch(omrStoreChunk.actions.setUploadProgress(progress))
        }

        const res = photoParts.length
            ? await apiRequest(omrContracts.uploadPhotos, {
                  payload: { 'files[]': photoParts, file },
                  onProgress,
              })
            : await apiRequest(omrContracts.uploadPdf, { payload: { file }, onProgress })

        if (res.id) {
            dispatch(omrStoreChunk.actions.addOmrIdsScanning(res.id))
            return true
        }
        showAlertNotification({ title: translate('native.screen_omr.error_uploading_file') })
        return false
    } catch (error) {
        console.log('[OmrUploadScreenThunks.error]', error)
        showAlertNotification({
            title:
                (await errorTitle(error)) || translate('native.screen_omr.error_uploading_files'),
        })
        return false
    } finally {
        dispatch(omrStoreChunk.actions.setIsLoading(false))
        dispatch(omrStoreChunk.actions.setUploadProgress(0))
    }
}
