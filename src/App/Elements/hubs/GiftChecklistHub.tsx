import { memo, useEffect } from 'react'
import { StyleSheet } from 'react-native'

import { getIsAuthorized } from '@mu-native/auth'
import { brandColors } from '@mu-native/ds'
import { getNumberCompetedTasks } from '@mu-native/gift-checklist'
import { getIsUserHasSubscription, getSaleSubscriptions, marketingStoreChunk } from '@mu-native/marketing'
import { useAppNavigation } from '@mu-native/navigation'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { useValues } from '@ug/store'

import reportEvent from '../../Utils/Analytics.ts'

import { Hub } from './Hub.tsx'

const styles = StyleSheet.create({
    adventHubStyle: {
        backgroundColor: brandColors.accentPrimary,
    },
})

const adventHubData = {
    alias: 'advent',
    id: 0,
    featured: false,
    title: 'gifts',
    imageBase: 'ic_gift',
    visible: true,
} as const

const allTaskCount = 7

export function useGiftChecklistHub() {
    const { navigate } = useAppNavigation()
    const [isAuth, subscriptionsForRestore, isUserHasSubscription, numberCompletedTasks, subscriptions] =
        useValues([
            getIsAuthorized,
            marketingStoreChunk.props.getSubscriptionsForRestore,
            getIsUserHasSubscription,
            getNumberCompetedTasks,
            getSaleSubscriptions,
        ])
    const statusSubscription = subscriptionsForRestore.length ? 'inactive' : 'active'
    const onHubPress = () => {
        reportEvent(RT_EVENTS.CHECKLIST_TAB_CLICK, {
            ui: isUserHasSubscription ? statusSubscription : '',
        })
        navigate('GiftChecklistScreen')
    }

    const isHideHub = numberCompletedTasks === allTaskCount || !isAuth || !subscriptions.length

    useEffect(() => {
        if (!isHideHub) {
            reportEvent(RT_EVENTS.CHECKLIST_TAB_SHOW, {
                ui: isUserHasSubscription ? statusSubscription : '',
            })
        }
    }, [isHideHub])

    return { isHideHub, onHubPress }
}

export const GiftChecklistHub = memo(() => {
    const params = useGiftChecklistHub()
    if (params.isHideHub) return null

    return (
        <Hub
            hub={adventHubData}
            key="gift"
            onPress={params.onHubPress}
            style={styles.adventHubStyle}
            colorText="white"
        />
    )
})
