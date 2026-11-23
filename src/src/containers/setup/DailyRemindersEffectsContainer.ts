import { useEffect } from 'react'

import { useActions, useValues } from '@ug/store'
import { pushNotificationsStoreChunk } from '@mu-native/pushNotifications'
import { profileStoreChunk } from '@mu-native/profile'
import { globalStorage } from '@mu-native/common'

export const DailyRemindersEffectsContainer = () => {
    const [dailyReminderEnabled, dailyReminderTime, permissionGranted] = useValues([
        profileStoreChunk.props.getDailyReminderEnabled,
        profileStoreChunk.props.getDailyReminderTime,
        pushNotificationsStoreChunk.props.getPermissionGranted,
    ])
    const actions = useActions({
        setDailyReminderEnabled: profileStoreChunk.actions.setDailyReminderEnabled,
    })

    useEffect(() => {
        if (dailyReminderEnabled && permissionGranted === false) {
            actions.setDailyReminderEnabled(false)
        }
    }, [permissionGranted])

    useEffect(() => {
        const migrated = globalStorage.getBoolean('migratedDailyReminderEnabled')
        if (!migrated && dailyReminderTime && !dailyReminderEnabled) {
            actions.setDailyReminderEnabled(true)
        }
        globalStorage.set('migratedDailyReminderEnabled', true)
    }, [])

    return null
}


