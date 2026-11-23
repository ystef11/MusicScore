import { useCallback } from 'react'

import { useOpenScore } from '@mu-native/score'
import { presentAlert } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { marketingStoreChunk, marketingThunks } from '@mu-native/marketing'
import { buildShazamScoreClickEventParams } from '@mu-native/shazam'
import { checkConnectionSafely } from '@mu-native/system'
import { useActions } from '@ug/store'

import MetricaEvents from '../../App/constants/MetricaEvents.ts'
import { getScoreMetaEvent } from '../../App/constants/scoreAnalytic.ts'
import type { MSScoreT } from '../../App/Model/MSScore.ts'
import reportEvent from '../../App/Utils/Analytics.ts'

type Place = 'Shazam Song' | 'Shazam Artist'

export const useShazamScorePress = (place: Place, scores: MSScoreT[]) => {
    const openScore = useOpenScore()
    const actions = useActions({
        setInAppInfo: marketingStoreChunk.actions.setInAppForSale,
        checkOpenScoreForSaleThunk: marketingThunks.checkOpenScoreForSaleThunk,
    })

    return useCallback(
        (score: MSScoreT) => {
            if (score?.score_blocked_by_country) {
                presentAlert({ rawTitle: translate('native.score.blocked.in.country') })
                return
            }

            reportEvent(
                MetricaEvents.SCORE_CLICK,
                getScoreMetaEvent(score, score?.isOfficial, { place }),
            )
            reportEvent(
                MetricaEvents.SEARCH_BROWSE_RESULTS_CLICK,
                buildShazamScoreClickEventParams({ score, scores }),
            )

            actions.setInAppInfo({
                id: score?.id,
                title: score?.title,
                isPurchased: score?.isPurchased,
            })

            actions.checkOpenScoreForSaleThunk({
                ui: 'Shazam',
                score,
                callbackAfterCheck: () => {
                    if (!checkConnectionSafely()) return
                    openScore(score)
                },
            })
        },
        [actions, openScore, place, scores],
    )
}
