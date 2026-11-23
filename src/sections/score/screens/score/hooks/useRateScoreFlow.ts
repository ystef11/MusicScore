import { useEffect, useRef } from 'react'

import { platform } from '@mu-native/common'
import { needToAskAppReview, reviewAppStoreChunk } from '@mu-native/reviewApp'
import { scoreStoreChunk } from '@mu-native/score'
import { playbackStatus as PlaybackStatus } from '@mu-native/xtz'
import { useActions, useValues } from '@ug/store'

import {
    ActionSheetContexts,
    showRateScore,
    TActionSheetContext,
} from '../../../../../App/Controllers/ScoreActionsController'
import { requestReviewApp, RequestReviewAppSources } from '../../../../../App/ReviewApp/ReviewAppController'
import reportEvent from '../../../../../App/Utils/Analytics'

export default function useRateScoreFlow() {
    const [score, playbackStatus, openScoreCount, allowedToAskAppRating] = useValues([
        scoreStoreChunk.props.getCurrentScore,
        scoreStoreChunk.props.getPlaybackStatus,
        scoreStoreChunk.props.getOpenScorePerSessionCount,
        needToAskAppReview,
    ])
    const actions = useActions({
        requestAndHide: reviewAppStoreChunk.actions.requestAndHide,
    })

    const callShowRateScore = (context: TActionSheetContext) => {
        if (score && !score.isOfficial) {
            showRateScore(score, context)
        }
    }

    const prevValues = useRef({ playbackStatus, openScoreCount })
    useEffect(() => {
        if (
            prevValues.current.playbackStatus === PlaybackStatus.playing &&
            playbackStatus === PlaybackStatus.stopped
        ) {
            callShowRateScore(ActionSheetContexts.PLAYBACK)
        }
        prevValues.current.playbackStatus = playbackStatus
    }, [playbackStatus])

    useEffect(() => {
        if (prevValues.current.openScoreCount === 2 && openScoreCount === 3) {
            reportEvent('Rate: open 3rd score in session')
            if (allowedToAskAppRating) {
                reportEvent('Rate: request rating modal at 3rd score open')
                requestReviewApp(
                    // @ts-ignore
                    RequestReviewAppSources.OPEN_SCORE,
                    () => {
                        actions.requestAndHide({ days: platform.isIos ? 30 : 14 })
                    },
                    undefined,
                    { openAppStoreIfInAppFails: false },
                )
            }
        }
        prevValues.current.openScoreCount = openScoreCount
    }, [openScoreCount])
}
