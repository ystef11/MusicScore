import { memo, useCallback, useEffect } from 'react'

import { authStoreChunk, getIsAuthorized } from '@mu-native/auth'
import { getHubsList, THub, hubListThunks } from '@mu-native/hub-common'
import { navigationThunks, Screen, useAppNavigation } from '@mu-native/navigation'
import { quizStoreChunk } from '@mu-native/quiz'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../../../constants/MetricaEvents'
import { HubsScrollView } from '../../../../Elements/hubs/HubsScrollView'
import reportEvent from '../../../../Utils/Analytics'

export const HubList = memo(() => {
    const navigation = useAppNavigation()
    const actions = useActions({
        fetchHubList: hubListThunks.fetchHubList,
        setAuthModalIsVisible: authStoreChunk.actions.setIsVisible,
        setModalAction: authStoreChunk.actions.setModalAction,
        setScreens: navigationThunks.setScreen,
    })

    const [hubs, quizAnswers, isAuthorized] = useValues([
        getHubsList,
        quizStoreChunk.props.getQuizAnswersNames,
        getIsAuthorized,
    ])

    useEffect(() => {
        actions.fetchHubList()
    }, [actions, isAuthorized])

    const navigateToHub = useCallback(
        (hub: THub) => {
            actions.setScreens(Screen.hubMain)
            navigation.navigate(Screen.hubMain, { hub })
        },
        [actions, navigation],
    )

    const onHubPress = useCallback(
        (hub: THub) => {
            if (!isAuthorized && hub?.requiresAuth) {
                actions.setAuthModalIsVisible(true)
                actions.setModalAction(() => navigateToHub(hub))
            } else navigateToHub(hub)
        },
        [actions, isAuthorized, navigateToHub],
    )

    const onAllHubsPress = useCallback(() => {
        reportEvent(MetricaEvents.SCORE_ALL_CLICK)
        actions.setScreens(Screen.hubMain)
        navigation.navigate(Screen.allHubs)
    }, [actions, navigation])

    return (
        <HubsScrollView
            hubs={hubs}
            limit={7}
            onHubPress={onHubPress}
            onAllHubsPress={onAllHubsPress}
            tourInstrument={quizAnswers?.[0] || null}
            isAuthorized={isAuthorized}
        />
    )
})
