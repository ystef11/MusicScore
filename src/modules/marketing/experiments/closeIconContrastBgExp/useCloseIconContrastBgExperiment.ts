import { platform } from '@mu-native/common'

import { ExperimentsMonetization } from '../../constants/experiments.ts'
import { useMonetizationExperiment } from '../useMonetizationExperiment.ts'

const closeIconContrastBgExpId = platform.isIos ? 8456 : 8459
export const closeIconContrastBgColor = 'rgba(255,255,255,1)'

export const useCloseIconContrastBgExperiment = (isInitExp: boolean) => {
    const { variation } = useMonetizationExperiment(
        isInitExp,
        closeIconContrastBgExpId,
        ExperimentsMonetization.closeIconContrastBg,
    )

    return { isCloseIconContrastBg: variation === 2 }
}
