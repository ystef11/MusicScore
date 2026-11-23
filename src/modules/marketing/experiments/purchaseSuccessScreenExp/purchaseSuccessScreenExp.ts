import { getExperimentVariation } from '@mu-native/ab'
import { platform, TThunkActionR } from '@mu-native/common'

import MetricaEvents from '../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../App/Utils/Analytics'
import { ExperimentsMonetization } from '../../constants/experiments.ts'
import { getIsMonetizationPaidTraffic } from '../getIsMonetizationPaidTraffic.ts'

export const purchaseSuccessScreenExp = {
    id: platform.isIos ? 8420 : 8423,
    name: ExperimentsMonetization.purchaseSuccessScreen,
}

export const checkPurchaseSuccessScreenExpThunk: TThunkActionR<boolean> =
    () => async (dispatch, getState) => {
        const state = getState()

        if (getIsMonetizationPaidTraffic(state)) return false

        reportEvent(MetricaEvents.USER_EXPERIMENT_PARTICIPATE, {
            value: purchaseSuccessScreenExp.id,
        })

        return getExperimentVariation(purchaseSuccessScreenExp.id, state) === 2
    }
