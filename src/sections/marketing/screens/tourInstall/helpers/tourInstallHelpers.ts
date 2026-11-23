import MetricaEvents from '../../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../../App/Utils/Analytics'
import { TourSteps } from '../types/tourTypes.ts'

export const validateButtonTour = (step: number, userName: string) => {
    if (step === TourSteps.NAME_INPUT_SCREEN) return !!userName?.trim()

    return true
}

export const sendConversionDataAnalytics = (conversionData: Record<string, string>) => {
    const isNonOrganicInstall = conversionData?.af_status === 'Non-organic'

    const utmParams = {
        utm_campaign: conversionData?.campaign || '',
        utm_source: conversionData?.media_source || '',
        utm_content: conversionData?.af_adset || '',
        utm_term: conversionData?.af_ad || '',
    }

    reportEvent(MetricaEvents.TOUR_APPSFLYER_DATA, {
        'params.key': Object.keys(conversionData),
        'params.str_value': Object.values(conversionData).map(item => item?.toString() || 'null'),
        'params.value': Object.values(conversionData).map(() => 1),
    })

    if (isNonOrganicInstall) {
        const deepLinkParams = {
            utm_campaign: conversionData?.utm_campaign || '',
            utm_source: conversionData?.utm_source || '',
            utm_content: conversionData?.utm_content || '',
            utm_term: conversionData?.utm_term || '',
            deep_link_value: conversionData?.deep_link_value || '',
            deep_link_sub1: conversionData?.deep_link_sub1 || '',
            campaign: conversionData?.campaign || '',
            media_source: conversionData?.media_source || '',
            install_time: conversionData?.install_time || '',
            af_adset: conversionData?.af_adset || '',
            af_ad: conversionData?.af_ad || '',
            af_c_id: conversionData?.af_c_id || '',
            af_adset_id: conversionData?.af_adset_id || '',
            af_ad_id: conversionData?.af_ad_id || '',
            af_keywords: conversionData?.af_keywords || '',
            keyword_id: conversionData?.keyword_id || '',
            is_deferred_deeplink: 1,
        }

        reportEvent(MetricaEvents.UTM_UPDATE, {
            ...utmParams,
            'utm_params.key': Object.keys(deepLinkParams),
            'utm_params.value': Object.values(deepLinkParams).map(String),
        })
        reportEvent(MetricaEvents.TOUR_DEEPLINK_START, utmParams)
    }
}
