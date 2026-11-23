import { useEffect, useRef } from 'react'

import { marketingStoreChunk, sources } from '@mu-native/marketing'
import { navigationStoreChunk, Screen, useRoute } from '@mu-native/navigation'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { getCurrentScoreMeta, scoreStoreChunk, scoreThunks } from '@mu-native/score'
import { useAppState } from '@mu-native/system'
import { useActions, useValues } from '@ug/store'

import { checkPremiumThunk } from '../../../../../App/Controllers/ScoreActionsController.ts'
import { updateRecentlyEvents } from '../../../../../App/Explore/exploreAsyncActions'
import reportEvent from '../../../../../App/Utils/Analytics'
import { getScoreMetaEvent } from '../helpers/scoreHelpers.ts'
import { MSScoreT } from '../types/scoreTypes.ts'

const useScoreViewerInit = (score: (MSScoreT & { mobile_app_web?: boolean }) | null) => {
    const route = useRoute()
    const [isScoreLoaded, scoreMeta, isOffScores, isPaymentInProgress] = useValues([
        scoreStoreChunk.props.getIsSuccessLoading,
        getCurrentScoreMeta,
        marketingStoreChunk.props.getIsOffScores,
        marketingStoreChunk.props.getIsPaymentInProgress,
    ])
    const startDateRef = useRef(Date.now())
    const actions = useActions({
        ...scoreStoreChunk.actions,
        setScreen: navigationStoreChunk.actions.setScreens,
        updateRecentlyEvents,
        setMarketingFieldsCustom: marketingStoreChunk.actions.setPartialFieldsCustom,
        checkPremiumThunk,
    })

    useEffect(() => {
        console.log(
            `[SCORE_DBG] useScoreViewerInit: setCurrentScore, score.id=${score?.id}, t=${Date.now()}`,
        )
        actions.setScreen(Screen.score)
        // @ts-ignore
        actions.setCurrentScore(score)
        if (score?.mobile_app_web) {
            reportEvent('Score ms4 error: page view')
        }

        return () => {
            console.log(`[SCORE_DBG] useScoreViewerInit: reset() called (cleanup), t=${Date.now()}`)
            actions.reset()
        }
    }, [actions, score, score?.id])

    useEffect(() => {
        if (isScoreLoaded) {
            startDateRef.current = Date.now()
            actions.incrementOpenScoreCount()
        }

        return () => {
            if (isScoreLoaded && score) {
                const endDate = Date.now()
                const timeSpent = Math.floor((endDate - startDateRef.current) / 1000)
                actions.updateRecentlyEvents(score, timeSpent)
            }
        }
    }, [actions, isScoreLoaded, score?.id])

    useEffect(() => {
        if (isScoreLoaded) {
            const { isDeepLink } = (route?.params as any) || { isDeepLink: false }
            if (score) {
                if (!isDeepLink) {
                    reportEvent(RT_EVENTS.SCORE_READ, getScoreMetaEvent(score))
                }
            }
        }
    }, [isScoreLoaded, route?.params, score, score?.id, scoreMeta])

    useAppState(
        appState => {
            if (appState === 'inactive') {
                reportEvent(RT_EVENTS.SCORE_MINIMIZE, {
                    scoreId: score?.id,
                })
            }
            if (appState === 'active') {
                reportEvent(RT_EVENTS.SCORE_MAXIMIZE, {
                    scoreId: score?.id,
                })
                startDateRef.current = Date.now()
            }
            if (appState.match(/inactive|background/)) {
                if (!isOffScores && !score?.isPurchased) {
                    scoreThunks.pauseScore()

                    if (!isPaymentInProgress) {
                        actions.setMarketingFieldsCustom({
                            source: sources.backgroundPlayback,
                            featureText: 'marketing_text.background_playback',
                        })
                        actions.checkPremiumThunk()
                    }
                }
                if (isScoreLoaded && score) {
                    const endDate = Date.now()
                    const timeSpent = Math.floor((endDate - startDateRef.current) / 1000)
                    actions.updateRecentlyEvents(score, timeSpent)
                }
            }
        },
        [score?.id, isPaymentInProgress],
    )
}

export default useScoreViewerInit
