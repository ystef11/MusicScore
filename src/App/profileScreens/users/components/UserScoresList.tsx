import { forwardRef, ReactElement, useCallback, useEffect, useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { useOpenScore } from '@mu-native/score'
import { marketingThunks } from '@mu-native/marketing'
import { useUniversalScoreListContext } from '@mu-native/universal-score-list'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../../constants/MetricaEvents'
import { getScoreMetaEvent } from '../../../constants/scoreAnalytic'
import { COLOR_WHITE } from '../../../constants/styles'
import {
    loadMoreUserScores,
    updateUserScores,
} from '../../../Library/UserScores/userScoreAsyncActions'
import type { MSScoreT } from '../../../Model/MSScore'
import MSFlashList, { TScoreList } from '../../../MSComponents/MSFlashList'
import '../../../Model/MSScore'
import reportEvent from '../../../Utils/Analytics'

type TProps = {
    userId: number
    testID?: string
    ListHeaderComponent?: ReactElement<any, any> | null | undefined
    ListEmptyComponent?: ReactElement<any, any> | null | undefined
}

export const UserScoresList = forwardRef<TScoreList, TProps>(
    ({ userId, testID, ListHeaderComponent, ListEmptyComponent }, ref) => {
        const openScore = useOpenScore()
        const scoreListChunk = useUniversalScoreListContext()
        const [scoreIds, scoresMap] = useValues([
            scoreListChunk.props.getScoresIds,
            scoreListChunk.props.getScoresMap,
        ])
        const scores = useMemo(() => {
            if (!scoreIds || !scoresMap) return []
            return scoreIds.map(id => scoresMap[id]).filter(score => !!score)
        }, [scoreIds, scoresMap])

        const [isLoading, currentPage, totalPages] = useValues([
            scoreListChunk.props.getIsLoading,
            scoreListChunk.props.getCurrentPage,
            scoreListChunk.props.getTotalPages,
        ])

        const { update, loadMoreScores, checkOpenScoreForSaleThunk } = useActions({
            update: updateUserScores,
            loadMoreScores: loadMoreUserScores,
            checkOpenScoreForSaleThunk: marketingThunks.checkOpenScoreForSaleThunk,
        })

        useEffect(() => {
            update(scoreListChunk)
        }, [])

        const [refreshing, setRefreshing] = useState(false)
        const onRefresh = useCallback(async () => {
            try {
                setRefreshing(true)
                await update(scoreListChunk)
            } finally {
                setRefreshing(false)
            }
        }, [userId])

        const onItemPress = useCallback((score: MSScoreT) => {
            checkOpenScoreForSaleThunk({
                ui: 'uploaded',
                score,
                callbackAfterCheck: () => {
                    reportEvent(
                        MetricaEvents.SCORE_CLICK,
                        getScoreMetaEvent(score, score?.isOfficial, { place: 'User Scores' }),
                    )
                    openScore(score)
                },
            })
        }, [])

        const onLoadMore = useCallback(() => {
            if (currentPage < totalPages) {
                loadMoreScores(scoreListChunk)
            }
        }, [currentPage, loadMoreScores, scoreListChunk, totalPages])

        return (
            <View style={styles.container}>
                <MSFlashList
                    testID={testID ? `${testID} score` : undefined}
                    ref={ref}
                    scores={scores}
                    onItemPress={onItemPress}
                    isLoading={isLoading}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    ListEmptyComponent={ListEmptyComponent}
                    listHeaderComponent={ListHeaderComponent}
                    loadMore={onLoadMore}
                />
            </View>
        )
    },
)

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLOR_WHITE,
        flex: 1,
        marginTop: -4,
    },
})
