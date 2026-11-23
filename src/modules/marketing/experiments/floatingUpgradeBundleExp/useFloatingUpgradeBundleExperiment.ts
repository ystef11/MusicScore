import { platform } from '@mu-native/common'

import { ExperimentsMonetization } from '../../constants/experiments.ts'
import { useMonetizationExperiment } from '../useMonetizationExperiment.ts'

const floatingUpgradeBundleExpId = platform.isIos ? 8516 : 8519

export const useFloatingUpgradeBundleExperiment = (isInitExp: boolean) => {
    const { variation } = useMonetizationExperiment(
        isInitExp,
        floatingUpgradeBundleExpId,
        ExperimentsMonetization.floatingUpgradeBundle,
    )

    return { isFloatingUpgradeBundleVariation: variation === 2 }
}
