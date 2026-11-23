import { scoreTestIds } from '@mu/mu-mobile-test-id'
import { useOpenScore } from '@mu-native/score'
import { CarouselScoreList } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { marketingThunks } from '@mu-native/marketing'
import { Screen, useAppNavigation } from '@mu-native/navigation'
import { recentlyViewedScoresStoreChunk } from '@mu-native/recently-viewed-scores'
import { buildSearchEventParams } from '@mu-native/search'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../constants/MetricaEvents'
import { getScoreMetaEvent } from '../../constants/scoreAnalytic'
import type { MSScoreT } from '../../Model/MSScore'
import reportEvent from '../../Utils/Analytics'

export const ScoreRecentlyViewed = () => {
    const navigation = useAppNavigation()
    const openScore = useOpenScore()
    const actions = useActions({
        checkOpenScoreForSaleThunk: marketingThunks.checkOpenScoreForSaleThunk,
    })
    const [recentlyScores, isLoading] = useValues([
        recentlyViewedScoresStoreChunk.props.getScores,
        recentlyViewedScoresStoreChunk.props.getIsLoading,
    ])

    const onScorePress = (score: MSScoreT) => {
        actions.checkOpenScoreForSaleThunk({
            ui: 'recently-viewed',
            score,
            callbackAfterCheck: () => {
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
            },
        })
    }

    const onMorePress = () => {
        navigation.navigate(Screen.scoreRecently)
    }

    if (recentlyScores.length === 0) return null

    return (
        <CarouselScoreList<MSScoreT>
            testID={scoreTestIds.recentlyViewedSection}
            titleTestID={scoreTestIds.recentlyViewedTitle}
            itemTestID={scoreTestIds.recentlyViewedItem}
            title={translate('native.screen_explore.recently_viewed')}
            onTitlePress={onMorePress}
            onScorePress={onScorePress}
            data={recentlyScores}
            isLoading={isLoading}
        />
    )
}
