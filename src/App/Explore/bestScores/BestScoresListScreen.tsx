import { useEffect } from 'react'

import { translate } from '@mu-native/locale'
import { useActions } from '@ug/store'

import { CustomScoreListScreen } from '../CustomScoreList/CustomScoreListScreen.tsx'

import { bestScoresStoreChunk } from './bestScoresStoreChunk.ts'
import { bestScoresThunks } from './bestScoresThunks.ts'

export const BestScoresListScreen = () => {
    const actions = useActions({
        fetchScores: bestScoresThunks.fetchScores,
    })

    useEffect(() => {
        actions.fetchScores()
    }, [])

    return (
        <CustomScoreListScreen
            storeChunk={bestScoresStoreChunk}
            title={translate('native.screen_explore.best_of_musescore')}
            analyticsPlace="Best"
        />
    )
}
