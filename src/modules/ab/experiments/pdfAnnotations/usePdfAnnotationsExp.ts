import { useEffect } from 'react'

import MetricaEvents from '../../../../App/constants/MetricaEvents.ts'
import reportEvent from '../../../../App/Utils/Analytics.ts'
import { useExperimentVariation } from '../../hooks/useExperimentVariation'

import { experimentId } from './constants'

export const usePdfAnnotationsFeatureFlag = (): boolean => {
    const variation = useExperimentVariation(experimentId)
    return variation === 2
}

export function useRegisterPdfAnnotationsExp(enabled: boolean) {
    useEffect(() => {
        if (!enabled) return
        reportEvent(MetricaEvents.USER_EXPERIMENT_PARTICIPATE, { value: experimentId })
    }, [enabled])
}
