import { unzip } from 'react-native-zip-archive'

import * as RNFS from '@dr.pogodin/react-native-fs'
import { DownloadFileOptionsT } from '@dr.pogodin/react-native-fs'

export const fileSystem = {
    paths: {
        cachesDirectory: RNFS.CachesDirectoryPath,
        documentDirectory: RNFS.DocumentDirectoryPath,
        downloadDirectory: RNFS.DownloadDirectoryPath,
        externalCachesDirectory: RNFS.ExternalCachesDirectoryPath,
        externalDirectory: RNFS.ExternalDirectoryPath,
        externalStorageDirectory: RNFS.ExternalStorageDirectoryPath,
        fileProtectionKeys: RNFS.FileProtectionKeys,
        libraryDirectory: RNFS.LibraryDirectoryPath,
        mainBundle: RNFS.MainBundlePath,
        picturesDirectory: RNFS.PicturesDirectoryPath,
        temporaryDirectory: RNFS.TemporaryDirectoryPath,
    },
    delete: RNFS.unlink,
    downloadFile: (options: DownloadFileOptionsT) => {
        const { promise } = RNFS.downloadFile(options)
        return promise
    },
    exists: RNFS.exists,
    createDirectory: RNFS.mkdir,
    readDirectory: RNFS.readDir,
    writeFile: RNFS.writeFile,
    unzipFile: unzip,
}
