import { forwardRef, memo, useCallback, useEffect, useMemo, useState } from 'react'

import { searchTestIds } from '@mu/mu-mobile-test-id'
import { useOpenScore } from '@mu-native/score'
import { getIsAuthorized } from '@mu-native/auth'
import { BrandAppLoader, presentAlert } from '@mu-native/ds'
import { exploreCommonThunks } from '@mu-native/explore-common'
import { translate } from '@mu-native/locale'
import { marketingStoreChunk, marketingThunks } from '@mu-native/marketing'
import {
    buildSearchEventParams,
    getAllSelectedFiltersQuantity,
    getFlattenedSelectedFilters,
    searchStoreChunk,
} from '@mu-native/search'
import { checkConnectionSafely } from '@mu-native/system'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../../../constants/MetricaEvents'
import { MSScoreT } from '../../../../Model/MSScore'
import MSFlashList, { TScoreList } from '../../../../MSComponents/MSFlashList'
import reportEvent from '../../../../Utils/Analytics'
import { loadExploreScores, loadMoreExploreScores } from '../../../exploreAsyncActions'
import { exploreScoreListStoreChunk } from '../../../exploreScoreListStoreChunk.ts'
import { screenExploreThunks } from '../../thunks/thunks'

import { NewEmptyList } from './NewEmptyList'

type Props = {
    listHeaderComponent: React.ReactNode
    contentPaddingTop?: number
}

const ScoreListInternal = forwardRef<TScoreList, Props>(
    ({ listHeaderComponent, contentPaddingTop = 0 }: Props, ref) => {
        const openScore = useOpenScore()

        const actions = useActions({
            loadScores: loadExploreScores,
            loadMore: loadMoreExploreScores,
            setInAppInfo: marketingStoreChunk.actions.setInAppForSale,
            onScoreItemPress: screenExploreThunks.onScoreItemPress,
            checkOpenScoreForSaleThunk: marketingThunks.checkOpenScoreForSaleThunk,
            fetchHomeScreenSections: exploreCommonThunks.fetchHomeScreenSections,
            fetchUserSearchHistory: exploreCommonThunks.fetchUserSearchHistory,
        })
        const [
            isLoading,
            isInitialLoading,
            scoreIds,
            scoresMap,
            isAuthorized,
            searchTerm,
            filtersApplied,
            filtersCount,
            searchQueryId,
            sort,
        ] = useValues([
            exploreScoreListStoreChunk.props.getIsLoading,
            exploreScoreListStoreChunk.props.getIsInitialLoading,
            exploreScoreListStoreChunk.props.getScoresIds,
            exploreScoreListStoreChunk.props.getScoresMap,
            getIsAuthorized,
            searchStoreChunk.props.getSearchTerm,
            getFlattenedSelectedFilters,
            getAllSelectedFiltersQuantity,
            searchStoreChunk.props.getSearchQueryId,
            searchStoreChunk.props.getSelectedSort,
        ])

        const scores = useMemo(
            () => (scoreIds && scoresMap ? scoreIds.map(id => scoresMap[id]).filter(Boolean) : []),
            [scoreIds, scoresMap],
        )

        const [refreshing, setRefreshing] = useState(false)
        const onRefresh = useCallback(async () => {
            setRefreshing(true)
            await Promise.all([
                actions.loadScores(exploreScoreListStoreChunk, false),
                actions.fetchHomeScreenSections(),
            ])
            setRefreshing(false)
        }, [actions])

        useEffect(() => {
            actions.loadScores(exploreScoreListStoreChunk, true)
            actions.fetchHomeScreenSections()
            actions.fetchUserSearchHistory(isAuthorized)
        }, [actions, isAuthorized])

        const onLoadMore = useCallback(() => {
            if (!scores?.length) return
            actions.loadMore(exploreScoreListStoreChunk)
        }, [actions, scores?.length])

        const handleItemPress = (score: MSScoreT) => {
            const position = scores.indexOf(score)
            if (score?.score_blocked_by_country) {
                presentAlert({ rawTitle: translate('native.score.blocked.in.country') })
                return
            }

            reportEvent(MetricaEvents.SCORE_READ, {
                score_id: score?.idAnalytics,
                scoreTitle: score?.title,
                secondary_score_id: score?.id,
                score_type: 'Browse',
            })

            const params = buildSearchEventParams({
                filters: filtersApplied,
                sort,
                position,
                totalCount: scores.length,
                page: 0,
                score,
                searchQueryId,
                searchQuery: searchTerm,
            })
            reportEvent(MetricaEvents.SEARCH_BROWSE_RESULTS_CLICK, params)

            actions.setInAppInfo({
                id: score?.id,
                title: score?.title,
                isPurchased: score?.isPurchased,
            })

            actions.checkOpenScoreForSaleThunk({
                ui: 'Browse',
                score,
                callbackAfterCheck: () => {
                    if (!checkConnectionSafely()) {
                        return
                    }
                    actions.onScoreItemPress(score)
                    openScore(score)
                },
            })
        }

        if (isInitialLoading && scores.length === 0) return <BrandAppLoader />

        return (
            <MSFlashList
                testID={searchTestIds.searchResults.scores}
                ref={ref}
                scores={scores}
                onItemPress={handleItemPress}
                isLoading={isLoading}
                refreshing={refreshing}
                onRefresh={onRefresh}
                loadMore={onLoadMore}
                listHeaderComponent={listHeaderComponent}
                ListEmptyComponent={
                    // eslint-disable-next-line no-nested-ternary
                    isLoading ? null : <NewEmptyList />
                }
                hasSearchFilter={!!searchTerm || !!filtersCount}
                containerStyle={{ paddingTop: contentPaddingTop + 12 }}
            />
        )
    },
)

export const ScoreList = memo(ScoreListInternal)
