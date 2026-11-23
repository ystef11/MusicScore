import { createStorage } from '@muse-native/mmkv'
import MSScore, { type MSScoreT } from '../Model/MSScore'
import type { TSortParams } from '../Utils/Sort'

const storage = createStorage<{ scores: string }>('MusicScore-local-favorites')
type Entry = { added: number; score: MSScoreT }
function entries(): Entry[] {
    const value = storage.get('scores')
    if (!value) return []
    const result = JSON.parse(value)
    if (!Array.isArray(result)) throw new Error('Не удалось прочитать локальное избранное.')
    return result
}
export function isLocalFavorite(score: Pick<MSScoreT, 'id'>): boolean { return entries().some(entry => entry.score.id === score.id) }
export function setLocalFavorite(score: MSScoreT, enabled: boolean): void {
    const all = entries().filter(entry => entry.score.id !== score.id)
    if (enabled) {
        const { source, ...snapshot } = score
        all.unshift({ added: Date.now(), score: { ...snapshot, isFavorite: true } as MSScoreT })
    }
    storage.set('scores', JSON.stringify(all))
}
export function localFavoritesList(sort: TSortParams, page: number, text?: string) {
    const query = text?.trim().toLowerCase()
    const filtered = entries().filter(entry => !query || `${entry.score.title} ${entry.score.authorName}`.toLowerCase().includes(query))
    filtered.sort((a,b) => {
        const field = sort.kind === 'date_created' ? 'dateCreated' : sort.kind === 'date_updated' ? 'dateUpdated' : 'hits'
        const difference = sort.kind === 'title' ? a.score.title.localeCompare(b.score.title)
            : sort.kind === 'date_added' ? a.added-b.added : (Number(a.score[field])||0)-(Number(b.score[field])||0)
        return difference * (sort.order === 'asc' ? 1 : -1)
    })
    const scores = filtered.slice((page-1)*20,page*20).map(({ score }) => {
        const raw = JSON.parse(JSON.stringify(score))
        // Recreate model methods; plain JSON alone cannot be passed to native score cards.
        return Object.assign(new MSScore({ ...raw, user: { id: raw.authorId, name: raw.authorName },
            parts: raw.partsCount || 1, thumbnails: { small: raw.previewImageUrl || '', large: raw.largePreviewUrl || '' },
            rating: { rating: raw.rating, count: raw.ratingCount } }), raw, { isFavorite: true })
    })
    return { scores, currentPage: page, totalPages: Math.max(1,Math.ceil(filtered.length/20)), totalItems: filtered.length }
}
