import { memo, useState } from 'react'

import { useRoute } from '@mu-native/navigation'
import { scoreStoreChunk } from '@mu-native/score'
import { useActions, useValues } from '@ug/store'

import { ScoreScreenContainer } from './containers/ScoreScreenContainer'

export const ScoreScreen = memo(() => {
    const route = useRoute<any>()
    const [didUpdateScore, setUpdateScore] = useState(false)
    const { score: initialScore } = route.params
    const [currentScore] = useValues([scoreStoreChunk.props.getCurrentScore])
    const actions = useActions({
        setCurrentScore: scoreStoreChunk.actions.setCurrentScore,
    })
    // prevents to render old score screen before update it to actual
    if (currentScore && currentScore.id !== initialScore.id && !didUpdateScore) {
        actions.setCurrentScore(initialScore)
        setUpdateScore(true)
        return null
    }

    return <ScoreScreenContainer />
})
