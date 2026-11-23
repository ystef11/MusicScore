import { apiEndpoints } from '../../muse-native-api/apiMethods'
import type {
    THomeScreenDto,
    TLearnScreenDto,
    TLibraryScreenDto,
    TSearchScreenDto,
} from '../dto/screenDto'

import { defineContract } from './defineContract'

/**
 * Redesign v2 screen controllers: one request per screen returns every eager block, so the first
 * frame needs no other call. All four work for guests. Pagination, tab switches and "view all"
 * go through the list endpoints (`libraryContracts`, `scoreContracts.search`, ...).
 */
export const screenContracts = {
    home: defineContract.get<THomeScreenDto>(apiEndpoints.screenHome, { version: '1.5' }),
    search: defineContract.get<TSearchScreenDto>(apiEndpoints.screenSearch, { version: '1.5' }),
    library: defineContract.get<TLibraryScreenDto>(apiEndpoints.screenLibrary, { version: '1.5' }),
    learn: defineContract.get<TLearnScreenDto>(apiEndpoints.screenLearn, { version: '1.5' }),
}
