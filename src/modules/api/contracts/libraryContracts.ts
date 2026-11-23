import { apiEndpoints } from '../../muse-native-api/apiMethods'
import type { TLibraryResyncDto } from '../dto/libraryDto'
import type {
    TLibraryCollectionParamsDto,
    TLibraryCoursesDto,
    TLibraryScoresDto,
    TLibraryScoresParamsDto,
    TLibrarySongbooksDto,
} from '../dto/screenDto'

import { defineContract } from './defineContract'

/**
 * Unified library lists of the redesign: server-tabbed and server-sorted, paged through `_meta`
 * (20 per page). Guests see only their device-bound purchases.
 */
export const libraryContracts = {
    /** Fire-and-forget: the backend queues the pass, the client refetches the purchased tab later. */
    resync: defineContract.post<TLibraryResyncDto>(apiEndpoints.libraryResync, { version: null }),
    /** Uploaded, purchased, saved and in-set scores merged and deduplicated server-side. */
    scores: defineContract.get<TLibraryScoresDto, TLibraryScoresParamsDto>(
        apiEndpoints.libraryScores,
        { version: '1.5' },
    ),
    /** Only `tab` and `page` are read; there is no text filter. */
    songbooks: defineContract.get<TLibrarySongbooksDto, TLibraryCollectionParamsDto>(
        apiEndpoints.librarySongbooks,
        { version: '1.5' },
    ),
    /** Tab `all` merges started, saved and purchased courses, most recent first. */
    courses: defineContract.get<TLibraryCoursesDto, TLibraryCollectionParamsDto>(
        apiEndpoints.libraryCourses,
        { version: '1.5' },
    ),
}
