import { useEffect, useState } from 'react'

import { scoreStoreChunk, scoreThunks, TScoreSourceFile } from '@mu-native/score'
import { useActions } from '@ug/store'

import { getLocalFileUrl } from '../../../../../App/Score/scoreActionsAsync'
import { MSScoreT } from '../types/scoreTypes'

export const useFetchScore = (score: MSScoreT | null) => {
    const [source, setSource] = useState<TScoreSourceFile | null>(null)
    const actions = useActions({
        openScore: scoreThunks.openScore,
        setScoreUri: scoreStoreChunk.actions.setScoreUri,
    })

    useEffect(() => {
        let cancelled = false
        setSource(null)
        if (!score) return
        ;(async () => {
            try {
                const isOffline = await actions.openScore(score)
                if (cancelled || typeof isOffline !== 'boolean') return
                const fileUrl = await getLocalFileUrl(score, isOffline)
                if (cancelled || !fileUrl) return
                setSource({uri: fileUrl, type: score.isPdf ? 'pdf' : 'interactive'})
                actions.setScoreUri(fileUrl)
            } catch (error) {
                console.warn('Score file resolution failed', error)
            }
        })()
        return () => { cancelled = true }
        // Open once per score identity, not after metadata enriches the store object.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [score?.id, score?.isOffline])

    return { source }
}
