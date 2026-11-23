import { NativeModules, Platform } from 'react-native'
import { store } from '@mu-native/common'
import MSScore, { type MSScoreT } from '../../../App/Model/MSScore'
import { authStoreChunk } from '../store/authStoreChunk'

let cached: { userId: number; scores: MSScore[] } | null = null
let loading: { userId: number; interactive: boolean; promise: Promise<void> } | null = null
export const hasWebFavoritesSession = () => Platform.OS === 'android' && !!authStoreChunk.props.getWebFavoriteUser(store.getState())?.id
async function request(data: Record<string, unknown>, expectedUserId?: number) {
    const user = authStoreChunk.props.getWebFavoriteUser(store.getState())
    if (!user) throw new Error('Войдите в аккаунт для работы с избранным.')
    if (expectedUserId !== undefined && user.id !== expectedUserId) throw new Error('Аккаунт изменился во время загрузки.')
    if (!NativeModules.WebScoreSource?.webAccount) throw new Error('Обновите APK: модуль веб-аккаунта отсутствует.')
    return JSON.parse(await NativeModules.WebScoreSource.webAccount(JSON.stringify({ ...data, userId: user.id })))
}
export async function webFavoritesList(sort: { kind: string; order: string }, page: number, text?: string, interactive = false) {
    const userId = authStoreChunk.props.getWebFavoriteUser(store.getState())?.id
    if (!userId) throw new Error('Войдите в аккаунт.')
    if (page === 1 || cached?.userId !== userId) {
        if (loading?.userId === userId && (!interactive || loading.interactive)) {
            await loading.promise
        } else {
            const pending = loading?.userId === userId ? loading.promise : null
            const promise = (async () => {
                if (pending) {
                    try { await pending; return }
                    catch { /* A retry from the screen may show the browser check. */ }
                }
                const scores = new Map<number, MSScore>()
                const visited = new Set<string>()
                let pageUrl: string | undefined
                do {
                    if (pageUrl) {
                        if (visited.has(pageUrl)) throw new Error('Сайт повторил страницу избранного.')
                        visited.add(pageUrl)
                    }
                    const response = await request({ operation: 'list', interactive, ...(pageUrl ? { pageUrl } : {}) }, userId)
                    if (!Array.isArray(response.items)) throw new Error('Неверный ответ списка избранного.')
                    for (const raw of response.items) {
                        const thumbs = raw.thumbnails || raw.thumbnail
                        const image = typeof thumbs === 'string' ? thumbs : thumbs?.small || thumbs?.large
                        const score = new MSScore({ ...raw, id: Number(raw.id), parts: Number(raw.parts) || raw.parts_names?.length || 1,
                            user: { ...raw.user, id: Number(raw.user.id) }, rating: typeof raw.rating === 'object' ? raw.rating : { rating: Number(raw.rating) || 0 },
                            thumbnails: { small: image || '', large: thumbs?.large || image || '', medium: thumbs?.medium || image || '' },
                            is_favorite: true })
                        if (typeof raw.url === 'string') score.webSourceUrl = raw.url
                        scores.set(score.id, score)
                    }
                    pageUrl = response.nextUrl || undefined
                    if (visited.size > 100) throw new Error('Слишком много страниц избранного; загрузка остановлена.')
                } while (pageUrl)
                if (authStoreChunk.props.getWebFavoriteUser(store.getState())?.id !== userId) throw new Error('Аккаунт изменился во время загрузки.')
                cached = { userId, scores: [...scores.values()] }
            })().finally(() => { if (loading?.promise === promise) loading = null })
            loading = { userId, interactive, promise }
            await promise
        }
    }
    const query = text?.trim().toLowerCase()
    const scores = (cached?.userId === userId ? cached.scores : []).filter(score => !query || `${score.title} ${score.authorName}`.toLowerCase().includes(query))
    if (sort.kind.includes('title')) scores.sort((a,b) => a.title.localeCompare(b.title) * (sort.order === 'asc' ? 1 : -1))
    else if (sort.kind === 'date_created' || sort.kind === 'date_updated' || sort.kind === 'views') {
        const value = (score: MSScore) => sort.kind === 'views' ? score.hits : sort.kind === 'date_created' ? score.dateCreated : score.dateUpdated
        scores.sort((a,b) => ((value(a)||0)-(value(b)||0)) * (sort.order === 'asc' ? 1 : -1))
    } else if (sort.order === 'asc') scores.reverse()
    return { scores: scores.slice((page-1)*20, page*20), currentPage: page, totalPages: Math.max(1,Math.ceil(scores.length/20)), totalItems: scores.length }
}
export async function setWebFavorite(score: MSScoreT, enabled: boolean) {
    await request({ operation: 'favorite', enabled, score: { title: score.title, authorId: score.authorId, authorName: score.authorName, preview: score.largePreviewUrl }, pageUrl: score.webSourceUrl || `https://musescore.com/sheetmusic?text=${encodeURIComponent(score.title)}` })
    cached = null
}
export async function clearWebFavoritesSession() {
    cached = null
    if (NativeModules.WebScoreSource?.clearWebAccountCookies) await NativeModules.WebScoreSource.clearWebAccountCookies()
}
