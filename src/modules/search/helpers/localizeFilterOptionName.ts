import {
    localizeEnsemble,
    localizeFilterName,
    localizeGenre,
    localizeInstrumentFilterOption,
} from '../../locale/dynamic_locales'
import { browseFiltersKeys } from '../constants/titlesMap'

/** Localize a filter option's display name; unknown names render as-is. */
export const localizeFilterOptionName = (name: string, filterKey?: string): string => {
    if (filterKey === browseFiltersKeys.instrument) return localizeInstrumentFilterOption(name)
    if (filterKey === browseFiltersKeys.genres) return localizeGenre(name)
    if (filterKey === browseFiltersKeys.instrumentation) return localizeEnsemble(name)
    return localizeFilterName(name)
}
