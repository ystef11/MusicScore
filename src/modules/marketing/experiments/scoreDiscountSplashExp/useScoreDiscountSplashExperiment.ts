import { useCallback } from 'react'

import { platform } from '@mu-native/common'
import { useValues } from '@ug/store'

import MetricaEvents from '../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../App/Utils/Analytics'
import { ExperimentsMonetization } from '../../constants/experiments.ts'
import { marketingConstants } from '../../constants/marketingConstants'
import { marketingStoreChunk } from '../../store/marketingStoreChunk'
import { getIsMonetizationPaidTraffic } from '../getIsMonetizationPaidTraffic.ts'
import { useMonetizationExperiment } from '../useMonetizationExperiment.ts'

const IOS_EXPERIMENT_ID = 8471
const ANDROID_EXPERIMENT_ID = 8474
const scoreDiscountSplashExpId = platform.isIos ? IOS_EXPERIMENT_ID : ANDROID_EXPERIMENT_ID

const dayMs = 24 * 60 * 60 * 1000

export const scoreDiscountSplashDiscount = marketingConstants.anniversaryDiscount

export const useScoreDiscountSplashExperiment = () => {
    const [shownDate, isPaidTraffic] = useValues([
        marketingStoreChunk.props.getScoreDiscountSplashShownDate,
        getIsMonetizationPaidTraffic,
    ])
    const { variation } = useMonetizationExperiment(
        false,
        scoreDiscountSplashExpId,
        ExperimentsMonetization.scoreDiscountSplash,
    )

    const reportScoreDiscountSplashParticipation = useCallback(() => {
        if (isPaidTraffic) return

        reportEvent(MetricaEvents.USER_EXPERIMENT_PARTICIPATE, { value: scoreDiscountSplashExpId })
    }, [isPaidTraffic])

    return {
        reportScoreDiscountSplashParticipation,
        isScoreDiscountSplashVariation: variation === 2,
        getIsScoreDiscountSplashDayPassed: () => Date.now() - shownDate >= dayMs,
    }
}
