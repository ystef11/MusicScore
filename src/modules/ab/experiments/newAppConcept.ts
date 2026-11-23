import { useEffect } from 'react'
import { Platform } from 'react-native'

import { useExperimentVariation } from '@mu-native/ab'

import MetricaEvents from '../../../App/constants/MetricaEvents.ts'
import reportEvent from '../../../App/Utils/Analytics.ts'
import { getExperimentVariation } from '../helpers/getExperimentVariation'

const experimentId = Platform.OS === 'ios' ? 8186 : 8189

export const useIsNewAppConcept = () => {
    const variation = useExperimentVariation(experimentId)
    return variation === 2
}

export const getIsNewAppConcept = () => getExperimentVariation(experimentId) === 2

export function useRegisterNewAppConceptExp() {
    useEffect(() => {
        reportEvent(MetricaEvents.USER_EXPERIMENT_PARTICIPATE, { value: experimentId })
    }, [])
}
