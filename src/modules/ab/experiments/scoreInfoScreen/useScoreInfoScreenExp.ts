import { TThunkAction } from '@mu-native/common'

import MetricaEvents from '../../../../App/constants/MetricaEvents.ts'
import reportEvent from '../../../../App/Utils/Analytics.ts'
import { useExperimentVariation } from '../../hooks/useExperimentVariation.ts'

import { experimentId } from './constants'

/**
 * Whether the new Score Info screen should be shown instead of opening the
 * score player directly. Variation 2 is the test group (new screen); 1/control
 * keeps the legacy flow.
 */
export const useScoreInfoScreenFeatureFlag = (): boolean => {
    return useExperimentVariation(experimentId) === 2
}

/**
 * Registers the user into the Score Info experiment funnel and sends the
 * participation event. Dispatch this at the moment an eligible score is opened
 * — for BOTH variations — so control and test groups are counted at the same
 * funnel point (not on the Info screen, which only the test group reaches).
 */
export const registerScoreInfoScreenExp: TThunkAction = () => () => {
    reportEvent(MetricaEvents.USER_EXPERIMENT_PARTICIPATE, { value: experimentId })
}
