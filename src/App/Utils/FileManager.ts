import { Alert } from 'react-native'

import { translate } from '@mu-native/locale'
import { scoreStoreChunk, scoreThunks } from '@mu-native/score'
import { pick, types } from '@react-native-documents/picker'

import MetricaEvents from '../constants/MetricaEvents'
import { isOfflineScoreArchive } from '../Controllers/SongBookController'
import { getFileExtension } from '../Services/FilesProvider'

import reportEvent from './Analytics'
import { isPickerCancelled } from './pickerCancelled'
import { isAndroid, systemVersion } from './Platform'
import Utils from './Utils'

const openableExtensions = ['mscze', 'mscz']

export function checkByOpenableExtension(fileExtension: string): boolean {
    return openableExtensions.includes(fileExtension.toLowerCase())
}

export function serveFileManager() {
    return async (dispatch: (...args: Array<any>) => any) => {
        reportEvent(MetricaEvents.FILE_MANAGER_SERVE)
        try {
            const [selected] = await pick({ type: [types.allFiles] })
            if (!selected) return
            reportEvent(MetricaEvents.FILE_MANAGER_RESOLVE)
            const name = selected.name ?? selected.uri
            const fileExt = getFileExtension(name)
            if (isOfflineScoreArchive(name) || checkByOpenableExtension(fileExt)) {
                await dispatch(scoreThunks.openOfflineFile(selected.uri, false, name))
            } else {
                Alert.alert(translate('native.library.songbook.wrong_file_extension', { fileExt }))
            }
        } catch (error) {
            if (!isPickerCancelled(error)) {
                Alert.alert(translate('native.score.error_opening_file'),
                    error instanceof Error ? error.message : undefined)
            }
        }
    }
}

export function openMsczFileManagerWithPermissions() {
    return async (dispatch: (...args: Array<any>) => any) => {
        if (isAndroid) {
            const [majorVersion] = systemVersion.split('.')

            if (parseInt(majorVersion, 10) >= 10) {
                await dispatch(serveFileManager())
            } else {
                await Utils.onGrantStoragePermission(
                    () => dispatch(serveFileManager()),
                    () => {
                        reportEvent(MetricaEvents.PERMISSION_STORAGE_REQUEST)
                        dispatch(scoreStoreChunk.actions.setShowStoragePermissionModal(true))
                    },
                )
            }
        } else {
            await dispatch(serveFileManagerIOS())
        }
    }
}

export function serveFileManagerIOS() {
    return async (dispatch: (...args: Array<any>) => any) => {
        reportEvent(MetricaEvents.FILE_MANAGER_SERVE)

        let picked
        try {
            picked = await pick({ type: [types.allFiles] })
        } catch (error) {
            // Two of the three call sites dispatch this without awaiting it, so a
            // rejection here became an unhandled one (IOS-4NS1).
            if (isPickerCancelled(error)) return
            throw error
        }

        const filePath = picked?.[0]?.uri

        if (filePath) {
            reportEvent(MetricaEvents.FILE_MANAGER_RESOLVE)
            const fileExt = getFileExtension(filePath)
            const isOpenableFile = checkByOpenableExtension(fileExt)

            if (isOpenableFile) {
                dispatch(scoreThunks.openOfflineFile(filePath))
            } else {
                Alert.alert(translate('native.library.songbook.wrong_file_extension', { fileExt }))
            }
        }
    }
}
