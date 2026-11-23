import { translate } from '@mu-native/locale'

export type TLibraryFilterKey = 'all' | 'uploads' | 'purchased' | 'offline'

export type TLibraryFilter = {
    key: TLibraryFilterKey
    label: string
}

export const LIBRARY_FILTERS: TLibraryFilter[] = [
    { key: 'all', label: translate('native.new_concept.common.all') },
    { key: 'uploads', label: translate('native.new_concept.library.filter_my_uploads') },
    { key: 'purchased', label: translate('native.new_concept.common.purchased') },
    { key: 'offline', label: translate('native.new_concept.library.filter_offline_access') },
]

export type TLibrarySortKey = 'recent' | 'mostViewed'

export const LIBRARY_SORT_OPTIONS: { id: TLibrarySortKey; label: string }[] = [
    { id: 'recent', label: translate('native.new_concept.library.sort_recent') },
    { id: 'mostViewed', label: translate('native.new_concept.library.sort_most_viewed') },
]
