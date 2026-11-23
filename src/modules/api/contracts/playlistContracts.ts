import { apiEndpoints } from '../../muse-native-api/apiMethods'
import type {
    TPlaylistInfoDto,
    TPlaylistInfoParamsDto,
    TPlaylistSearchDto,
} from '../dto/playlistDto'

import { defineContract } from './defineContract'

export const playlistContracts = {
    /** The curated selection; not a search despite the path (no params). */
    search: defineContract.get<TPlaylistSearchDto>(apiEndpoints.playlistSearch, {
        version: null,
    }),
    /** Header-paginated, 20 scores per page. */
    info: defineContract.get<TPlaylistInfoDto, TPlaylistInfoParamsDto>(apiEndpoints.playlistInfo, {
        version: null,
        paginated: true,
    }),
}
