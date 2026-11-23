import { useOpenScore } from '@mu-native/score'
import { presentAlert } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { marketingStoreChunk, marketingThunks } from '@mu-native/marketing'
import { checkConnectionSafely } from '@mu-native/system'
import { TUniversalScoreListDynamicStoreChunk } from '@mu-native/universal-score-list'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../constants/MetricaEvents.ts'
import { getScoreMetaEvent } from '../../constants/scoreAnalytic.ts'
import { MSScoreT } from '../../Model/MSScore.ts'
import reportEvent from '../../Utils/Analytics.ts'

export const useScoreListProps = (
    storeChunk: TUniversalScoreListDynamicStoreChunk,
    analyticsPlace: string,
) => {
    const openScore = useOpenScore()
    const [scoreIds, scoresMap, isLoading, isInitialLoading] = useValues([
        storeChunk.props.getScoresIds,
        storeChunk.props.getScoresMap,
        storeChunk.props.getIsLoading,
        storeChunk.props.getIsInitialLoading,
    ])
    const scores = scoreIds && scoresMap ? scoreIds.map(id => scoresMap[id]).filter(Boolean) : []
    const actions = useActions({
        setInAppInfo: marketingStoreChunk.actions.setInAppForSale,
        checkOpenScoreForSaleThunk: marketingThunks.checkOpenScoreForSaleThunk,
    })

    const onScorePress = (score: MSScoreT) => {
        if (score?.score_blocked_by_country) {
            presentAlert({ rawTitle: translate('native.score.blocked.in.country') })
            return
        }

        reportEvent(MetricaEvents.SCORE_CLICK, {
            ...getScoreMetaEvent(score),
            place: analyticsPlace,
        })

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
                openScore(score)
            },
        })
    }

    return {
        scores,
        onScorePress,
        isLoading,
        isInitialLoading,
    }
}
