import { analyticsStoreChunk } from '@mu-native/analytics'
import { store } from '@mu-native/common'

import marketingStoreChunk from '../store/marketingStoreChunk.ts'

/**
 * Экспы монетизации выключены для платного трафика, то есть для пользователей,
 * которые перешли по диплинкам из соц сетей — требование команды маркетинга.
 * Используется и в хуке useMonetizationExperiment, и в thunk-ах, где хука нет.
 */
export const getIsMonetizationPaidTraffic = (state = store.getState()) => {
    const conversionData = analyticsStoreChunk.props.getConversionData(state)
    const referralData = marketingStoreChunk.props.getReferralData(state)

    return !!(
        referralData?.referral ||
        conversionData?.af_status === 'Non-organic' ||
        conversionData?.campaign ||
        conversionData?.media_source ||
        conversionData?.af_adset ||
        conversionData?.af_ad
    )
}
