import { useExperimentVariation } from '../../hooks/useExperimentVariation'

import { experimentId } from './constants'

export const usePracticeModeFeatureFlag = () => {
    const variation = useExperimentVariation(experimentId)
    return !!variation
}
