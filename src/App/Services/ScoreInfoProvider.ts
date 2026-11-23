import * as RNFS from '@dr.pogodin/react-native-fs'

import {
    ApiErrorCodes,
    apiRequest,
    apiStoreChunk,
    attestApp,
    notifyRequestStart,
    scoreContracts,
} from '@mu-native/api'
import { getStoreValue } from '@mu-native/common'
import { ensureNetwork } from '@mu-native/system'
import { xtz } from '@mu-native/xtz'

import ScoreRestriction from '../../App/constants/ScoreRestriction'
import UsageMode from '../constants/UsageMode'

import '../Model/MSScore'
import { createMSOfflineScore, MSOfflineScoreT } from '../Model/MSOfflineScore'
import type { MSScoreT } from '../Model/MSScore'
import MSScoreInfo from '../Model/MSScoreInfo'

import {
    copyFile,
    downloadFile2,
    exists,
    getFileExtension,
    isCompleteZip,
    moveFile,
    readDir,
    unlink,
} from './FilesProvider'
import { describeDownloadFailure } from './downloadFailure'
import { createSingleFlight } from './singleFlight'
import { isTruncatedDownload } from './zipIntegrity'
import { saveWebScoreOffline, usesWebScoreCache } from './WebScoreProvider'

const documentDirectoryPath = RNFS.DocumentDirectoryPath
const cacheDirectoryPath = `${RNFS.TemporaryDirectoryPath}/Cached`

export function getLocalScoreDirectoryPath(isOffline: boolean) {
    return isOffline ? documentDirectoryPath : cacheDirectoryPath
}

export function getLocalScoreRelativePath(filePath: string, isOffline: boolean): string {
    return `${getLocalScoreDirectoryPath(isOffline)}/${filePath}`
}

export function getScoreFileName(scoreId: number, revision: number, fileType: string) {
    let fileName = String(scoreId)
    if (revision) fileName += `-${revision}`
    if (fileType) fileName += `.${fileType}`
    return fileName
}

export function getScoreFileUrl(scoreId: number, revision: number, fileType: string) {
    return getLocalScoreRelativePath(getScoreFileName(scoreId, revision, fileType), false)
}

export function getTemporaryPdfScoreFileUrl(scoreId: number, revision: number) {
    return `${cacheDirectoryPath}/temp-${scoreId}${revision ? `-${revision}` : ''}.pdfe`
}

export function getOfflineScoreFileUrl(scoreId: number, revision: number, fileType: string) {
    return getLocalScoreRelativePath(getScoreFileName(scoreId, revision, fileType), true)
}

export function getScoreNameParts(name: string) {
    if (!name.match(/^(.*[/])?(.+)[.](mscz|pdf|mscze|pdfe)$/)) return null
    const filePath = RegExp.$1
    const fileName = RegExp.$2
    const fileType = RegExp.$3
    const [identifier, revision = null] = fileName.split('-')
    return {
        filePath,
        fileName,
        fileType,
        identifier,
        revision,
    }
}

export async function getExistingScoreUrl(scoreId: number, isOffline: boolean) {
    const files = await readDir(getLocalScoreDirectoryPath(isOffline))
    if (!Array.isArray(files)) return null
    const scoreFile = files
        .filter(file => {
            if (!file.isFile()) return false
            const nameParts = getScoreNameParts(file.name)
            if (!nameParts) return false
            return nameParts.identifier === String(scoreId)
        })
        .sort((a, b) => Number(getScoreNameParts(a.name)?.revision) -
            Number(getScoreNameParts(b.name)?.revision))
        .pop()
    if (scoreFile) return scoreFile.path
    return null
}

export async function performGerScoreMetadataRequest(id: string) {
    let f = getStoreValue(apiStoreChunk.props.getF)
    if (!f && (await attestApp())) {
        f = getStoreValue(apiStoreChunk.props.getF)
    }
    if (!f) {
        return null
    }
    const { entity_id } = await apiRequest(scoreContracts.link, { params: { score_id: id, f } })
    return entity_id
}

export async function performGetScoreInfoRequest(
    scoreId: number,
    usage: keyof typeof UsageMode,
    shouldCheckConnection = false,
    presentConnectionAlert = true,
): Promise<MSScoreInfo> {
    if (shouldCheckConnection) await ensureNetwork(presentConnectionAlert)
    const response = await apiRequest(scoreContracts.info, {
        params: { id: scoreId, usage: usage.toLowerCase() as Lowercase<typeof usage> },
    })
    const errorOrScore = MSScoreInfo.processSourceData(response)
    if (typeof errorOrScore === 'string') {
        throw new Error(ApiErrorCodes.globalErrorParseResponse, { cause: errorOrScore })
    }
    return errorOrScore
}

export async function requestSimilarScores(scoreId: number) {
    return apiRequest(scoreContracts.similar, { params: { score_id: scoreId, full_models: 1 } })
}

async function removeFileIfExists(filePath: string) {
    if (await exists(filePath)) await unlink(filePath)
}

/**
 * Remove a score file from the cache directory. Used to drop corrupted files
 * (e.g. a partial download the engine failed to open) so the next open
 * re-downloads the score instead of hitting the same broken file forever.
 * Files outside the cache directory (offline scores) are left untouched.
 */
export async function deleteCachedScoreFile(filePath: string) {
    if (!filePath.startsWith(`${cacheDirectoryPath}/`)) return
    await removeFileIfExists(filePath)
}

const scoreDownloads = createSingleFlight()

/**
 * One score can be asked for twice at once — the Score Info preview downloads
 * while Play downloads too — and both writes land on the same temp file, so the
 * second caller finds it already renamed and fails with ENOENT (MUP-14163 fixed
 * the destination half of this race, not the temp file). One download per score
 * revision at a time, shared by every caller.
 */
export async function downloadScore(scoreInfo: MSScoreInfo, refresh = false): Promise<string> {
    const { id, isPdf } = scoreInfo.score

    return scoreDownloads(`${id}:${scoreInfo.revision}:${isPdf ? 'pdf' : 'mscz'}:${refresh}`, () =>
        performScoreDownload(scoreInfo, refresh),
    )
}

async function performScoreDownload(scoreInfo: MSScoreInfo, refresh: boolean): Promise<string> {
    const { score, revision } = scoreInfo
    const existingUrl = refresh ? null : await getExistingScoreUrl(score.id, false)

    if (existingUrl) {
        const cachedRevision = Number(getScoreNameParts(existingUrl)?.revision)
        if ((revision || 0) === cachedRevision) return existingUrl
    }

    const { isPdf, id } = scoreInfo.score
    const fileType = isPdf ? 'pdfe' : 'mscze'
    const fromUrl = scoreInfo.fileUrl(fileType)
    const toFile = isPdf
        ? getTemporaryPdfScoreFileUrl(id, revision)
        : getScoreFileUrl(id, revision, 'mscz')
    // Download into a temporary name and rename to the final one only after the
    // download fully succeeds. An interrupted download (e.g. network loss) must
    // never leave a partial file under the final name — getExistingScoreUrl
    // would keep serving that corrupted file on every next open, and the xtz
    // bridge crashes on it (fatal "JSON Parse error: Unexpected end of input").
    const tempFile = `${toFile}.${refresh ? 'refresh' : 'download'}`
    // Bypasses getApi(), so it reports itself to the Network Requests observer. Only the
    // transfer: the cache check above and the integrity checks below are not network.
    const finishRequest = notifyRequestStart(`download/score/${isPdf ? 'pdf' : 'mscz'}`)
    let downloadResult: Awaited<ReturnType<typeof downloadFile2>>
    try {
        downloadResult = await downloadFile2({ fromUrl, toFile: tempFile })
    } finally {
        finishRequest?.()
    }

    if (downloadResult.type !== 'success') {
        await removeFileIfExists(tempFile)
        throw downloadResult.error
    }

    if (downloadResult.data.statusCode !== 200) {
        await removeFileIfExists(tempFile)
        throw new Error(`Error download scoreId: ${id}`, {
            cause: describeDownloadFailure({
                id,
                statusCode: downloadResult.data.statusCode,
                url: fromUrl,
            }),
        })
    }

    // RNFS can report success for a file that is no longer on disk: another pass
    // of the same download renamed it (the single flight above makes that far
    // less likely, not impossible), or the OS reclaimed the cache directory —
    // both `cache/` on Android and `tmp/` on iOS are the system's to clear. Say
    // so once here instead of failing twice further down, in isCompleteZip and
    // then moveFile, with an ENOENT that names neither the score nor the reason
    // (MUP-14308).
    // exists() is the one FS helper that does not swallow its own failure, and a
    // raw rejection here would skip the cleanup below.
    if (!(await exists(tempFile).catch(() => false))) {
        throw new Error(ApiErrorCodes.globalDownloadFail, { cause: `tempGone[${id}]` })
    }

    // A connection dropped after the response headers leaves RNFS reporting
    // success for a partial body, so "downloaded" is not the same as "complete"
    // (MUP-14163). Verify before the file takes its final name, otherwise the
    // truncated archive is cached and every later open crashes in the xtz
    // bridge, where JSON.parse runs on empty meta outside any JS stack.
    const { bytesWritten, contentLength } = downloadResult.data
    if (isTruncatedDownload(bytesWritten, contentLength)) {
        await removeFileIfExists(tempFile)
        throw new Error(ApiErrorCodes.globalDownloadFail, {
            cause: `truncated[${id}] ${bytesWritten}/${contentLength}`,
        })
    }

    // Chunked responses carry no Content-Length, so the archive itself is the
    // only remaining witness. PDFs are not zips and are checked by xtz.prepare.
    if (!isPdf && !(await isCompleteZip(tempFile))) {
        await removeFileIfExists(tempFile)
        throw new Error(ApiErrorCodes.globalDownloadFail, { cause: `incompleteZip[${id}]` })
    }

    if (refresh) {
        try {
            if (!isPdf) {
                await RNFS.moveFile(tempFile, toFile)
                return toFile
            }
            const stagedPdf = `${toFile}.refresh.pdf`
            try {
                xtz.prepare(tempFile, stagedPdf)
                if (!(await RNFS.stat(stagedPdf)).size) throw new Error(ApiErrorCodes.globalDownloadFail)
                const target = getScoreFileUrl(id, revision, 'pdf')
                await RNFS.moveFile(stagedPdf, target)
                return target
            } finally {
                await removeFileIfExists(stagedPdf)
            }
        } finally {
            await removeFileIfExists(tempFile)
        }
    }

    const isMoved = await moveFile(tempFile, toFile)
    if (!isMoved) {
        await removeFileIfExists(tempFile)
        throw new Error(ApiErrorCodes.globalDownloadFail, { cause: `moveFile[${toFile}]` })
    }

    if (isPdf) {
        const persistPath = getScoreFileUrl(id, revision, 'pdf')
        xtz.prepare(toFile, persistPath)
        await RNFS.unlink(toFile)
        return persistPath
    }
    return toFile
}

export async function downloadScoreFile(score: MSScoreT, usageMode: keyof typeof UsageMode) {
    return downloadScore(await performGetScoreInfoRequest(score.id, usageMode, true))
}

export function createOfflineScoreModel(score: MSScoreT | MSOfflineScoreT): MSOfflineScoreT {
    const { id, title, authorName } = score
    return createMSOfflineScore({ id, title, authorName, source: score, options: score })
}

export async function createOfflineScore(score: MSScoreT): Promise<MSOfflineScoreT> {
    const { id } = score
    if (usesWebScoreCache(score)) {
        await saveWebScoreOffline(score)
        return createOfflineScoreModel({ ...score, webScoreSaved: true })
    }
    if (await getExistingScoreUrl(id, true)) return createOfflineScoreModel(score)
    const cached = await getExistingScoreUrl(id, false)
    const file = cached ?? await downloadScoreFile(score, 'OFFLINE')
    await saveOfflineScoreFile(score, file)
    return createOfflineScoreModel(score)
}

export async function saveOfflineScoreFile(score: MSScoreT, file: string) {
    const revision = Number(getScoreNameParts(file)?.revision) || 0
    const target = getOfflineScoreFileUrl(score.id, revision, getFileExtension(file))
    const staged = `${target}.new`
    try {
        await copyFile(file, staged)
        await RNFS.moveFile(staged, target)
    } finally {
        await removeFileIfExists(staged)
    }
}

export async function removeLocalScoreFiles(scoreId: number, offline: boolean) {
    const files = await RNFS.readDir(getLocalScoreDirectoryPath(offline))
    await Promise.all(files.filter(file => file.isFile() &&
        getScoreNameParts(file.name)?.identifier === String(scoreId),
    ).map(file => RNFS.unlink(file.path)))
}

export async function hasScoreRestriction(
    scoreId: number,
    restriction: keyof typeof ScoreRestriction,
): Promise<boolean> {
    try {
        await apiRequest(scoreContracts.publisherCheck, {
            params: { score_id: scoreId, restriction: ScoreRestriction[restriction] },
        })
        return true
    } catch (e) {
        console.error('🍓[ScoreInfoProvider.hasScoreRestriction]', e)
        return false
    }
}

export async function requestRecentlyScores(page?: number | null | undefined) {
    return apiRequest(scoreContracts.recentlyViewed, { params: { page } })
}
