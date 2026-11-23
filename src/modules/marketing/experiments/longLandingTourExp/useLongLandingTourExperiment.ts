import { platform } from '@mu-native/common'

import { ExperimentsMonetization } from '../../constants/experiments.ts'
import { useMonetizationExperiment } from '../useMonetizationExperiment.ts'

export const longLandingTourExpId = 8486

export const useLongLandingTourExperiment = (isInitExp: boolean) => {
    const { variation } = useMonetizationExperiment(
        platform.isIos && isInitExp,
        longLandingTourExpId,
        ExperimentsMonetization.longLandingTour,
    )

    return { isLongLandingTour: platform.isIos && variation === 2 }
}
