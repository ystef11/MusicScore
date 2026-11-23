import { createStorage } from '@muse-native/mmkv'

import MSScore, { type MSScoreT } from '../../Model/MSScore'

export const LOCAL_SETS_OWNER = -1

type SetInfo = {
    id: number
    title: string
    description: string
    is_private: 1
}
type LocalSet = { info: SetInfo; scores: MSScoreT[] }

const storage = createStorage<{ sets: LocalSet[] }>('MusicScore-local-sets')

function read(): LocalSet[] {
    return storage.get('sets') ?? []
}

function write(sets: LocalSet[]) {
    storage.set('sets', sets)
}

function snapshot(score: MSScoreT): MSScoreT {
    const { source, ...fields } = score
    return fields as MSScoreT
}

function restoreScore(score: MSScoreT): MSScoreT {
    if (score.isOffline) return score
    return Object.assign(new MSScore({
        ...score,
        user: { id: score.authorId, name: score.authorName },
        parts: score.partsCount || 1,
        thumbnails: { small: score.previewImageUrl || '', large: score.largePreviewUrl || '' },
        rating: { rating: score.rating, count: score.ratingCount },
    } as ConstructorParameters<typeof MSScore>[0]), score)
}

export function localSetsList() {
    const sets = read().map(item => item.info)
    return { sets, currentPage: 1, totalPages: 1, totalItems: sets.length }
}

export function localSetDetails(id: number) {
    const item = read().find(entry => entry.info.id === id)
    if (!item) return null
    return {
        set: item.info,
        scores: item.scores.map(restoreScore),
        currentPage: 1,
        totalPages: 1,
        totalItems: item.scores.length,
    }
}

export function createLocalSet(title: string, description: string, score?: MSScoreT) {
    const sets = read()
    const id = sets.reduce((next, item) => Math.max(next, item.info.id + 1), Date.now())
    const info: SetInfo = { id, title, description, is_private: 1 }
    write([{ info, scores: score ? [snapshot(score)] : [] }, ...sets])
    return info
}

export function updateLocalSet(id: number, title: string, description: string, scoreIds: number[]) {
    const sets = read()
    const item = sets.find(entry => entry.info.id === id)
    if (!item) return undefined
    const byId = new Map(item.scores.map(score => [score.id, score]))
    item.info = { ...item.info, title, description }
    item.scores = scoreIds.flatMap(scoreId => {
        const score = byId.get(scoreId)
        return score ? [score] : []
    })
    write(sets)
    return item.info
}

export function deleteLocalSet(id: number) {
    const sets = read()
    const remaining = sets.filter(item => item.info.id !== id)
    if (sets.length === remaining.length) return false
    write(remaining)
    return true
}

export function localSetsForScore(id: number) {
    return read().filter(item => item.scores.some(score => score.id === id)).map(item => item.info.id)
}

export function updateLocalScoreMembership(score: MSScoreT, deleted: number[], added: number[]) {
    const sets = read()
    if ([...deleted, ...added].some(id => !sets.some(item => item.info.id === id))) return false
    for (const item of sets) {
        if (deleted.includes(item.info.id)) item.scores = item.scores.filter(entry => entry.id !== score.id)
        if (added.includes(item.info.id) && !item.scores.some(entry => entry.id === score.id)) {
            item.scores.push(snapshot(score))
        }
    }
    write(sets)
    return true
}

export function removeLocalScoreFromSet(id: number, scoreId: number) {
    const sets = read()
    const item = sets.find(entry => entry.info.id === id)
    if (!item) return false
    item.scores = item.scores.filter(score => score.id !== scoreId)
    write(sets)
    return true
}
