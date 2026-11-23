import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react'

import {
    hubConstants,
    THub,
    HubDetailsContext,
    useHubDetailsContext,
    createHubDetailsDynamicStoreChunk,
} from '@mu-native/hub-common'
import { translate } from '@mu-native/locale'
import { useAppRoute, useNavigation, useSameRouteInStackCount } from '@mu-native/navigation'
import { quizStoreChunk } from '@mu-native/quiz'
import {
    createUniversalScoreListDynamicStoreChunk,
    UniversalScoreListContext,
    useUniversalScoreListContext,
} from '@mu-native/universal-score-list'
import { useActions, useInjectDynamicStoreChunk, useValues } from '@ug/store'

import { NavHeader } from '../../../Components/NavHeader/NavHeader'
import MetricaEvents from '../../../constants/MetricaEvents'
import ScreenLayoutWrapperElement from '../../../Elements/ScreenLayoutWrapperElement'
import reportEvent from '../../../Utils/Analytics'
import {
    fetchHubInfo,
    fetchHubScores,
    loadMoreHubScores,
    updateHubSubscription,
} from '../../exploreAsyncActions'
import { HubScoresList } from '../Components/HubScoresList'
import { HubCard } from '../Elements/HubCard'
import { HubNewForYouCard } from '../Elements/HubNewForYouCard'

const ScreenHub = () => {
    const scoreListChunk = useUniversalScoreListContext()
    const hubDetailsChunk = useHubDetailsContext()
    const [scoreIds, scoresMap, isLoading, hub, quizAnswers] = useValues([
        scoreListChunk.props.getScoresIds,
        scoreListChunk.props.getScoresMap,
        scoreListChunk.props.getIsLoading,
        hubDetailsChunk.props.getHub,
        quizStoreChunk.props.getQuizAnswersNames,
    ])
    const actions = useActions({
        updateHubSubscription,
        fetchHubInfo,
        fetchHubScores,
        loadMoreHubScores,
    })

    useEffect(() => {
        actions.fetchHubInfo(hubDetailsChunk)
        actions.fetchHubScores(scoreListChunk)
    }, [actions, hubDetailsChunk, scoreListChunk])

    const prevValues = useRef({ subscribed: !!hub.subscribed })
    useEffect(() => {
        if (hub) {
            reportEvent(MetricaEvents.BROWSE_OPEN_HUB, {
                hub: hub.title,
                featured: hub.featured ? 1 : 0,
            })
        }
        if (hub && hub.subscribed !== !prevValues.current.subscribed) {
            reportEvent(MetricaEvents.BROWSE_SUBSCRIBE_HUB, {
                hub: hub.title,
                featured: hub.featured ? 1 : 0,
                subscribed: hub.subscribed ? 1 : 0,
                value: hub.subscribed ? 'follow' : 'unfollow',
            })
        }
        prevValues.current.subscribed = !!hub.subscribed
    }, [hub])

    const tourInstrument = quizAnswers?.[0] ?? ''

    const scores = useMemo(() => {
        if (!scoreIds || !scoresMap) return []
        return scoreIds.map(id => scoresMap[id]).filter(Boolean)
    }, [scoreIds, scoresMap])

    const onSubscribePress = useCallback(() => {
        actions.updateHubSubscription(hubDetailsChunk, !hub.subscribed)
    }, [actions, hub.subscribed, hubDetailsChunk])

    const renderHeader = useCallback(() => {
        if (hub.id === hubConstants.hubNewForYou.id) {
            return <HubNewForYouCard tourInstrument={tourInstrument} />
        }

        return <HubCard hub={hub} onButtonPress={onSubscribePress} />
    }, [hub, onSubscribePress, tourInstrument])

    const onLoadMore = useCallback(() => {
        if (scores?.length) {
            actions.loadMoreHubScores(scoreListChunk)
        }
    }, [scores?.length, actions, scoreListChunk])

    return (
        <ScreenLayoutWrapperElement>
            <HubScoresList
                hub={hub}
                scores={scores}
                isLoading={isLoading}
                loadMore={onLoadMore}
                listHeaderComponent={renderHeader}
            />
        </ScreenLayoutWrapperElement>
    )
}

export const ScreenHubContainer = () => {
    const { setOptions } = useNavigation()
    const params = useAppRoute<{ hub?: THub; hubId?: string }>()

    const hub: THub = useMemo(() => {
        if (params.hub) {
            return params.hub
        }

        // support for deeplink navigation
        const hubId = params.hubId ? parseInt(params.hubId, 10) : 0

        const predefinedHub = hubConstants.predefinedHubs.find(h => h.id === hubId)
        if (predefinedHub) {
            return predefinedHub
        }

        // full data will be loaded in fetchHubInfo()
        return {
            id: hubId,
            title: '' as any,
            alias: '',
            featured: false,
            imageBase: '',
            visible: true,
        }
    }, [params.hub, params.hubId])

    const translateKey = hub.title ? hubConstants.getTranslateKey(hub.title) : ''
    const translation = translateKey ? translate(translateKey) : ''
    const hubTitle = translation.includes('missing') || !translation ? hub.title || '' : translation

    useLayoutEffect(() => {
        setOptions({
            headerShown: true,
            // eslint-disable-next-line react/no-unstable-nested-components
            header: () => <NavHeader testID="Hub back" headerTitle={hubTitle} noNotifications />,
        })
    }, [hubTitle, setOptions])

    const increment = useSameRouteInStackCount()
    const { chunk: scoreListChunk } = useInjectDynamicStoreChunk('hub', key =>
        createUniversalScoreListDynamicStoreChunk(key, hub.id, increment),
    )
    const { chunk: hubDetailsChunk } = useInjectDynamicStoreChunk('hub', key =>
        createHubDetailsDynamicStoreChunk(key, hub),
    )

    return (
        <HubDetailsContext.Provider value={hubDetailsChunk}>
            <UniversalScoreListContext.Provider value={scoreListChunk}>
                <ScreenHub />
            </UniversalScoreListContext.Provider>
        </HubDetailsContext.Provider>
    )
}
