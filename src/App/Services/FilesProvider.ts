import type { DownloadFileOptionsT, DownloadResultT, ReadDirResItemT } from '@dr.pogodin/react-native-fs'
import * as RNFS from '@dr.pogodin/react-native-fs'

import { fileSystem } from '@mu-native/common'

import { decrypt, KEY } from '../Utils/Crypto'
import { isIOS } from '../Utils/Platform'
import SentryUtils from '../Utils/Sentry'

import { isTransportFailure } from './downloadFailure'
import { isFileNotFoundError } from './fileErrors'
import {
    hasZipEndOfCentralDirectory,
    isZipArchive,
    ZIP_MAGIC_BYTES,
    ZIP_TAIL_BYTES,
} from './zipIntegrity'

type EncodingT = 'utf8' | 'base64' | 'ascii'

export function getFileExtension(filePath: string): string {
    if (typeof filePath !== 'string') return ''
    const lastPath = filePath.split('/').pop() ?? ''
    if (!lastPath.includes('.')) return ''
    return lastPath.split('.').pop() ?? ''
}

export function normalizeFilePath(filePath: string): string {
    return isIOS ? filePath.replace(/^file:\/\//, '') : filePath
}

/* RNFS Wrapper functions */
export async function readDir(path: string) {
    try {
        return await RNFS.readDir(path)
    } catch (error) {
        return null
    }
}

async function ensureParentDirExists(filePath: string) {
    const splitted = filePath.split('/')
    const parentFolder = splitted.splice(0, splitted.length - 1).join('/')
    if (await RNFS.exists(parentFolder)) return
    await RNFS.mkdir(parentFolder)
}

export async function writeFile(
    filePath: string,
    contents: string,
    encodingOrOptions: EncodingT = 'utf8',
) {
    try {
        await RNFS.writeFile(filePath, contents, encodingOrOptions)
        return true
    } catch (error) {
        SentryUtils.sendMessage('writeFile', error, { filePath })
        return false
    }
}

export async function copyFile(filePath: string, destPath: string) {
    try {
        const normalizedFilePath = normalizeFilePath(filePath)
        if (await RNFS.exists(destPath)) {
            await RNFS.unlink(destPath)
        }
        await RNFS.copyFile(normalizedFilePath, destPath)
    } catch (error) {
        throw new Error('copyFile', {
            cause: JSON.stringify({ error: error?.toString(), filePath, destPath }),
        })
    }
}

/**
 * В проекте использовалось JS шифрование  для того, чтобы избежать перемещения файла из кэша на другие устройства.
 * Шифрование отключил, но у пользователей остальсь зашифрованые файлы, поэтому этот метод определяет их.
 * Отключение шифрование исправило крэши
 */
export function checkIsDecoded(content: string) {
    /**
     * base64 у скоров имеет одинаковый вид 5 шт, поэтому смотрим на первые 5 символов.
     */
    return ['//48A', 'UEsDB', 'WFRaA', '/v8AP'].includes(content?.slice(0, 5))
}

async function readFile(
    filePath: string,
    encodingOrOptions: EncodingT = 'utf8',
): Promise<string | null | undefined> {
    if (!filePath) {
        SentryUtils.sendMessage('readFile', new Error('readFile: filePath is empty'), { filePath })
        return null
    }
    try {
        return await RNFS.readFile(filePath, encodingOrOptions)
    } catch (error) {
        SentryUtils.sendMessage('readFile', error, { filePath })
    }
    return null
}

export async function checkIsJsEncryptedBase64(url: string): Promise<string | undefined> {
    if (!url) {
        SentryUtils.sendMessage('checkIsJsEncryptedBase64', new Error('url is empty'), { url })
        return undefined
    }
    try {
        const content = await readFile(url, 'base64')
        if (!content) throw new Error('checkIsJsEncryptedBase64', { cause: 'readFile' })
        const currentExtension = getFileExtension(url)
        // console.log('#debug base64: ', content)
        /**
         * base64 у скоров имеет одинаковый вид 5 шт, поэтому смотрим на первые 5 символов.
         */
        const isDecoded = checkIsDecoded(content)
        switch (currentExtension) {
            case 'mscz':
                return isDecoded ? content : decrypt(KEY, content)
            default:
                return content
        }
    } catch (error) {
        SentryUtils.sendMessage('checkIsJsEncryptedBase64', error, { url })
    }
    return undefined
}

export async function exists(filePath: string): Promise<boolean | null | undefined> {
    if (!filePath) return null
    return RNFS.exists(filePath)
}

export async function mkdir(dirName: string) {
    try {
        await RNFS.mkdir(dirName)
    } catch (error) {
        SentryUtils.sendMessage('mkdir', error, { dirName })
    }
}

export async function rmdir(dirPath: string) {
    try {
        await RNFS.unlink(dirPath)
    } catch (error) {
        SentryUtils.sendMessage('rmdir', error, { dirPath })
    }
}

export async function downloadFile(
    downloadFileOptions: DownloadFileOptionsT,
): Promise<DownloadResultT | null | undefined> {
    try {
        const downloadedFile = RNFS.downloadFile({
            connectionTimeout: 30000,
            ...downloadFileOptions,
        })

        if (downloadedFile && downloadedFile.promise) {
            return await downloadedFile.promise
        }

        return null
    } catch (error) {
        SentryUtils.sendMessage('downloadFile', error, { downloadFileOptions })
    }

    return null
}

const stripQuery = (url: string | undefined) => (url ? url.split('?')[0] : url)

async function startDownload(downloadFileOptions: DownloadFileOptionsT) {
    await ensureParentDirExists(downloadFileOptions.toFile)
    // The announced size only reaches us through this callback, and callers
    // need it to tell a complete download from one that ended early.
    let contentLength: number | undefined
    const downloadedFile = RNFS.downloadFile({
        connectionTimeout: 30000,
        ...downloadFileOptions,
        begin: result => {
            contentLength = result.contentLength
            downloadFileOptions.begin?.(result)
        },
    })

    return { ...(await downloadedFile.promise), contentLength }
}

function describeDownloadError(error: unknown, downloadFileOptions: DownloadFileOptionsT) {
    const failure = new Error('downloadFile2', {
        // Score file urls are signed: report where it was going, not the
        // signature (MUP-14310). The code carries the domain, which the
        // localized message does not.
        cause: JSON.stringify({
            error: error?.toString(),
            code: (error as { code?: unknown })?.code,
            ...downloadFileOptions,
            fromUrl: stripQuery(downloadFileOptions.fromUrl),
        }),
    })

    // A download the network killed is not a defect of ours: keep the cause
    // for triage, but let the report filter drop it.
    if (isTransportFailure(error)) Object.assign(failure, { networkFailure: true })

    return failure
}

export async function downloadFile2(
    downloadFileOptions: DownloadFileOptionsT,
): Promise<
    | { type: 'success'; data: DownloadResultT & { contentLength?: number } }
    | { type: 'error'; error: any }
> {
    try {
        return { type: 'success', data: await startDownload(downloadFileOptions) }
    } catch (error) {
        if (!isFileNotFoundError(error)) {
            return { type: 'error', error: describeDownloadError(error, downloadFileOptions) }
        }
    }

    // The target folder lives in the cache, which Android trims under storage
    // pressure, folder and all, between our check and the file being opened.
    try {
        return { type: 'success', data: await startDownload(downloadFileOptions) }
    } catch (error) {
        return { type: 'error', error: describeDownloadError(error, downloadFileOptions) }
    }
}

/**
 * Whether the file on disk is a complete archive: a zip must end with its
 * end-of-central-directory record, anything else passes (see isZipArchive).
 * A file that is not there answers false — there is nothing to vouch for, and
 * the caller says which score it was (MUP-14308).
 * Returns true when the check itself fails for any other reason — a broken
 * check must not block a file that may well be fine.
 */
export async function isCompleteZip(filePath: string): Promise<boolean> {
    try {
        const { size } = await RNFS.stat(filePath)
        const fileSize = Number(size)
        const length = Math.min(ZIP_TAIL_BYTES, fileSize)
        if (length <= 0) return false

        // Scores arrive as XTZ containers ("XTZ\0"), which the engine unwraps
        // into the archive itself — only a plain zip can be checked from here.
        if (!isZipArchive(await RNFS.read(filePath, ZIP_MAGIC_BYTES, 0, 'base64'))) return true

        return hasZipEndOfCentralDirectory(
            await RNFS.read(filePath, length, fileSize - length, 'base64'),
        )
    } catch (error) {
        // A file that is not there cannot be vouched for, and it is not worth
        // reporting either: the caller fails right after with a cause that says
        // which score it was.
        if (isFileNotFoundError(error)) return false

        SentryUtils.sendMessage('isCompleteZip', error, { filePath })

        return true
    }
}

export async function unlink(filePath: string) {
    try {
        await RNFS.unlink(filePath)
    } catch (error) {
        SentryUtils.sendMessage('unlink', error, { filePath })
    }
}

export async function moveFile(filepath: string, destPath: string) {
    try {
        await ensureParentDirExists(destPath)
        // NSFileManager refuses to move onto an existing file (NSCocoaErrorDomain
        // 516) where Android's rename replaces it, so clear the destination to
        // give both platforms the same replace semantics. Two opens of one score
        // race here — the Score Info preview downloads while Play downloads too —
        // and on iOS the loser used to fail with globalDownloadFail (MUP-14163).
        if (await RNFS.exists(destPath)) await RNFS.unlink(destPath)
        await RNFS.moveFile(filepath, destPath)
        return true
    } catch (error) {
        SentryUtils.sendMessage('moveFile', error, { filepath, destPath })
        return false
    }
}

/* ----- ----- */
function removeOtherFiles(files: { path: string }[], skipIndex: number) {
    files.forEach((file, index) => {
        if (index !== skipIndex) {
            unlink(file.path)
        }
    })
}

export function getDirectoryByFileName(files: ReadDirResItemT[], fileName: string): ReadDirResItemT {
    const skipIndex = files.findIndex(_file => _file.name === fileName)
    const directory = files[skipIndex]
    removeOtherFiles(files, skipIndex)
    return directory
}

export async function unzipArchive(sourceFile: string, targetFolder: string) {
    try {
        await fileSystem.unzipFile(sourceFile, targetFolder)
        return true
    } catch (error) {
        SentryUtils.sendMessage('unzipArchive', error, { sourceFile, targetFolder })
        return null
    }
}
