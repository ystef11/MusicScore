import { useEffect } from 'react'
import { Platform } from 'react-native'

import MetricaEvents from '../../../App/constants/MetricaEvents.ts'
import reportEvent from '../../../App/Utils/Analytics.ts'

const experimentId = Platform.OS === 'ios' ? 7268 : 7265

export function useEnhanceSearchWithApostrophesExp() {
    useEffect(() => {
        reportEvent(MetricaEvents.USER_EXPERIMENT_PARTICIPATE, { value: experimentId })
    }, [])
}
