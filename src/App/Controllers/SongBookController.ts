// noinspection ES6MissingAwait

import * as RNFS from '@dr.pogodin/react-native-fs'
import { NativeModules } from 'react-native'

import { store } from '@mu-native/common'
import { songbookStoreChunk } from '@mu-native/songbook'

import { createMSOfflineScore, fromExtasyMetaData, MSOfflineScoreT } from '../Model/MSOfflineScore'
import { MSScoreT } from '../Model/MSScore'
import { getLocalFileUrl } from '../Score/scoreActionsAsync'
import { readDir } from '../Services/FilesProvider'
import {
    createOfflineScore, createOfflineScoreModel, downloadScore, getExistingScoreUrl,
    getScoreNameParts, performGetScoreInfoRequest, removeLocalScoreFiles, saveOfflineScoreFile,
} from '../Services/ScoreInfoProvider'
import {
    deleteWebScore, findSavedWebScoreFile, findWebScoreFile, refreshWebScore,
    usesWebScoreCache,
} from '../Services/WebScoreProvider'
import SentryUtils from '../Utils/Sentry'
import Utils from '../Utils/Utils'

function getScoreFileID(scoreName: string): number {
    const numberID = Number(scoreName)

    if (!Number.isNaN(numberID)) {
        return numberID
    }

    return Utils.hashCode(String(scoreName))
}

type LocalScoreIdentity = Pick<MSScoreT, 'id' | 'revision' | 'isOffline' | 'isPdf' | 'webScoreSaved'>

export async function getLocalScoreState(score: LocalScoreIdentity) {
    const [webCache, webSaved, fileCache, fileSaved] = await Promise.all([
        usesWebScoreCache(score) || score.isOffline && !score.isPdf
            ? findWebScoreFile(score.id, score.revision) : null,
        !score.isPdf ? findSavedWebScoreFile(score.id) : null,
        getExistingScoreUrl(score.id, false),
        getExistingScoreUrl(score.id, true),
    ])
    return { webCache, webSaved, fileCache, fileSaved }
}

export function isOfflineScoreArchive(name: string) {
    return name.toLowerCase().endsWith('.mscoreoffline.zip')
}

export function canRefreshOfflineScore(score: Pick<MSScoreT, 'webScoreSaved' | 'catalogScoreId' | 'idAnalytics'>) {
    return !!(score.webScoreSaved || score.catalogScoreId || score.idAnalytics)
}

const operations = new Map<number, Promise<void>>()

function changeLocalScore(score: Pick<MSScoreT, 'id'>, operation: () => Promise<void>) {
    const pending = operations.get(score.id)
    const next = (pending ? pending.catch(() => undefined) : Promise.resolve()).then(operation)
    operations.set(score.id, next)
    return next.finally(() => {
        if (operations.get(score.id) === next) operations.delete(score.id)
    })
}

const SongBookController = {
    isInSongBook(score: Pick<MSScoreT, 'id'>): boolean {
        const songBookScores = songbookStoreChunk.props.getScores(store.getState())
        return songBookScores.some(_score => _score.id === score.id)
    },

    isInSongBookOrder(currentScore: Pick<MSScoreT, 'id'>): boolean {
        const songBookOrderScores = songbookStoreChunk.props.getOrderScores(store.getState())
        return songBookOrderScores.some(score => score.id === currentScore.id)
    },

    updateSongBook() {
        return async () => {
            const files = await readDir(RNFS.DocumentDirectoryPath)
            if (!Array.isArray(files)) return
            files.forEach(file => {
                if (!file.isFile()) return
                const nameParts = getScoreNameParts(file.name)
                if (!nameParts) return
                const { identifier } = nameParts

                try {
                    const scoreId = getScoreFileID(identifier)
                    if (!SongBookController.isInSongBook({ id: scoreId }) && !SongBookController.isInSongBookOrder({ id: scoreId })) {
                        SongBookController.addIntoSongBook(fromExtasyMetaData(scoreId, undefined))
                    }
                } catch (error) {
                    SentryUtils.sendMessage('updateSongBook', error)
                }
            })
        }
    },

    addIntoSongBook(score: MSOfflineScoreT | MSScoreT) {
        const scores = [...songbookStoreChunk.props.getScores(store.getState())]
        const existingIndex = scores.findIndex(existing => existing.id === score.id)
        const updated = 'offline' in score ? score : createOfflineScoreModel(score)

        if (existingIndex !== -1) {
            scores[existingIndex] = updated
        } else {
            scores.push(updated)
        }
        store.dispatch(songbookStoreChunk.actions.setScores(scores))
    },

    addIntoToOrdersSongBook(score: MSOfflineScoreT | MSScoreT | null) {
        if (!score) return

        const existingIndex = songbookStoreChunk.props
            .getOrderScores(store.getState())
            .findIndex(existing => existing.id === score.id)

        const updated = 'offline' in score ? score : createOfflineScoreModel(score)
        if (existingIndex === -1) {
            store.dispatch(songbookStoreChunk.actions.setOrderScoresCustom(updated))
            return
        }
        const scores = songbookStoreChunk.props.getOrderScores(store.getState())
        store.dispatch(songbookStoreChunk.actions.setOrderScores(
            scores.map((item, index) => index === existingIndex ? updated : item),
        ))
    },

    saveOffline(score: MSScoreT) {
        return changeLocalScore(score, async () => {
            const saved = await createOfflineScore(score)
            if (score.isPurchased) SongBookController.addIntoToOrdersSongBook(saved)
            else SongBookController.addIntoSongBook(saved)
            const state = store.getState()
            if (score.isPurchased) {
                store.dispatch(songbookStoreChunk.actions.setScores(
                    songbookStoreChunk.props.getScores(state).filter(item => item.id !== score.id),
                ))
            } else {
                store.dispatch(songbookStoreChunk.actions.setOrderScores(
                    songbookStoreChunk.props.getOrderScores(state).filter(item => item.id !== score.id),
                ))
            }
        })
    },

    exportOffline(score: MSScoreT, { includeCache = false, viewerPath }: {
        includeCache?: boolean
        viewerPath?: string
    } = {}) {
        return changeLocalScore(score, async () => {
            const file = viewerPath ?? await getLocalFileUrl(score, true) ??
                (includeCache && !score.isOffline ? await getLocalFileUrl(score, false) : null)
            if (!file) throw new Error('Offline score file is unavailable')
            await NativeModules.SaveDocumentModule.saveOfflineScore(file, JSON.stringify({
                title: score.title,
                authorName: score.authorName,
                catalogScoreId: score.catalogScoreId ?? (score.idAnalytics ? score.id : undefined),
            }))
        })
    },

    async importOffline(uri: string) {
        const info = JSON.parse(await NativeModules.SaveDocumentModule.importOfflineScore(uri))
        const score = createMSOfflineScore({
            id: info.id,
            title: info.title,
            authorName: info.authorName,
            source: undefined,
            options: { ...info, importedFromArchive: true },
        })
        SongBookController.addIntoSongBook(score)
        return score
    },

    refreshOffline(score: MSScoreT) {
        return changeLocalScore(score, async () => {
            if (!canRefreshOfflineScore(score)) throw new Error('No server copy is associated with this score')
            if (await findSavedWebScoreFile(score.id)) {
                await refreshWebScore({
                    ...score,
                    authorId: score.authorId ?? score.source?.authorId,
                    largePreviewUrl: score.largePreviewUrl ?? score.source?.largePreviewUrl,
                }, true)
                return
            }
            if (!await getExistingScoreUrl(score.id, true)) throw new Error('Offline score file is unavailable')
            const info = await performGetScoreInfoRequest(score.catalogScoreId ?? score.id, 'OFFLINE', true)
            const file = await downloadScore(info, true)
            await saveOfflineScoreFile(score, file)
        })
    },

    async removeFromSongBook(score: MSScoreT | MSOfflineScoreT, shouldRemoveFile = false) {
        const remove = async () => {
            if (shouldRemoveFile) {
                if (score.webScoreSaved || await findSavedWebScoreFile(score.id)) {
                    await deleteWebScore({ id: score.id, revision: score.revision ?? 0 }, true)
                }
                if (await getExistingScoreUrl(score.id, true)) {
                    await removeLocalScoreFiles(score.id, true)
                }
            }

            const state = store.getState()
            const scores = songbookStoreChunk.props.getScores(state).filter(item => item.id !== score.id)
            const orders = songbookStoreChunk.props.getOrderScores(state).filter(item => item.id !== score.id)
            store.dispatch(songbookStoreChunk.actions.setScores(scores))
            store.dispatch(songbookStoreChunk.actions.setOrderScores(orders))
        }
        await changeLocalScore(score, remove)
    },
}

export default SongBookController
