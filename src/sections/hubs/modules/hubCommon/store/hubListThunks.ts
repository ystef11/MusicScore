import { apiRequest, hubContracts, type THubListDto } from '@mu-native/api'
import { DispatchFun } from '@mu-native/common'

import SentryUtils from '../../../../../App/Utils/Sentry'
import { toHub } from '../helpers/toHub.ts'
import { THub } from '../types/hubTypes.ts'

import { hubListStoreChunk } from './hubListStoreChunk'

function processHubList(response: THubListDto) {
    const preferredHubs: THub[] = []
    const subscribedHubs: THub[] = []
    const restHubs: THub[] = []

    response.hubs.forEach(dto => {
        if (!dto.visible) return
        if (response.preferred.includes(dto.id)) {
            preferredHubs.push(toHub(dto, true))
        } else if (response.subscribed.includes(dto.id)) {
            subscribedHubs.push(toHub(dto))
        } else {
            restHubs.push(toHub(dto))
        }
    })

    return ([] as THub[]).concat(preferredHubs, subscribedHubs, restHubs)
}

function fetchHubList() {
    return async (dispatch: DispatchFun) => {
        try {
            const response = await apiRequest(hubContracts.list)
            dispatch(hubListStoreChunk.actions.setHubs(processHubList(response)))
        } catch (error) {
            SentryUtils.sendMessage('requestHubList', error)
        }
    }
}

export const hubListThunks = {
    fetchHubList,
}
