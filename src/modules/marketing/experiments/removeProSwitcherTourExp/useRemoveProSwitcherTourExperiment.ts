import { platform } from '@mu-native/common'

import { ExperimentsMonetization } from '../../constants/experiments.ts'
import { useMonetizationExperiment } from '../useMonetizationExperiment.ts'

export const removeProSwitcherTourExpId = 8483

export const useRemoveProSwitcherTourExperiment = (isInitExp: boolean) => {
    const { variation } = useMonetizationExperiment(
        platform.isIos && isInitExp,
        removeProSwitcherTourExpId,
        ExperimentsMonetization.removeProSwitcherTour,
    )

    return { isRemoveProSwitcherTour: platform.isIos && variation === 2 }
}
