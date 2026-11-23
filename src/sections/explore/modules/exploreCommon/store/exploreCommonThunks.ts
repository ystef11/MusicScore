import { apiRequest, commonContracts, scoreContracts } from '@mu-native/api'
import { DispatchFun, GetStateFun } from '@mu-native/common'
import { searchStoreChunk } from '@mu-native/search'

import { exploreCommonStoreChunk } from './exploreCommonStoreChunk.ts'

export const exploreCommonThunks = {
    fetchHomeScreenSections() {
        return async (dispatch: DispatchFun, getState: GetStateFun) => {
            dispatch(exploreCommonStoreChunk.actions.setIsLoadingSections(true))
            try {
                const response = await apiRequest(commonContracts.dashboardSections)
                dispatch(exploreCommonStoreChunk.actions.setHomeScreenSections(response))
            } catch (e) {
                console.warn('Failed to fetch Home Screen sections', e)
            } finally {
                dispatch(exploreCommonStoreChunk.actions.setIsLoadingSections(false))
            }
        }
    },

    fetchUserSearchHistory(isAuthorized: boolean) {
        return async (dispatch: DispatchFun) => {
            try {
                if (!isAuthorized) return
                const response = await apiRequest(scoreContracts.searchHistory)
                dispatch(searchStoreChunk.actions.setSearchHistory(response.scoreSearchHistory))
                console.log('[AuthThunks.userSearchHistory]', response)
            } catch {
                /* ignore */
            }
        }
    },
}
