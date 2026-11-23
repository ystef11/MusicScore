import { memo } from 'react'

import { useTimerSale } from './hooks/useTimerSale'
import { TIMER_SALE_CONFIG, TIMER_SALE_OFF_SCORES_CONFIG } from './timerSaleConfigs'

export const TimerSaleEffectsContainer = memo(() => {
    useTimerSale(TIMER_SALE_CONFIG)
    useTimerSale(TIMER_SALE_OFF_SCORES_CONFIG)

    return null
})
