import { useCallback, useEffect, useLayoutEffect } from 'react'
import { ScrollView, StyleSheet } from 'react-native'

import { authStoreChunk, getIsAuthorized } from '@mu-native/auth'
import { colors, layout, useAppSafeArea } from '@mu-native/ds'
import { THub, getHubsList } from '@mu-native/hub-common'
import { translate } from '@mu-native/locale'
import { navigationThunks, Screen, useAppNavigation } from '@mu-native/navigation'
import { quizStoreChunk } from '@mu-native/quiz'
import { useActions, useValues } from '@ug/store'

import { NavHeader } from '../../../../Components/NavHeader/NavHeader'
import MetricaEvents from '../../../../constants/MetricaEvents'
import reportEvent from '../../../../Utils/Analytics'

import { ScreenHubsItem } from './ScreenHubsItem'

type Props = {
    hub: THub
    onPress: (hub: THub) => void
    testID?: string | undefined
    isAuthorized: boolean
}

const HubCard = ({ hub, onPress, testID, isAuthorized }: Props) => {
    return (
        <ScreenHubsItem onPress={onPress} hub={hub} isAuthorized={isAuthorized} testID={testID} />
    )
}

export const ScreenHubs = () => {
    const inset = useAppSafeArea({ bottom: 20 })
    const navigation = useAppNavigation()
    const actions = useActions({
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
        reportEvent(MetricaEvents.BROWSE_OPEN_ALLHUBS)
        reportEvent('Personal Hub: show', {
            tourInstrument: quizAnswers?.[0] || null,
        })
        reportEvent(MetricaEvents.SCORE_ALL_SHOW)
    }, [])

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            // eslint-disable-next-line react/no-unstable-nested-components
            header: () => (
                <NavHeader headerTitle={translate('native.screen_explore.top_hubs')} noNotifications />
            ),
        })
    }, [navigation])
    const navigateToHub = (hub: THub) => {
        actions.setScreens(Screen.hubMain)
        navigation.navigate(Screen.hubMain, { hub })
    }
    const onHubPress = useCallback(
        (hub: THub) => {
            if (!isAuthorized && hub.requiresAuth) {
                actions.setAuthModalIsVisible(true)
                actions.setModalAction(() => {
                    navigateToHub(hub)
                })
            } else navigateToHub(hub)
        },
        [actions, isAuthorized, navigateToHub],
    )

    const renderHub = (hub: THub, index: number) =>
        hub.requiresAuth && !isAuthorized ? null : (
            <HubCard
                testID={index === 1 ? 'Hubs hub' : undefined}
                hub={hub}
                key={hub.id}
                onPress={onHubPress}
                isAuthorized={isAuthorized}
            />
        )

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={[styles.contentContainer, { paddingBottom: inset.bottom }]}
        >
            {hubs?.map(renderHub)}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    contentContainer: {
        flexGrow: 1,
        flexWrap: 'wrap',
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: layout.marginXm,
        maxWidth: layout.baseMaxWidth,
        alignSelf: 'center',
    },
})
