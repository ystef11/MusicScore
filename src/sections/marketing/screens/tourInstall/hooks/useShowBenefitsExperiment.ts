import { platform } from '@mu-native/common'
import { ExperimentsMonetization, useMonetizationExperiment } from '@mu-native/marketing'

export const useShowBenefitsExperiment = (isInit: boolean) => {
    const { variation } = useMonetizationExperiment(
        isInit,
        platform.isIos ? 8168 : 8171,
        ExperimentsMonetization.showBenefitsInTour,
    )

    return {
        variation,
        isShowBenefits: variation === 2 || variation === 3,
    }
}
