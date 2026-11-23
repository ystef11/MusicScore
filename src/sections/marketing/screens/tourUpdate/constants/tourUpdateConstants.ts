import { platform } from '@mu-native/common'
import { layout } from '@mu-native/ds'
import { PlainLocaleKey, translate } from '@mu-native/locale'

// eslint-disable-next-line import/no-relative-packages
import MetricaEvents from '../../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../../App/Utils/Analytics'

export const TOUR_TEXT_TITLE: PlainLocaleKey[] = [
    'native.marketing.tour_update.title_ms4_scores',
    'native.marketing.tour_update.title_thousands_more',
    'native.marketing.tour_update.title_elegant',
    'native.marketing.tour_update.title_say_thanks',
]

export const TOUR_TEXT_SUBTITLE: PlainLocaleKey[] = [
    'native.marketing.tour_update.subtitle_say_hello',
    'native.marketing.tour_update.subtitle_open_catalog',
    'native.marketing.tour_update.subtitle_better_looking',
    'native.marketing.tour_update.subtitle_share_thoughts',
]

export const quizName = 'tour_update_metronome'

export const reportTourUpdateStep = (step: string) => {
    reportEvent(MetricaEvents.TOUR_UPDATE_STEP_VIEW, {
        value: step,
        funnel_source: quizName,
    })
}

export const enum TourUpdateSteps {
    FIRST_STEP = 0,
    SECOND_STEP = 1,
    THIRD_STEP = 2,
    FOURTH_STEP = 3,
    FIFTH_STEP = 4,
    SIXTH_STEP = 5,
    LAST_STEP = 6,
}

export const imageMaxHeight = layout.fullScreenWidth * (platform.isTablet ? 1 : 1648 / 1338)

export const getTitlePaymentScreen = () => translate('native.marketing.tour_update.payment_title')

export const getBenefitsTourUpdate = () => [
    translate('native.marketing.tour_update.benefit_scan_photos'),
    translate('native.marketing.tour_update.benefit_convert_pdfs'),
    translate('native.marketing.tour_update.benefit_upload_arrangements'),
    translate('native.marketing.tour_update.benefit_offline_library'),
]
