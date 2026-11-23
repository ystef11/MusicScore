import { translate } from '@mu-native/locale'

import { TFilterKey } from '../types/searchTypes'

export const browseFiltersKeys = {
    instrument: 'instrument',
    genres: 'genres',
    instrumentation: 'instrumentation',
    type: 'type',
    complexity: 'complexity',
    recordingType: 'recordingType',
    license: 'license',
    scoreFormat: 'scoreFormat',
    popular: 'popular',
} as const

export const filterTitlesMap: Record<Exclude<TFilterKey, 'quickFilters'>, string> = {
    [browseFiltersKeys.instrument]: translate('native.filter_screen.instruments'),
    [browseFiltersKeys.genres]: translate('native.filter_screen.genre'),
    [browseFiltersKeys.instrumentation]: translate('native.filter_screen.ensemble'),
    [browseFiltersKeys.type]: translate('native.sorting_type.score_type'),
    [browseFiltersKeys.complexity]: translate('native.sorting_type.difficulty_level'),
    [browseFiltersKeys.recordingType]: translate('native.filter_screen.status'),
    [browseFiltersKeys.license]: translate('native.filter_screen.license'),
    [browseFiltersKeys.scoreFormat]: translate('native.filter_screen.format'),
    [browseFiltersKeys.popular]: translate('native.filter_screen.popular'),
}
