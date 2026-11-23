import { AppState } from 'react-native'

import { abStoreChunk, getExperimentVariation } from '@mu-native/ab'
import { getIsAuthorized } from '@mu-native/auth'
import type { TThunkAction } from '@mu-native/common'
import { reviewAppStoreChunk } from '@mu-native/reviewApp'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { appEventsEmitter } from '@mu-native/system'

import reportEvent from '../../../App/Utils/Analytics'
import { NPS_EXPERIMENT_ID } from '../constants/npsConstants'
import { getNpsIneligibilityReason, getNpsSurveyTypeForSession } from '../helpers/npsEligibility'
import { getTopRouteName } from '../helpers/npsNavigation'
import { getServerSessionStartedAt } from '../helpers/npsSession'

import { npsStoreChunk } from './npsStoreChunk'

let isShownInProcess = false

export const tryShowNpsThunk: TThunkAction = () => (dispatch, getState) => {
    const state = getState()
    const session = abStoreChunk.props.getSession(state)
    const sessionNumber = session.number ?? 0
    const reason = getNpsIneligibilityReason({
        isAppActive: AppState.currentState === 'active',
        topRouteName: getTopRouteName(),
        isAuthorized: getIsAuthorized(state),
        isExperimentEnabled: getExperimentVariation(NPS_EXPERIMENT_ID, state) !== undefined,
        sessionNumber,
        sessionStartedAt: getServerSessionStartedAt(session.id),
        shownSlots: npsStoreChunk.props.getShownSlots(state),
        requestedReviewAt: reviewAppStoreChunk.props.getRequestedReviewAt(state),
        isShownInProcess,
    })
    const surveyType = getNpsSurveyTypeForSession(sessionNumber)
    if (reason !== null || !surveyType) return

    isShownInProcess = true
    dispatch(npsStoreChunk.actions.addShownSlot(surveyType))
    reportEvent(RT_EVENTS.USER_EXPERIMENT_PARTICIPATE, { value: NPS_EXPERIMENT_ID })
    appEventsEmitter.emit('presentNpsSheet', { sessionNumber })
}

/** Engineer menu: present the sheet right away, skipping every eligibility rule. */
export const showNpsNowThunk: TThunkAction = () => (_dispatch, getState) => {
    appEventsEmitter.emit('presentNpsSheet', {
        sessionNumber: abStoreChunk.props.getSession(getState()).number ?? 0,
    })
}

export const resetNpsThunk: TThunkAction = () => dispatch => {
    isShownInProcess = false
    dispatch(npsStoreChunk.actions.resetState())
}
