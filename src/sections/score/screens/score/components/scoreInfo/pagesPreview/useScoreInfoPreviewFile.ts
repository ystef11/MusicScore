import { useEffect, useState } from 'react'

import { scoreThunks } from '@mu-native/score'
import { useActions } from '@ug/store'

import { getLocalFileUrl } from '../../../../../../../App/Score/scoreActionsAsync'
import Sentry from '../../../../../../../App/Utils/Sentry'
import { MSScoreT } from '../../../types/scoreTypes'

/** Downloads + decrypts the score file once per score. Null until it's on disk. */
export const useScoreInfoPreviewFile = (score: MSScoreT, enabled: boolean) => {
    const actions = useActions({ openScore: scoreThunks.openScore })
    const [uri, setUri] = useState<string | null>(null)

    useEffect(() => {
        if (!enabled || uri) return undefined
        let cancelled = false
        ;(async () => {
            try {
                const isOffline = await actions.openScore(score)
                if (cancelled || typeof isOffline !== 'boolean') return
                const fileUrl = await getLocalFileUrl(score, isOffline)
                if (cancelled) return
                if (!fileUrl) throw new Error('Local score file URL is null')
                setUri(fileUrl)
            } catch (e) {
                Sentry.sendMessage('ScoreInfoPagesPreview.resolveUri', e)
            }
        })()
        return () => {
            cancelled = true
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, uri, score.id])

    return uri
}
