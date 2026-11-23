import { useCallback } from 'react'

import { presentAlert } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { marketingStoreChunk, marketingThunks } from '@mu-native/marketing'
import { useOpenScore } from '@mu-native/score'
import { checkConnectionSafely } from '@mu-native/system'
import { useActions, useValues } from '@ug/store'

import type { MSScoreT } from '../../../../App/Model/MSScore'

/**
 * Score-open handler with the same gating as the legacy list handlers
 * (`useScoreListProps`): blocked-by-country alert, `inAppForSale` marketing
 * state, and the official-score paywall (`checkOpenScoreForSaleThunk`) before
 * navigating via `useOpenScore`, which routes to the Score Info screen or the
 * score player depending on the MUP-13932 experiment variant. Click analytics
 * stay at the call site — report them before calling the returned handler.
 *
 * `ui` labels the surface in the paywall-shown analytics event
 * (`Score: Official Score Landing Show`).
 */
export const useOpenScorePress = (ui: string) => {
    const openScore = useOpenScore()
    const [purchasedScoreIds] = useValues([marketingStoreChunk.props.getPurchasedScoreIds])
    const actions = useActions({
        setInAppInfo: marketingStoreChunk.actions.setInAppForSale,
        checkOpenScoreForSaleThunk: marketingThunks.checkOpenScoreForSaleThunk,
    })

    return useCallback(
        (listScore: MSScoreT) => {
            if (!listScore) return

            const score =
                !listScore.isPurchased && purchasedScoreIds.includes(String(listScore.id))
                    ? {
                          ...listScore,
                          isPurchased: true,
                          isDownloadable: true,
                      }
                    : listScore

            if (score.score_blocked_by_country) {
                presentAlert({ rawTitle: translate('native.score.blocked.in.country') })
                return
            }

            actions.setInAppInfo({
                id: score.id,
                title: score.title,
                isPurchased: score.isPurchased,
            })

            actions.checkOpenScoreForSaleThunk({
                ui,
                score,
                callbackAfterCheck: () => {
                    if (!checkConnectionSafely()) {
                        return
                    }
                    openScore(score)
                },
            })
        },
        [actions, openScore, purchasedScoreIds, ui],
    )
}
