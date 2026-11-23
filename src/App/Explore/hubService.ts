import { apiRequest, errorMessage, hubContracts, isResponse } from '@mu-native/api'
import { hubConstants, toHub } from '@mu-native/hub-common'

import { showAlertNotification } from '../Elements/NewAlertNotifications.tsx'
import MSScore from '../Model/MSScore'
import { performSearch } from '../Services/SearchProvider'
import SentryUtils from '../Utils/Sentry'

export async function requestHubInfo(hub_id: number) {
    try {
        const { hub, preferred, subscribed } = await apiRequest(hubContracts.info, {
            params: { hub_id },
        })
        return { hub: toHub(hub, preferred.includes(hub.id)), subscribed: subscribed ?? false }
    } catch (error) {
        SentryUtils.sendMessage('requestHubInfo', error)
        return null
    }
}

export async function requestHubScores(hub_id: number | string, page: number) {
    if (hub_id === hubConstants.hubNewForYou.id) {
        return performSearch({ hub_alias: hubConstants.hubNewForYou.alias, page })
    }

    try {
        const { items, _meta } = await apiRequest(hubContracts.scores, { params: { hub_id, page } })

        return {
            scores: MSScore.processHubScoresSourceData(items),
            currentPage: _meta.currentPage + 1,
            totalPages: _meta.pageCount,
            totalItems: _meta.totalCount,
        }
    } catch (error) {
        SentryUtils.sendMessage('requestHubScores', error)
        return null
    }
}

export async function requestHubSubscription(hub_id: number, subscribed: boolean) {
    try {
        if (subscribed) {
            await apiRequest(hubContracts.subscribe, { payload: { hub_id } })
        } else {
            await apiRequest(hubContracts.unsubscribe, { params: { hub_id } })
        }
        return true
    } catch (error) {
        SentryUtils.sendMessage('requestHubSubscription', error)
        if (isResponse(error)) {
            showAlertNotification({ text: await errorMessage(error) })
        }
        return false
    }
}
