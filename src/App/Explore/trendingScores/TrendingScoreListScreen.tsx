import { useEffect } from 'react'

import { translate } from '@mu-native/locale'
import { useActions } from '@ug/store'

import { CustomScoreListScreen } from '../CustomScoreList/CustomScoreListScreen.tsx'

import { trendingScoresThunks } from './trendingScoresThunks.ts'
import { trendingStoreChunk } from './trendingStoreChunk.ts'

export const TrendingScoreListScreen = () => {
    const actions = useActions({
        fetchScores: trendingScoresThunks.fetchScores,
    })

    useEffect(() => {
        actions.fetchScores()
    }, [])

    return (
        <CustomScoreListScreen
            storeChunk={trendingStoreChunk}
            title={translate('native.screen_explore.trending_now')}
            analyticsPlace="Trending"
        />
    )
}
