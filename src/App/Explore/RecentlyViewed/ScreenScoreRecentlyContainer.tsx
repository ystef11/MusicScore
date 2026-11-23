import React, { useCallback, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { scoreTestIds } from '@mu/mu-mobile-test-id'
import { useOpenScore } from '@mu-native/score'
import { brandColors } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { marketingConstants, marketingStoreChunk } from '@mu-native/marketing'
import { navigationThunks, Screen, useAppNavigation } from '@mu-native/navigation'
import { recentlyViewedScoresStoreChunk } from '@mu-native/recently-viewed-scores'
import { buildSearchEventParams } from '@mu-native/search'
import { checkConnectionSafely } from '@mu-native/system'
import { useActions, useValues } from '@ug/store'

import { NavHeader } from '../../Components/NavHeader/NavHeader'
import MetricaEvents from '../../constants/MetricaEvents'
import { getScoreMetaEvent } from '../../constants/scoreAnalytic'
import { MSScoreT } from '../../Model/MSScore'
import MSFlashList from '../../MSComponents/MSFlashList'
import reportEvent from '../../Utils/Analytics'
import { fetchRecentlyScores } from '../exploreAsyncActions'

export const ScreenScoreRecentlyContainer = ({ ...props }) => {
    const navigation = useAppNavigation()
    const openScore = useOpenScore()
    const [recentlyScores, isOffScores] = useValues([
        recentlyViewedScoresStoreChunk.props.getScores,
        marketingStoreChunk.props.getIsOffScores,
    ])
    const actions = useActions({
        setPartialFieldsCustom: marketingStoreChunk.actions.setPartialFieldsCustom,
        setScreen: navigationThunks.setScreen,
        fetchRecentlyScores,
    })
    const [refreshing, setRefreshing] = useState(false)

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            // eslint-disable-next-line react/no-unstable-nested-components
            header: () => (
                <NavHeader
                    {...props}
                    headerTitle={translate('native.screen_explore.recently_viewed')}
                    noNotifications
                />
            ),
        })
    }, [])

    useEffect(() => {
        actions.setScreen('ScoreRecently')
        actions.fetchRecentlyScores('ScoreRecently')
    }, [])

    const onItemPress = (score: MSScoreT) => {
        if (!isOffScores && score?.isOfficial && !score?.isPurchased) {
            actions.setPartialFieldsCustom({
                inAppForSale: {
                    id: score?.id,
                    title: score?.title,
                },
                source: marketingConstants.sources.offScoresLanding,
            })

            navigation.navigate(Screen.screenLongLanding, {
                planName: 'offScores',
                inAppItem: score,
            })
        } else {
            reportEvent(
                MetricaEvents.SCORE_CLICK,
                getScoreMetaEvent(score, score?.isOfficial, { place: 'Recently Viewed' }),
            )
            const position = recentlyScores.indexOf(score)
            const params = buildSearchEventParams({
                filters: [{ key: 'recently_viewed', value: '1' }],
                sort: 'date_updated',
                totalCount: recentlyScores.length,
                entity: 'recently_viewed',
                page: 0,
                position,
                score,
            })
            reportEvent(MetricaEvents.SEARCH_BROWSE_RESULTS_CLICK, params)
            openScore(score)
        }
    }

    const onRefresh = useCallback(() => {
        if (!checkConnectionSafely()) return
        setRefreshing(true)
        try {
            actions.fetchRecentlyScores('ScoreRecently')
        } finally {
            setRefreshing(false)
        }
    }, [])

    if (!recentlyScores?.length) return null

    return (
        <View style={styles.container}>
            <MSFlashList
                testID={scoreTestIds.recentlyViewedList}
                scores={recentlyScores}
                hasSearchFilter={false}
                onItemPress={onItemPress}
                onRefresh={onRefresh}
                isLoading={refreshing}
                refreshing={refreshing}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: brandColors.backgroundDefault,
    },
})
