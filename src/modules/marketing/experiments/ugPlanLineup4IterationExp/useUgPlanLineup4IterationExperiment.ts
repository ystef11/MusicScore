import { platform } from '@mu-native/common'

import { ExperimentsMonetization } from '../../constants/experiments.ts'
import { useMonetizationExperiment } from '../useMonetizationExperiment.ts'

export type TUgPlanLineup4IterationVariation = 1 | 2

export const ugPlanLineup4IterationExpId = 8405

const ugPlanLineup4IterationForcedVariation: TUgPlanLineup4IterationVariation | undefined =
    undefined

export const useUgPlanLineup4IterationExperiment = (
    isInitExp = false,
    forcedVariation:
        | TUgPlanLineup4IterationVariation
        | undefined = ugPlanLineup4IterationForcedVariation,
) => {
    const { variation: expVariation } = useMonetizationExperiment(
        platform.isIos && isInitExp && !forcedVariation,
        ugPlanLineup4IterationExpId,
        ExperimentsMonetization.adoptUgPlan4iterationBundle,
    )

    const variation = platform.isIos ? (forcedVariation ?? expVariation) : 1

    return {
        variation,
        isUgPlanLineup: variation === 2,
        isUgPlanLineup4Iteration: variation === 2,
    }
}
