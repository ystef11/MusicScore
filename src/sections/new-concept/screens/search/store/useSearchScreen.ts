import { useMemo } from 'react'

import {
    fetchSearchScreen,
    mapScoreCards,
    readBlock,
    useScreenController,
} from '@mu-native/new-concept-shared'

import type { TCourse } from '../../../../../App/Courses/coursesTypes'
import type { MSScoreT } from '../../../../../App/Model/MSScore'
import type { DigitalEbookModel } from '../../../../ebooks/screens/ebooksMain/new/api/digital.ebooks.models'
import { chipToSearchGenre, type TSearchGenre } from '../constants/searchGenres'

export type TSearchScreen = {
    isLoading: boolean
    isError: boolean
    hasData: boolean
    refresh: () => Promise<void>
    trending: MSScoreT[]
    songbooks: DigitalEbookModel[]
    courses: TCourse[]
    genres: TSearchGenre[]
}

/**
 * Single Search controller (§5): one `GET /screen/search` call yields the 4 eager
 * blocks (trending / songbooks / courses / genres). All blocks are backend-cached
 * and impersonal, so the screen fetches on mount only (pull-to-refresh = `refresh`).
 * The search bar + suggestions are separate methods (§6, see `useSearchSuggestions`).
 */
export const useSearchScreen = (): TSearchScreen => {
    const { response, isLoading, isError, hasData, refresh } = useScreenController(
        fetchSearchScreen,
        { refetchOnFocus: false },
    )

    const trending = useMemo(
        () => mapScoreCards(readBlock(response?.scores_trending).items),
        [response?.scores_trending],
    )
    const songbooks = useMemo(() => readBlock(response?.songbooks).items, [response?.songbooks])
    const courses = useMemo(() => readBlock(response?.courses).items, [response?.courses])
    const genres = useMemo(
        () => readBlock(response?.genres).items.map(chipToSearchGenre),
        [response?.genres],
    )

    return { isLoading, isError, hasData, refresh, trending, songbooks, courses, genres }
}
