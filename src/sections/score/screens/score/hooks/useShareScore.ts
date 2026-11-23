import { useCallback, useState } from 'react'

import { useActions } from '@ug/store'

import { share } from '../../../../../App/Controllers/ScoreActionsController'
import { MSScoreT } from '../types/scoreTypes'

export function useShareScore(score: MSScoreT) {
    const actions = useActions({ share })
    const [isSharing, setIsSharing] = useState(false)

    const shareScore = useCallback(async () => {
        setIsSharing(true)
        try {
            await actions.share(score)
        } finally {
            setIsSharing(false)
        }
    }, [actions, score])

    return { isSharing, shareScore }
}
