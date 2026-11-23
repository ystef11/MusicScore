import { getUserId } from '@mu-native/auth'
import { getStoreValue } from '@mu-native/common'
import { translate } from '@mu-native/locale'
import { songbookStoreChunk } from '@mu-native/songbook'

import type { MSScoreT } from '../Model/MSScore'
import '../Model/MSScore'
import FavoritesProvider from '../Services/FavoritesProvider'
import { performSearch } from '../Services/SearchProvider'
import UserScoresProvider from '../Services/UserScoresProvider'

import Utils from './Utils'

type ContextEnum = 'favorites' | 'my' | 'songbook' | 'library' | string
export type Section = {
    title: string
    context: ContextEnum
    data: MSScoreT[]
}
export type SectionsT = Section[]

function createSection(title: string, context: ContextEnum, data: any[], inContext?: boolean) {
    if (data && data?.length) {
        return {
            title,
            context,
            data,
        }
    }

    if (inContext) {
        return {
            title,
            context,
            data: [],
        }
    }

    return null
}

export const searchScoresEverywhere = async (query: string) => {
    const userId = getStoreValue(getUserId)
    const allSongbookScores = getStoreValue(songbookStoreChunk.props.getScores)
    const songbookScores = Utils.searchScores(allSongbookScores, query)

    const [favoritesResult, myScoresResult, globalResult] = await Promise.allSettled([
        FavoritesProvider.fetchFavorites({ kind: 'date_updated', order: 'desc' }, 1, query),
        userId
            ? UserScoresProvider.performGetUserScoresRequest(userId, { searchText: query })
            : Promise.resolve({ scores: [] as MSScoreT[] }),
        performSearch({ text: query, sort: 'relevance', page: 1 }),
    ])

    const favorites = favoritesResult.status === 'fulfilled' ? favoritesResult.value?.scores ?? [] : []
    const myScores = myScoresResult.status === 'fulfilled' ? myScoresResult.value?.scores ?? [] : []
    const globalScores: MSScoreT[] =
        globalResult.status === 'fulfilled' ? globalResult.value?.scores ?? [] : []

    return [
        createSection(translate('native.new_search.sources.favorites'), 'library.favorites', favorites),
        createSection(translate('native.new_search.sources.my'), 'library.my', myScores),
        createSection(translate('native.new_search.sources.songbook'), 'library.songbook', songbookScores),
        createSection(translate('native.new_search.sources.everywhere'), 'library.common', globalScores),
    ].filter(Boolean) as SectionsT
}

export default function searchLibrary(data: any, context: 'songbook'): SectionsT {
    const { searchText } = data
    const songBookScores = Utils.searchScores(data.songBookScores, searchText)
    const inSongBookTitle = translate('native.new_search.sources.songbook')
    const songbookSource = 'library.songbook'

    if (context === 'songbook') {
        return [createSection(inSongBookTitle, songbookSource, songBookScores, true)].filter(
            Boolean,
        ) as any
    }

    return [createSection(inSongBookTitle, songbookSource, songBookScores)].filter(Boolean) as any
}
