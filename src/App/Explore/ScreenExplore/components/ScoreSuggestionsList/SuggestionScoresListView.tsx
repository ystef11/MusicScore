import { memo } from 'react'
import { FlatList, StyleSheet } from 'react-native'

import { useOpenScore } from '@mu-native/score'
import { AppText, layout, presentAlert } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { marketingStoreChunk, marketingThunks } from '@mu-native/marketing'
import { searchStoreChunk } from '@mu-native/search'
import { checkConnectionSafely } from '@mu-native/system'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../../../constants/MetricaEvents.ts'
import { ScoreListItem } from '../../../../Elements/scoreListItem/ScoreListItem.tsx'
import { MSScoreT } from '../../../../Model/MSScore.ts'
import reportEvent from '../../../../Utils/Analytics.ts'
import { isTablet } from '../../../../Utils/Platform.ts'
import { screenExploreThunks } from '../../thunks/thunks.ts'

type TProps = {
    maxCount?: number
}

export const SuggestionScoresListView = memo((props: TProps) => {
    const openScore = useOpenScore()
    const actions = useActions({
        setInAppInfo: marketingStoreChunk.actions.setInAppForSale,
        onScoreItemPress: screenExploreThunks.onScoreItemPress,
        checkOpenScoreForSaleThunk: marketingThunks.checkOpenScoreForSaleThunk,
    })

    const [trendingSearchSuggestions] = useValues([
        searchStoreChunk.props.getTrendingSearchSuggestions,
    ])

    const handleItemPress = (score: MSScoreT) => {
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
                actions.onScoreItemPress(score, {
                    'params.key': ['placement'],
                    'params.str_value': ['search_suggestions'],
                    'params.value': [0],
                })
                openScore(score)
            },
        })
    }
    if (!trendingSearchSuggestions) return null
    if (!trendingSearchSuggestions.trendingScores) return null
    if (trendingSearchSuggestions.trendingScores.length === 0) return null

    let scores = trendingSearchSuggestions.trendingScores
    if (props.maxCount) scores = scores.slice(0, props.maxCount)

    return (
        <FlatList
            key={isTablet ? 'tablet2' : 'mobile1'}
            scrollEnabled={false}
            data={scores}
            numColumns={isTablet ? 2 : undefined}
            style={isTablet ? styles.tablet : styles.list}
            ListHeaderComponent={
                <AppText
                    rawText={translate('native.trending_scores')}
                    font="f20w600"
                    style={styles.trendingSearches}
                />
            }
            renderItem={info => {
                return (
                    <ScoreListItem
                        key={info.item.id}
                        score={info.item}
                        isOdd={info.index % 2 !== 0}
                        onScorePress={handleItemPress}
                        disabled={false}
                        style={styles.mb16}
                    />
                )
            }}
        />
    )
})
SuggestionScoresListView.displayName = 'SuggestionScoresListView'

const styles = StyleSheet.create({
    trendingSearches: {
        height: 44,
        lineHeight: 44,
        marginBottom: 12,
        marginHorizontal: isTablet ? 4 : 0,
    },

    mb16: {
        marginBottom: 16,
        marginHorizontal: -20,
    },

    tablet: {
        marginHorizontal: -4,
        alignSelf: 'center',
    },

    list: {
        marginHorizontal: layout.baseMarginFromEdges,
    },
})
