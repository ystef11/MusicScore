import { apiRequest, userContracts } from '@mu-native/api'

import { countersStoreChunk } from './countersStoreChunk.ts'

export const currentUserCountersApi = {
    fetch() {
        return async (dispatch: any) => {
            try {
                const { counters } = await apiRequest(userContracts.statistics)
                dispatch(countersStoreChunk.actions.setCounters(counters))
            } catch (e) {
                console.log('🍓[currentUserCountersApi.error]', e)
            }
        }
    },
}
