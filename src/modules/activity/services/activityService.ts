import { apiRequest, isResponse, userContracts } from '@mu-native/api'

const NOT_FOUND = 404

/**
 * `null` is the 404 the backend sends for an empty feed, which ends pagination. Any other
 * failure is rethrown so a transient error does not get mistaken for the end of the feed.
 */
async function requestUserActivity(page: number, verbIds: number[]) {
    try {
        return await apiRequest(userContracts.feed, { params: { page, verb_ids: verbIds } })
    } catch (error) {
        if (isResponse(error) && error.status === NOT_FOUND) return null
        throw error
    }
}
async function requestActivityNotificationCount(dateLastSee: number) {
    try {
        return await apiRequest(userContracts.notificationCount, {
            params: { date_last_see: dateLastSee },
        })
    } catch (error) {
        return null
    }
}

async function invalidateNotificationCache() {
    try {
        return await apiRequest(userContracts.invalidateNotificationCount)
    } catch (error) {
        return null
    }
}

const activityService = {
    requestUserActivity,
    requestActivityNotificationCount,
    invalidateNotificationCache,
}

export default activityService
