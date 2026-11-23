import { translate } from '@mu-native/locale'
import { moduleKeys } from '@mu-native/search'

export const searchInputPlaceholdersMap = {
    [moduleKeys.browse]: () => translate('native.search.placeholder_scores'),
    [moduleKeys.courses]: () => translate('native.search.placeholder_courses'),
    [moduleKeys.library]: () => translate('native.search.placeholder_library'),
    [moduleKeys.favorites]: () => translate('native.search.placeholder_scores'),
    [moduleKeys.uploaded]: () => translate('native.search.placeholder_scores'),
    [moduleKeys.artist]: () => translate('native.search.placeholder_scores'),
    [moduleKeys.user]: () => translate('native.search.placeholder_scores'),
    [moduleKeys.songbook]: () => translate('native.search.placeholder_scores'),
    [moduleKeys.composition]: () => translate('native.search.placeholder_scores'),
    [moduleKeys.setScores]: () => translate('native.search.placeholder_scores'),
    [moduleKeys.setList]: () => translate('native.search.placeholder_sets'),
    [moduleKeys.ebooks]: () => translate('native.search.placeholder_books'),
    [moduleKeys.favorites_ebooks]: () => translate('native.search.placeholder_books'),
} as const
