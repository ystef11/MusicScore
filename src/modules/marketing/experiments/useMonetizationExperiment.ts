import { useEffect } from 'react'

import { useExperimentVariation } from '@mu-native/ab'
import { useValues } from '@ug/store'

import MetricaEvents from '../../../App/constants/MetricaEvents'
import reportEvent from '../../../App/Utils/Analytics'

import { getIsMonetizationPaidTraffic } from './getIsMonetizationPaidTraffic.ts'

export const useMonetizationExperiment = (
    isInitExp: boolean,
    id: number,
    name: string,
    forceInit = false,
) => {
    const variation = useExperimentVariation(id)
    const [isPaidTraffic] = useValues([getIsMonetizationPaidTraffic])

    // выключаем экспы для платного трафика, то есть пользователей кто перешел по диплинкам из соц сетей,
    // требование команды маркетинга
    const paidTraffic = isPaidTraffic && !forceInit

    useEffect(() => {
        if (!paidTraffic && isInitExp) {
            reportEvent(MetricaEvents.USER_EXPERIMENT_PARTICIPATE, {
                value: id,
            })
        }
    }, [isInitExp])

    return { variation: paidTraffic ? 1 : variation }
}
