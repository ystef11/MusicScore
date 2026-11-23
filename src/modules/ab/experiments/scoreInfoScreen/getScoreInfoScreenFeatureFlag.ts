import { getExperimentVariation } from '../../helpers/getExperimentVariation'

import { experimentId } from './constants'

/**
 * Non-hook variant of {@link useScoreInfoScreenFeatureFlag} for use inside
 * thunks / imperative navigation (deep links, offline opening). Variation 2 is
 * the test group (new Score Info screen).
 */
export const getScoreInfoScreenFeatureFlag = (): boolean => {
    return getExperimentVariation(experimentId) === 2
}
