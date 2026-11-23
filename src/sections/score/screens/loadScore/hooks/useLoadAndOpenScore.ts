import { useCallback, useEffect } from 'react'

import { ApiErrorCodes, responseCode } from '@mu-native/api'
import { marketingStoreChunk } from '@mu-native/marketing'
import { Screen, useAppNavigation } from '@mu-native/navigation'
import { navigateToScore } from '@mu-native/score'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../../../../App/constants/MetricaEvents.ts'
import { getScoreMetaEvent } from '../../../../../App/constants/scoreAnalytic.ts'
import { showFetchScoreInfoErrorsPopup } from '../../../../../App/Score/scoreErrorPopups'
import {
    performGerScoreMetadataRequest,
    performGetScoreInfoRequest,
} from '../../../../../App/Services/ScoreInfoProvider'
import reportEvent from '../../../../../App/Utils/Analytics'

export const useLoadAndOpenScore = (scoreId: string) => {
    const navigation = useAppNavigation()
    const [referralData] = useValues([marketingStoreChunk.props.getReferralData])
    const actions = useActions({
        setReferralScoreCustom: marketingStoreChunk.actions.setReferralScoreCustom,
    })

    /**
     * A deep link opened from a cold start makes LoadScore the whole stack, so
     * popToTop had nothing to pop: leaving the sheet there would strand the user
     * on the loader with no way back. Anywhere else popToTop already left it.
     */
    const isOnLoadScore = useCallback(() => {
        const state = navigation.getState()
        return state?.routes[state.index]?.name === Screen.loadScore
    }, [navigation])

    const leaveLoadScore = useCallback(() => {
        if (isOnLoadScore()) navigation.replace(Screen.tabNavigator)
    }, [navigation, isOnLoadScore])

    useEffect(() => {
        ;(async () => {
            const isReferral = referralData?.score?.score_id?.toString() === scoreId
            const run = async (method: 'push' | 'replace' = 'replace') => {
                const secondaryId = await performGerScoreMetadataRequest(scoreId)
                if (!secondaryId) throw new Error('Failed to load score.')

                const { score } = await performGetScoreInfoRequest(secondaryId, 'ONLINE', true)
                navigateToScore(score, undefined, method)

                if (isReferral) {
                    reportEvent(
                        MetricaEvents.SCORE_REFERRAL_VIEW,
                        getScoreMetaEvent(score, false, {
                            'params.key': ['mobweb_unified_id'],
                            'params.str_value': [referralData.unified_id],
                            'params.value': [0],
                        }),
                    )
                }
            }

            try {
                await run()
            } catch (e) {
                reportEvent(MetricaEvents.SCORE_OPEN_DEEPLINK_ERROR, {
                    'params.key': ['error', 'is_referral'],
                    'params.str_value': [(e as Error).message, ''],
                    'params.value': [0, isReferral ? 1 : 0],
                })
                // The popup routes on the error itself — not found, too many
                // requests, country blocked, Pro Plus required all have their own
                // branch — so it has to see the real failure (MUP-14309).
                // Pro Plus is the one branch that navigates somewhere useful (the
                // paywall) instead of just explaining itself, and popping to the
                // root first would strand the buyer there.
                if ((await responseCode(e)) !== ApiErrorCodes.userProPlusSubscriptionRequired) {
                    navigation.popToTop()
                }
                await showFetchScoreInfoErrorsPopup(e, {
                    // After popToTop this screen is gone and the score has to be
                    // pushed; on a cold start it is still here and gets replaced.
                    retry: () => run(isOnLoadScore() ? 'replace' : 'push'),
                    source: 'loadScore',
                    onDismiss: leaveLoadScore,
                })
            } finally {
                actions.setReferralScoreCustom(null)
            }
        })()
    }, [scoreId, navigation])
}
