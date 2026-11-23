import { NativeModules, Platform } from 'react-native'
import NetInfo from '@react-native-community/netinfo'
import * as RNFS from '@dr.pogodin/react-native-fs'
import type { MSScoreT } from '../Model/MSScore'
import { createSingleFlight } from './singleFlight'

const directory = `${RNFS.CachesDirectoryPath}/WebScores`
const webScorePath = (key: string) => `${directory}/${key}.webscore`
const offlineDirectory = `${RNFS.DocumentDirectoryPath}/OfflineWebScores`
const downloads = createSingleFlight()
const rhythmRefreshAttempts = new Set<string>()
const listeners = new Set<(id: number) => void>()

export function subscribeWebScoreCache(listener: (id: number) => void) {
    listeners.add(listener)
    return () => { listeners.delete(listener) }
}

function notifyCacheChanged(id: number) {
    listeners.forEach(listener => listener(id))
}

type WebScoreIdentity = Pick<MSScoreT, 'id' | 'authorId' | 'revision' | 'title' | 'authorName' | 'largePreviewUrl'>
const keyFromPath = (path: string) => path.slice(path.lastIndexOf('/') + 1, -'.webscore'.length)
const cacheKey = (score: Pick<WebScoreIdentity, 'id' | 'revision'>) => `${score.id}-${score.revision || 0}`

export async function findSavedWebScoreFile(id: number): Promise<string | null> {
    if (Platform.OS !== 'android') return null
    const path = `${offlineDirectory}/${id}.webscore`
    return await readWebScore(path) ? path : null
}

export async function saveWebScoreOffline(score: WebScoreIdentity) {
    if (await findSavedWebScoreFile(score.id)) return
    const path = await findWebScoreFile(score.id, score.revision) ?? await downloadWebScore(score)
    await NativeModules.WebScoreSource.storePlayableOffline(keyFromPath(path))
    notifyCacheChanged(score.id)
}

export async function refreshWebScore(score: WebScoreIdentity, saveOffline: boolean) {
    const cached = await findWebScoreFile(score.id, score.revision)
    const key = cached ? keyFromPath(cached) : cacheKey(score)
    await NativeModules.WebScoreSource.refreshPlayable(
        score.title, score.authorId || 0, score.authorName || '', score.largePreviewUrl || '', key,
    )
    if (saveOffline) await NativeModules.WebScoreSource.storePlayableOffline(key)
    notifyCacheChanged(score.id)
}

export async function deleteWebScore(score: Pick<WebScoreIdentity, 'id' | 'revision'>, offline: boolean) {
    const cached = await findWebScoreFile(score.id, score.revision)
    await NativeModules.WebScoreSource.deletePlayable(cached ? keyFromPath(cached) : cacheKey(score), offline)
    notifyCacheChanged(score.id)
}

/** Resolves when the first page is cached. Android updates the same manifest in the background. */
export async function downloadWebScore(
    score: WebScoreIdentity,
    failedPages?: number[],
    interactive = true,
): Promise<string> {
    const retry = failedPages !== undefined
    const cached = await findWebScoreFile(score.id, score.revision)
    const key = cached ? keyFromPath(cached) : cacheKey(score)
    return downloads(key, async () => {
        const path = webScorePath(key)
        const view = await readWebScore(path)
        if (view && !retry) {
            const files: unknown[] = [...view.pages]
            if (view.audioUrl || view.audioExpected) files.push(view.audioUrl)
            const complete = files.every(isLocalPage) && (await Promise.all(files.map(localFileExists))).every(Boolean)
            const version = Number(view.version)
            if (complete && (version >= 4 || rhythmRefreshAttempts.has(key))) return path
            if (version < 4) rhythmRefreshAttempts.add(key)
            try {
                const connection = await NetInfo.fetch()
                if (connection.isConnected === false || connection.isInternetReachable === false) return path
            } catch { return path }
        }
        try {
            const source = NativeModules.WebScoreSource
            if (!source?.fetchPlayable) throw new Error('Обновите сборку Android: модуль просмотра нот ещё не установлен.')
            return await source.fetchPlayable(
                score.title, score.authorId || 0, score.authorName || '', score.largePreviewUrl || '',
                key, interactive && (!view || retry), failedPages ?? [],
            )
        } catch (error) {
            if (view && !retry) return path
            throw error
        }
    }).then(path => {
        notifyCacheChanged(score.id)
        return path
    }).catch(error => {
        const failure = error instanceof Error ? error : new Error(String(error))
        Object.assign(failure, {webScoreFailure: true})
        throw failure
    })
}

function isLocalPage(uri: unknown): uri is string {
    return typeof uri === 'string' && uri.startsWith('file:///')
}

async function localFileExists(uri: string) {
    try { return await RNFS.exists(decodeURI(uri.slice('file://'.length))) }
    catch { return false }
}

async function readWebScore(path: string) {
    try {
        const view = JSON.parse(await RNFS.readFile(path, 'utf8'))
        const first = Array.isArray(view.pages) && view.pages[0]
        if (isLocalPage(first) && await localFileExists(first)) return view
    } catch { /* Interrupted or evicted cache: resolve again. */ }
    return null
}

export async function findWebScoreFile(id: number, revision = 0): Promise<string | null> {
    const path = webScorePath(id + '-' + (revision || 0))
    if (await readWebScore(path)) return path
    const files = await RNFS.readDir(directory).catch(() => [])
    const candidates = files.filter(file => file.isFile() && file.name.startsWith(id + '-') &&
        /^[0-9]+-[0-9]+\.webscore$/.test(file.name) && file.path !== path)
    candidates.sort((a, b) => Number(keyFromPath(b.path).split('-')[1]) - Number(keyFromPath(a.path).split('-')[1]))
    for (const candidate of candidates) {
        if (await readWebScore(candidate.path)) return candidate.path
    }
    return null
}

export const usesWebScoreCache = (score: Pick<MSScoreT, 'isPdf' | 'isOffline' | 'webScoreSaved'>) =>
    Platform.OS === 'android' && !score.isPdf && (!score.isOffline || !!score.webScoreSaved)

export type WebScoreExportFormat = 'pdf' | 'mid' | 'audio'

export async function saveCachedWebScore(
    score: MSScoreT,
    format: WebScoreExportFormat,
    viewerPath?: string,
) {
    const path = viewerPath ?? await findSavedWebScoreFile(score.id) ?? await findWebScoreFile(score.id, score.revision)
    if (!path) throw new Error('Откройте партитуру и дождитесь загрузки первой страницы.')
    const documentModule = NativeModules.SaveDocumentModule
    if (!documentModule?.saveWebScore) {
        throw new Error('Обновите приложение до версии с сохранением файлов.')
    }
    await documentModule.saveWebScore(path, format, score.title || String(score.id))
}

export async function findCachedWebScoreUrl(id: number, revision = 0): Promise<unknown> {
    try {
        const path = await findSavedWebScoreFile(id) ?? await findWebScoreFile(id, revision)
        return path ? JSON.parse(await RNFS.readFile(path, 'utf8')).sourceUrl : undefined
    } catch {
        return undefined
    }
}

export async function isDeviceVerificationError(error: unknown): Promise<boolean> {
    // Lazy import avoids initializing the API/store while loading the file service.
    const { isAttestationFailure, isResponse, responseCode, ApiErrorCodes } = await import('@mu-native/api')
    return isAttestationFailure(error) || (isResponse(error) && (await responseCode(error)) === ApiErrorCodes.deviceAttestationFailed)
}
