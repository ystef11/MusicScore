import { useCallback } from 'react'

import { translate } from '@mu-native/locale'
import { fetchSongbooks, usePaginatedList, type TApiTabs } from '@mu-native/new-concept-shared'

import type { DigitalEbookModel } from '../../../../ebooks/screens/ebooksMain/new/api/digital.ebooks.models'

export type TSongbooksFilterKey = 'all' | 'saved' | 'purchased'

export const SONGBOOK_FILTERS: { key: TSongbooksFilterKey; getLabel: () => string }[] = [
    { key: 'all', getLabel: () => translate('native.new_concept.common.all') },
    { key: 'saved', getLabel: () => translate('native.library.favorites_title') },
    { key: 'purchased', getLabel: () => translate('native.new_concept.common.purchased') },
]

type TLibrarySongbooks = {
    ebooks: DigitalEbookModel[]
    /** Tab-availability flags (§8) — same on every request; drive which chips show. */
    tabs: TApiTabs | undefined
    isLoading: boolean
    loadMore: () => void
}

// `all` is the default tab — sent with no `tab` param (§8).
const toTabParam = (filter: TSongbooksFilterKey) => (filter === 'all' ? undefined : filter)

/**
 * Songbooks unified list (§8): server-tabbed (`all`/`saved`/`purchased`) with
 * `_meta` pagination; tab switches invalidate in-flight pages of the previous
 * tab. Works for guests too (purchased only). The source badge isn't sent in
 * MVP — the screen draws "Purchased" from the active tab.
 */
export const useLibrarySongbooks = (filter: TSongbooksFilterKey): TLibrarySongbooks => {
    const fetchPage = useCallback(
        (page: number) => fetchSongbooks({ tab: toTabParam(filter), page }),
        [filter],
    )
    const { items, tabs, isLoading, loadMore } = usePaginatedList<DigitalEbookModel>(fetchPage)

    return { ebooks: items, tabs, isLoading, loadMore }
}
