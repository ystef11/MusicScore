import { useEffect } from 'react'

import { activityService } from '@mu-native/activity'
import { getIsAuthorized, authStoreChunk, authThunks } from '@mu-native/auth'
import { loadPaymentAccountId, marketingThunks } from '@mu-native/marketing'
import { songbookStoreChunk } from '@mu-native/songbook'
import { useValues, useActions, reloadPersistedState } from '@ug/store'

import Sentry from '../../../App/Utils/Sentry'

let authorized = false

export const AuthChangeContainer = () => {
    const actions = useActions({
        loadPaymentAccountId,
        reloadPersistedState,
        loadUserBalance: marketingThunks.loadUserBalance,
        loadUserProfile: authThunks.loadUserProfile,
        cleanupSongbook: songbookStoreChunk.actions.cleanup,
    })
    const [isAuthorized, user] = useValues([getIsAuthorized, authStoreChunk.props.getUser])

    useEffect(() => {
        if (!authorized && isAuthorized) {
            authorized = true
            actions.loadUserBalance()
            activityService.invalidateNotificationCache()
            Sentry.setUserId(user.id?.toString())
        } else if (authorized && !isAuthorized) {
            authorized = false
            Sentry.setUserId(undefined)
            actions.cleanupSongbook()
        }
        actions.loadPaymentAccountId()
        actions.loadUserProfile()
    }, [isAuthorized, user.id])

    return null
}
