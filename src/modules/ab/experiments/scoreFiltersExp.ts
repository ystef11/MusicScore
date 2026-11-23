import { useEffect } from 'react'
import { Platform } from 'react-native'

import { useExperimentVariation } from '@mu-native/ab'

import MetricaEvents from '../../../App/constants/MetricaEvents.ts'
import reportEvent from '../../../App/Utils/Analytics.ts'

const experimentId = Platform.OS === 'ios' ? 7153 : 7156

type Types = 'A' | 'B' | 'C'

export const useScoreFiltersExp = (): Types => {
    // return 'B'
    const variation = useExperimentVariation(experimentId)
    return { 1: 'A', 2: 'B', 3: 'C' }[variation] as Types
}

export function useRegisterScoreFiltersExp() {
    useEffect(() => {
        reportEvent(MetricaEvents.USER_EXPERIMENT_PARTICIPATE, { value: experimentId })
    }, [])
}
