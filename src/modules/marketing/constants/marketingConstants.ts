import { platform } from '@mu-native/common'
import { translate } from '@mu-native/locale'

import type { TProductId, TStockLandingPlanType } from '../types/marketingTypes'

const { currentOs } = platform

export const sources = {
    local: 'Open local file',
    songbook: 'Open songbook',
    addSongbook: 'Add to songbook',
    pdf: 'Export to PDF',
    pdf_trialRestricted: 'Export to PDF (trial restricted)',
    hqSound: 'HQ+ sound',
    tourInstall: 'Tour install',
    tourInstallAndroidGift: 'Tour install Android Gift',
    tourInstallLastChance: 'Tour Install Last Chance',
    tourUpdate: 'Tour update',
    transpose: 'Transpose',
    mixer: 'Mixer',
    metronome: 'Metronome',
    goPro: 'Go pro',
    offScoresLanding: 'Official-scores-landing',
    splashAnniversaryOffer: 'Splash: Anniversary offer',
    splashFloatingButton: 'Splash: FloatingButton',
    splashFloatingButtonCourses: 'Splash: FloatingButton courses',
    splashFloatingButtonUpgradeBundle: 'Splash: FloatingButton upgrade bundle',
    splashReturnOffer: 'Splash: Return offer',
    splashReturnOfferCourses: 'Splash: Return offer courses',
    splashReturnOfferUpgradeBundle: 'Splash: Return offer upgrade bundle',
    keyboard: 'Keyboard',
    autoScroll: 'Autoscroll',
    midi: 'Export to MIDI',
    mp3: 'Export to Mp3',
    coursesVideoPopup: 'Courses: Course video pop-up',
    coursesBottomCTA: 'Courses: Course bottom CTA',
    coursesCatalog: 'Courses: Catalog',
    coursesLanding: 'Courses: Landing',
    courseAddToFavorites: 'Courses: Course add to favorites',
    courseCatalogAddToFavorites: 'Courses: Catalog add to favorites',
    profileSale: 'Splash: ProfileSale',
    splashFlashSale: 'SplashFlashSale',
    splashFlashSaleOffScores: 'Splash FlashSale OffScores',
    pieceSale: 'pieceSale',
    silentRestore: 'SilentRestore',
    restore: 'Restore',
    androidRestore: 'Android Restore',
    autoRenewable: 'Auto-renewable',
    quizUpdateProfile: 'Quiz update: Profile',
    quizUpdateHub: 'Quiz update: Hub',
    catalogBannerEditorPicks: 'Courses: Catalog editor picks',
    coursesRight: 'Courses: right',
    allPage: 'Pricing page',
    pieceSaleOrdersBalance: 'Piece Sale: orders balance',
    pieceSaleProfileBalance: 'Piece Sale: profile balance',
    ebooks: 'Ebook',
    ebooksPieceSale: 'Ebook piece sale',
    pdfPieceSale: 'Pdf Piece Sale',
    splashExpired: 'splash_expired',
    appCellCourses: 'app_cell_courses',
    appCellPremium: 'app_cell_premium',
    appCellOffScores: 'app_cell_pro+',
    autoGrade: 'auto_grade',
    premium: 'premium_modal',
    appleWatchMetronome: 'tour_update_metronome',
    trialToInstant: 'trial_to_instant',
    backgroundPlayback: 'background_playback',
    scan: 'scan',
    firstSession: 'first_session',
} as const

const plans = {
    ios: {
        yearLearn: 'com.musescore.player.1year.learn',
        yearLearnInstant: 'com.musescore.player.1year.instant.learn',
        yearLearnFlashSaleInstant: 'com.musescore.player.1year.instant.learn.flash.sale',
        yearLearn80Instant: 'com.musescore.player.1year.instant.learn.80',
        yearLearn80Trial: 'com.musescore.player.1year.instant.learn.80.trial',
        monthLearn: 'com.musescore.player.1month.learn',
        yearLearn180: 'com.musescore.player.1year.learn.2025',

        monthLearnLite: 'com.musescore.player.1month.learn.lite',
        yearLearnInstantLite: 'com.musescore.player.1year.instant.learn.lite',
        yearLearnLite: 'com.musescore.player.1year.learn.lite',
        monthLearnLiteExp: 'com.musescore.player.1month.learn.lite.2024',
        yearLearnLiteExp: 'com.musescore.player.1year.learn.lite.2024',
        yearLearnLiteTrialExp: 'com.musescore.player.1year.learn.lite.trial.2024',

        oneYear: 'com.musescore.player.year.one.1',
        oneInstant: 'com.musescore.player.1year.instant.one',
        oneMonth: 'com.musescore.player.month.one.1',
        oneYear199: 'com.musescore.player.year.trial.one.199',

        offScoresYearInstantLite: 'com.musescore.player.1year.instant.offscores.lite',
        offScoresMonthLite: 'com.musescore.player.1month.offscores.lite',
        offScoresYearLite: 'com.musescore.player.1year.offscores.lite',
        offScoresYear70Lite: 'com.musescore.player.1year.offscores.70.lite',
        offScoresYear75Lite: 'com.musescore.player.1year.offscores.75.lite',
        offScoreYear14dTrial: '',

        monthLite: 'com.musescore.player.pro.1month.lite',
        year7dayTrialLite: 'com.musescore.player.1year.pro.lite',
        year65offLite: 'com.musescore.player.1year.pro.instant.lite',
        year49usdLite: 'com.musescore.player.1year.pro.49.lite',
        year75offLite: 'com.musescore.player.1year.pro.75.lite',
        yearPro45Lite: 'com.musescore.1year.pro.65.lite',
        year14TrialPro: '',

        // weekly plans
        weekPro: 'com.musescore.player.1week',
        offScores99: 'com.musescore.player.1year.offscores.trial.99',
        offScores69: 'com.musescore.player.1year.offscores.instant.69',
        pro69: 'com.musescore.player.1year.pro.trial.69',
        offScores59: 'com.musescore.player.1year.offscores.59',
        offScoresWeek: 'com.musescore.player.1week.offscores',

        offScoresMonth16lite: 'com.musescore.player.1month.offscores.trial.lite',
        month10lite: 'com.musescore.player.1month.pro.trial.lite',
        offScoresYear99Lite: 'com.musescore.player.1year.offscores.99',
        offScoresTrial69Lite: '',

        // ebooks
        book1YearTrial: 'com.musescore.player.1year.book.trial',
        book1Year: 'com.musescore.player.1year.book',
        book1Week: 'com.musescore.player.1week.book',

        offScoresYear49Lite: '',
        offScoresYear79Lite: '',
        proYear39Lite: '',
        proYear59Lite: '',
        offScores1month19: 'com.musescore.player.1month.19.offscores',
        offScoresWeek15: 'com.musescore.player.1month.15.offscores',
        offScoresYear55Lite: 'com.musescore.1year.85.offscores.lite',

        proPlusAutoGradeInstant: 'com.musescore.player.1year.autograde',
        proPlusAutoGradeWeek: 'com.musescore.player.1month.autograde',
        proPlusAutoGradeMonth: '',

        proPlusIntroductoryYear: 'com.musescore.player.1year.offscores.intro',
        proPlusIntroductoryAnniversaryYear:
            'com.musescore.player.1year.pro.aniversary.introductory',
        proIntroductoryYear: 'com.musescore.player.1year.pro.introductory',
        proIntroductoryAnniversaryYear: 'com.musescore.player.1year.pr.aniversary.introductory',

        // premium
        premiumYear: 'com.musescore.player.1year.premium.39',
        premiumQuarterly: 'com.musescore.player.3month.premium.39',

        // 2025 plans
        // pro+
        offScores2025YearTrial: '',
        offScores2025YearInstantIntroductory: '',
        offScores2025Month: '',
        offScoresYearWithCredits: 'com.musescore.1year.credit.85.offscores',
        offScores179YearTrial: 'com.musescore.1year.179.offscores.trial',
        offScores179YearIntroductory: 'com.musescore.1year.179.offscores',
        offScores149YearTrial: 'com.musescore.1year.149.trial',
        offScores99YearIntro: 'com.musescore.1year.99.intro',

        // pro
        pro2025YearTrial: '',
        pro2025Month: '',
        pro2025YearInstantIntroductory: '',

        // learn
        monthLearn2025: 'com.musescore.player.2025.1month.courses.instant',
        yearLearnTrial2025: 'com.musescore.player.2025.1year.courses',
        yearLearn2025: 'com.musescore.player.2025.1year.courses.instant',
        yearLearnTrial2026: 'com.musescore.player.1year.learn.trial.2026',
        yearLearn2026: 'com.musescore.player.1year.learn.2026',
        monthLearn2026: 'com.musescore.player.1month.learn.2026',

        // learn&offScores bundle
        yearLearnBundleOffScoresTrial: 'com.musescore.1year.learn.offscores.bundle.trial',
        yearLearnBundleOffScores: 'com.musescore.1year.learn.offscores.bundle',
        monthLearnBundleOffScores: 'com.musescore.1month.learn.offscores.bundle',

        yearLearnBundleOffScores179Trial: 'com.musescore.1year.learn.offscores.bundle.179.trial',
        yearLearnBundleOffScores179Intro: 'com.musescore.1year.learn.offscores.bundle.179',
        monthLearnBundleOffScores1999: 'com.musescore.1month.learn.offscores.bundle.1999',
        monthLearnBundleOffScores2999: 'com.musescore.1month.learn.offscores.bundle.2999',
        quarterLearnBundleOffScores59: 'com.musescore.player.learn.offscore.bundle.3month.59',
    },
    android: {
        yearLearn: 'com.musescore.playerlite.1year.learn',
        yearLearnInstant: 'com.musescore.playerlite.1year.instant.learn',
        yearLearnFlashSaleInstant: 'com.musescore.playerlite.learn.flashsale',
        yearLearn80Instant: 'com.musescore.playerlite.year1.learn.80',
        yearLearn80Trial: 'musescore.playerlite.year.trial.learn.80',
        monthLearn: 'com.musescore.playerlite.1month.learn',
        yearLearn180: '',

        // learn lite
        monthLearnLiteExp: 'musescore.1month.learn.lite.2024',
        yearLearnLiteExp: 'musescore.1year.learn.lite.2024',
        yearLearnLiteTrialExp: 'musescore.1year.learn.lite.trial.2024',
        monthLearnLite: 'musescore.1month.learn.lite',
        yearLearnInstantLite: 'musescore.1year.instant.learn.lite',
        yearLearnLite: 'musescore.1year.learn.lite',

        oneYear: 'com.musescore.playerlite.year.1.one',
        oneInstant: 'com.musescore.playerlite.year.1.one.instant',
        oneMonth: 'com.musescore.playerlite.month.1.one',
        oneYear199: '',

        offScoresYearInstantLite: 'musescore.1year.offscores.instant.lite',
        offScoresMonthLite: 'musescore.1month.offscores.lite',
        offScoresYearLite: 'musescore.1year.offscores.lite',
        offScoresYear70Lite: 'musescore.1year.offscores.70.lite',
        offScoresYear75Lite: 'musescore.1year.75.offscores.lite',
        offScoreYear14dTrial: 'musescore.1year.offscores.14dtrial',

        monthLite: 'musescore.1month.pro.lite',
        year7dayTrialLite: 'musescore.1year.pro.lite',
        year65offLite: 'musescore.1year.pro.instant.lite',
        year49usdLite: 'musescore.1year.pro.49.lite',
        year75offLite: 'musescore.1year.75.lite',
        yearPro45Lite: 'musescore.1year.pro.45.lite',
        year14TrialPro: 'musescore.1year.pro.14day.trial',

        // weekly plans
        weekPro: 'musescore.1year.pro.week.3.9',
        offScores99: 'musescore.1year.offscores.trial.99',
        offScores69: 'musescore.1year.offscores.instant.69',
        pro69: 'musescore.1year.pro.trial.69',
        offScores59: 'musescore.1year.offscores.instant.59',
        offScoresWeek: 'musescore.offscores.1week.5.9',

        month10lite: 'musescore.1month.pro.trial.lite',
        offScoresMonth16lite: 'musescore.1month.offscores.trial.lite',
        offScoresTrial69Lite: 'musescore.1year.offscores.trial.69',
        offScoresYear99Lite: 'musescore.1year.offscores.trial.99',
        offScoresYear55Lite: 'musescore.1year.55.offscores.lite',
        offScoresYear85Lite: '',

        // ebooks
        book1YearTrial: 'musescore.1year.book.trial',
        book1Year: 'musescore.1year.book',
        book1Week: 'musescore.1week.book',

        // prices increase exp
        offScoresYear49Lite: 'musescore.1year.offscores.lite.49',
        offScoresYear79Lite: 'musescore.1year.offscores.lite.trial.79',
        proYear39Lite: 'musescore.1year.pro.instant.lite.39',
        proYear59Lite: 'musescore.1year.pro.instant.59',

        // flo 3 iteration exp
        offScores1month19: 'musescore.1month.offscores.19.99.lite',
        offScoresWeek15: '',

        proPlusAutoGradeInstant: 'musescore.1year.instant.autograde',
        proPlusAutoGradeWeek: '',
        proPlusAutoGradeMonth: 'musescore.1month.autograde',

        proPlusIntroductoryYear: 'musescore.player.1year.offscores.intr',
        proPlusIntroductoryAnniversaryYear: 'musescore.1year.offscores.intro.anniver',
        proIntroductoryYear: 'musescore.player.1year.pro.intro',
        proIntroductoryAnniversaryYear: 'musescore.1year.pro.intro.anniver',

        // premium
        premiumYear: 'musescore.player.1year.premium.39',
        premiumQuarterly: 'musescore.player.3month.premium.39',

        // 2025 plans
        // pro+
        offScores2025YearTrial: 'musescore.1year.offscores.trial.2025',
        offScores2025YearInstantIntroductory: 'musescore.1year.offscores.2025',
        offScores2025Month: 'musescore.1month.offscores.2025',
        offScoresYearWithCredits: 'com.musescore.1year.credit.85.offscores',
        offScores179YearTrial: '',
        offScores179YearIntroductory: '',
        offScores149YearTrial: '',
        offScores99YearIntro: '',
        // pro
        pro2025YearTrial: 'musescore.1year.pro.trial.2025',
        pro2025Month: 'musescore.1month.pro.2025',
        pro2025YearInstantIntroductory: 'musescore.1year.pro.2025',
        // learn
        monthLearn2025: '',
        yearLearnTrial2025: '',
        yearLearn2025: '',
        yearLearnTrial2026: '',
        yearLearn2026: '',
        monthLearn2026: '',
        // learn&offScores bundle
        yearLearnBundleOffScoresTrial: '',
        yearLearnBundleOffScores: '',
        monthLearnBundleOffScores: '',
        yearLearnBundleOffScores179Trial: 'muse.1y.learn.ofsscores.bundle.trial',
        yearLearnBundleOffScores179Intro: 'muse.1y.learn.ofsscores.bundle',
        monthLearnBundleOffScores1999: '',
        monthLearnBundleOffScores2999: 'muse.1m.learn.ofsscores.bundle',
        quarterLearnBundleOffScores59: '',
    },
} as const

const platformOs = currentOs as 'ios' | 'android'
const plansIds = plans[platformOs]

const getPlanId = (plan: keyof typeof plansIds) => plansIds[plan]

// pro
const monthLiteSubscriptionInstantId: TProductId = getPlanId('monthLite')
const instant75OffLiteSubscriptionId: TProductId = getPlanId('year75offLite')
const yearLiteSubscriptionId: TProductId = getPlanId('year7dayTrialLite')
const instantLiteSubscriptionId: TProductId = getPlanId('year65offLite')
const expansiveInstantLiteSubscriptionId: TProductId = getPlanId('year49usdLite')
const weekProSubscriptionId: TProductId = getPlanId('weekPro')
const proMonth10SubscriptionId: TProductId = getPlanId('month10lite')
const pro39SubscriptionId: TProductId = getPlanId('proYear39Lite')
const pro59SubscriptionId: TProductId = getPlanId('proYear59Lite')
const pro69SubscriptionId: TProductId = getPlanId('pro69')
const pro45SubscriptionId: TProductId = getPlanId('yearPro45Lite')

// offscores
const instantOffScoresLiteSubscriptionId: TProductId = getPlanId('offScoresYearInstantLite')
const monthOffScoresLiteSubscriptionId: TProductId = getPlanId('offScoresMonthLite')
const yearOffScoresLiteSubscriptionId: TProductId = getPlanId('offScoresYearLite')
const year70OffScoresLiteSubscriptionId: TProductId = getPlanId('offScoresYear70Lite')
const year75OffScoresLiteSubscriptionId: TProductId = getPlanId('offScoresYear75Lite')
const weekOffScoresSubscriptionId: TProductId = getPlanId('offScoresWeek')
const offScoresMonth16SubscriptionId: TProductId = getPlanId('offScoresMonth16lite')
const offScores49SubscriptionId: TProductId = getPlanId('offScoresYear49Lite')
const offScores79SubscriptionId: TProductId = getPlanId('offScoresYear79Lite')
const offScores1month19SubscriptionId: TProductId = getPlanId('offScores1month19')
const offScores1week15SubscriptionId: TProductId = getPlanId('offScoresWeek15')
const offScores99SubscriptionIdTrial: TProductId = getPlanId('offScores99')
const offScores69SubscriptionId: TProductId = getPlanId('offScores69')
const offScores59SubscriptionId: TProductId = getPlanId('offScores59')
const year99OffScoresLiteSubscriptionId: TProductId = getPlanId('offScoresYear99Lite')
const offScoresTrial69LiteSubscriptionId: TProductId = getPlanId('offScoresTrial69Lite')
const offScores55SubscriptionId: TProductId = getPlanId('offScoresYear55Lite')

// offscores + autograde
const proPlusAutoGradeInstantSubscriptionId: TProductId = getPlanId('proPlusAutoGradeInstant')
const proPlusAutoGradeMonthSubscriptionId: TProductId = getPlanId('proPlusAutoGradeMonth')
const proPlusAutoGradeWeekSubscriptionId: TProductId = getPlanId('proPlusAutoGradeWeek')
// museScore learn
const yearTrialLearnLiteSubscriptionId: TProductId = getPlanId('yearLearnLite')
const instantLearnLiteSubscriptionId: TProductId = getPlanId('yearLearnInstantLite')
const monthLearnLiteSubscriptionId: TProductId = getPlanId('monthLearnLite')
const monthLearnSubscriptionId: TProductId = getPlanId('monthLearn')
const yearLearnSubscriptionId: TProductId = getPlanId('yearLearn')
const instantLearnSubscriptionId: TProductId = getPlanId('yearLearnInstant')
const instantLearn80SaleId: TProductId = getPlanId('yearLearn80Instant')
const trialLearn80SaleId: TProductId = getPlanId('yearLearn80Trial')
const yearLearn180: TProductId = getPlanId('yearLearn180')

// museScore one (all services)
const yearOneSubscriptionId: TProductId = getPlanId('oneYear')
const instantOneSubscriptionId: TProductId = getPlanId('oneInstant')
const monthOneSubscriptionId: TProductId = getPlanId('oneMonth')
const yearOneTrial199SubscriptionId: TProductId = getPlanId('oneYear199')

// museScore learn lite
const yearLearnLiteTrialExpSubscriptionId: TProductId = getPlanId('yearLearnLiteTrialExp')
const yearLearnLiteExpSubscriptionId: TProductId = getPlanId('yearLearnLiteExp')
const monthLearnLiteExpSubscriptionId: TProductId = getPlanId('monthLearnLiteExp')
const flashSaleSubscriptionId: TProductId = getPlanId('yearLearnFlashSaleInstant')
// museScore ebook
const ebookWeekSubscriptionId: TProductId = getPlanId('book1Week')
const ebookYearTrialSubscriptionId: TProductId = getPlanId('book1YearTrial')
const ebookYearInstantSubscriptionId: TProductId = getPlanId('book1Year')
// museScore pro/pro introductory
const proYearIntroductory: TProductId = getPlanId('proIntroductoryYear')
const proIntroductoryAnniversaryYear: TProductId = getPlanId('proIntroductoryAnniversaryYear')
const offScoresYearIntroductory: TProductId = getPlanId('proPlusIntroductoryYear')
const offScoresYearIntroductoryAnniversary: TProductId = getPlanId(
    'proPlusIntroductoryAnniversaryYear',
)
const premiumYearSubscriptionId: TProductId = getPlanId('premiumYear')
const premiumQuarterlySubscriptionId: TProductId = getPlanId('premiumQuarterly')

// museScore pro/pro+ 2025
const offScores149YearTrialProductId: TProductId = getPlanId('offScores149YearTrial')
const offScores99YearIntroProductId: TProductId = getPlanId('offScores99YearIntro')
const offScoresYearWithCreditsProductId: TProductId = getPlanId('offScoresYearWithCredits')
const offScores2025YearTrialProductId: TProductId = getPlanId('offScores2025YearTrial')
const offScores2025YearInstantIntroductoryProductId: TProductId = getPlanId(
    'offScores2025YearInstantIntroductory',
)
const offScores2025MonthProductId: TProductId = getPlanId('offScores2025Month')
const pro2025YearTrialProductId: TProductId = getPlanId('pro2025YearTrial')
const pro2025MonthProductId: TProductId = getPlanId('pro2025Month')
const pro2025YearInstantIntroductoryProductId: TProductId = getPlanId(
    'pro2025YearInstantIntroductory',
)
// museScore learn & pro+ a bundle
const yearLearnBundleOffScoresTrialProductId: TProductId = getPlanId(
    'yearLearnBundleOffScoresTrial',
)
const yearLearnBundleOffScoresProductId: TProductId = getPlanId('yearLearnBundleOffScores')
const monthLearnBundleOffScoresProductId: TProductId = getPlanId('monthLearnBundleOffScores')
const yearLearnBundleOffScores179TrialProductId: TProductId = getPlanId(
    'yearLearnBundleOffScores179Trial',
)
const yearLearnBundleOffScores179IntroProductId: TProductId = getPlanId(
    'yearLearnBundleOffScores179Intro',
)
const monthLearnBundleOffScores1999ProductId: TProductId = getPlanId(
    'monthLearnBundleOffScores1999',
)
const monthLearnBundleOffScores2999ProductId: TProductId = getPlanId(
    'monthLearnBundleOffScores2999',
)
const quarterLearnBundleOffScores59ProductId: TProductId = getPlanId(
    'quarterLearnBundleOffScores59',
)

// museScore learn 2025
const monthLearn2025ProductId: TProductId = getPlanId('monthLearn2025')
const yearLearnTrial2025ProductId: TProductId = getPlanId('yearLearnTrial2025')
const yearLearn2025ProductId: TProductId = getPlanId('yearLearn2025')
const yearLearnTrial2026ProductId: TProductId = getPlanId('yearLearnTrial2026')
const yearLearn2026ProductId: TProductId = getPlanId('yearLearn2026')
const monthLearn2026ProductId: TProductId = getPlanId('monthLearn2026')
export const isDiscountNow = (): boolean => true

export const isShowOffScoresGlobal = true
export const proPlanName = 'pro'
export const offScoresPlanName = 'offScores'
export const museScoreOneTitle = 'MuseScore ONE' as const
export const MUSE_SCORE_PRO_TITLE = 'MuseScore PRO' as const
export const MUSE_SCORE_PRO_PLUS_TITLE = 'MuseScore PRO+' as const
export const MUSE_SCORE_LEARNING_TITLE = 'MuseScore LEARN' as const
const webUpgrade = 'web-upgrade' as const
const iosUpgrade = 'ios-upgrade' as const
const androidUpgrade = 'android-upgrade' as const

const scoreCount = '1.7'
const coursesCount = 250

export const maxDaysToShowAnniversary = 9900 // кратное 30
export const EVERY_HOW_MANY_DAYS_SHOW = 30
const gameSteps = {
    loseGame: 0,
    startGame: 1,
    gameProcess: 2,
    winGame: 3,
    giftGame: 4,
    giftButton: 5,
    giftPlans: 6,
}

const plansForUpgradeLite = [
    yearTrialLearnLiteSubscriptionId,
    instantLearnLiteSubscriptionId,
    monthLearnLiteSubscriptionId,
]
const plansForAutoGradeUpgrade = [
    instantOffScoresLiteSubscriptionId,
    monthOffScoresLiteSubscriptionId,
    yearOffScoresLiteSubscriptionId,
    year70OffScoresLiteSubscriptionId,
    year75OffScoresLiteSubscriptionId,
    weekOffScoresSubscriptionId,
    offScoresMonth16SubscriptionId,
    offScores49SubscriptionId,
    offScores79SubscriptionId,
    offScores1month19SubscriptionId,
    offScores1week15SubscriptionId,
    offScores99SubscriptionIdTrial,
    offScores69SubscriptionId,
    offScores59SubscriptionId,
    year99OffScoresLiteSubscriptionId,
    offScoresTrial69LiteSubscriptionId,
    proYearIntroductory,
    offScoresYearIntroductory,
    proIntroductoryAnniversaryYear,
    offScoresYearIntroductoryAnniversary,
    pro45SubscriptionId,
]
const plansForUpgrade = [
    proYearIntroductory,
    proIntroductoryAnniversaryYear,
    monthLiteSubscriptionInstantId,
    instantLiteSubscriptionId,
    yearLiteSubscriptionId,
    pro69SubscriptionId,
    proMonth10SubscriptionId,
    weekProSubscriptionId,
    instant75OffLiteSubscriptionId,
    expansiveInstantLiteSubscriptionId,
    proYearIntroductory,
    proIntroductoryAnniversaryYear,
    pro45SubscriptionId,

    ...(platform.isAndroid
        ? [
              pro39SubscriptionId,
              pro59SubscriptionId,
              pro2025YearTrialProductId,
              pro2025MonthProductId,
              pro2025YearInstantIntroductoryProductId,
          ]
        : []),
    // старые product id которые нигде больше не нужны кроме upgrade и которые нельзя удалить из apple админки
    'com.musescore.player.1year.75',
    'com.musescore.player.1month.instant',
    'com.musescore.player.1year.7day',
    'com.musescore.player.1year.49.99',
    'com.musescore.player.1year.75sale',
    'com.musescore.player.1year.70',
    'com.musescore.player.1year.7day.70off.2021',
    'com.musescore.player.1year.50',
    'com.musescore.player.1month.7day',
    'com.musescore.player.1month',
    'com.musescore.player.1year',
    'com.musescore.player.1year.70off.2020',
    'com.musescore.playerlite.1year.70.2022',
    'com.musescore.playerlite.1year.2022',
    'com.musescore.player.1year.65off.2020',
    'com.musescore.playerlite.1year.75.2022',
    'com.musescore.player.1year.75off.2020',
    'com.musescore.playerlite.1year.49.2020',
    'com.musescore.player.1year.49.99.2020',
    'com.musescore.playerlite.year.trial.2022',
    'com.musescore.player.1year.7day.2020',
    'com.musescore.playerlite.1month.2022',
    'com.musescore.player.1month.2020',
]

const accessRights = {
    android: 'android_mu_pro',
    androidPlus: 'android_mu_off_scores',
    androidLearning: 'android_mu_edu_courses',
    androidLearningLite: 'android_mu_edu_lite',
    androidPremium: 'android_mu_premium',
    androidEbook: 'android_mu_ebook',
    androidAutoGrade: 'android_mu_auto_grade',
    ios: 'ios_mu_pro',
    iosPlus: 'ios_mu_off_scores',
    iosLearning: 'ios_mu_edu_courses',
    iosLearningLite: 'ios_mu_edu_lite',
    iosEbook: 'ios_mu_ebook',
    iosPremium: 'ios_mu_premium',
    iosAutoGrade: 'ios_mu_auto_grade',
    web: 'web_mu_pro',
} as const
export const typeOfStart = {
    INSTALL: 'install',
    UPDATE: 'update',
    GENERAL: 'general',
    PUSH_NOTIFICATION: 'push_notification',
} as const
// ТурАпдейт, в отличии от других туров может быть показан больше одного раза.
// Тк приложение может быть обновлено несколько раз,
// и может потребоваться показ турАпдейта тоже несколько раз. Но турАпдейт показывается не всегда,
// а только тогда, когда нам есть что рассказать поьзователю.
// И если мы хотим показать тур, то для этого нам нужно создать переменную,
// некий идентификатор тура, по которой можно судить, что тур необходимо показать.
// Был принят вариант в качестве идентификатора  - текущая дата, записанная в формате годМесяцЧисло,
// чтобы можно было сравнивать айдишники тура корректно.
// Таким образом, тур мы показываем в ручном режиме, а не в автоматическом. Вот для этого,
// я и захардкодил отдельную переменную.
// напиши дату свежее в формате yyyymmdd, чтобы показать тур апдейт или 0, чтобы скрыть

const tourId = 20250814
const coachMarkId = 20240502

const currentSubscriptionType: Record<string, string> = {
    pro: 'pro',
    offScores: 'pro_plus',
    learning: 'learn',
    proLite: 'pro&learn_lite',
    offScoresLite: 'pro_plus&learn_lite',
    learningLite: 'learn_lite',
    ebook: 'ebook',
}

const inAppScore59: TProductId = platform.isIos
    ? 'com.musescore.player.scorefeatures.5.9'
    : 'com.musescore.playerlite.lifetime.score.5.9'
const inAppScore39: TProductId = platform.isIos
    ? 'com.musescore.player.scorefeatures.3.9'
    : 'com.musescore.playerlite.lifetime.score.3.9'
const inAppScore79: TProductId = platform.isIos
    ? 'com.musescore.player.scorefeatures.7.9'
    : 'com.musescore.playerlite.lifetime.score.7.9'
const inAppScore99: TProductId = platform.isIos
    ? 'com.musescore.player.scorefeatures.9.9'
    : 'com.musescore.playerlite.lifetime.score.9.9'
const inAppScore119: TProductId = platform.isIos
    ? 'com.musescore.player.scorefeatures.11.9'
    : 'com.musescore.playerlite.lifetime.score.11.9'
const inAppScore139: TProductId = platform.isIos
    ? 'com.musescore.player.scorefeatures.13.9'
    : 'com.musescore.playerlite.lifetime.score.13.99'

const inAppScore36: TProductId = platform.isIos
    ? ''
    : 'com.musescore.playerlite.lifetime.score.3.59'
const inAppScore48: TProductId = platform.isIos
    ? 'com.musescore.player.scorefeatures.4.79'
    : 'com.musescore.playerlite.lifetime.score.4.8'
const inAppScore719: TProductId = platform.isIos
    ? 'com.musescore.player.scorefeatures.7.19'
    : 'com.musescore.playerlite.lifetime.score.7.19'
const inAppScore839: TProductId = platform.isIos ? 'com.musescore.player.scorefeatures.8.39' : ''
const inAppCourse: TProductId = platform.isIos
    ? 'com.musescore.player.course.15.9'
    : 'com.musescore.playerlite.course.15.9'

const credit2pack: TProductId = platform.isAndroid
    ? 'com.musescore.playerlite.lifetime.scorefeatures.2.credit'
    : 'com.musescore.player.scorefeatures.2.credit'
const credit3pack: TProductId = platform.isAndroid
    ? 'com.musescore.playerlite.lifetime.scorefeatures.3.credit'
    : 'com.musescore.player.scorefeatures.3.credit'
const credit5pack: TProductId = platform.isAndroid
    ? 'com.musescore.playerlite.lifetime.scorefeatures.5.credit'
    : 'com.musescore.player.scorefeatures.5.credit'
const credit10pack: TProductId = platform.isAndroid
    ? 'com.musescore.playerlite.lifetime.scorefeatures.10.credit'
    : 'com.musescore.player.scorefeatures.10.credit'
const credit25pack: TProductId = platform.isAndroid
    ? 'com.musescore.playerlite.lifetime.scorefeatures.25.credit'
    : 'com.musescore.player.scorefeatures.25.credit'

const inAppBook20Cost: TProductId = platform.isAndroid
    ? 'com.musescore.playerlite.book.19.99'
    : 'com.musescore.player.dbook.19.99'
const inAppBook35Cost: TProductId = platform.isAndroid
    ? 'com.musescore.playerlite.book.34.99'
    : 'com.musescore.player.dbook.34.99'
const inAppBook55Cost: TProductId = platform.isAndroid
    ? 'com.musescore.playerlite.book.54.99'
    : 'com.musescore.player.dbook.54.99'

const listInApps = [
    // in-apps scores, courses features
    inAppScore39,
    inAppScore48,
    inAppScore59,
    inAppScore719,
    inAppScore79,
    inAppScore99,
    inAppScore119,
    inAppScore139,
    ...(platform.isIos ? [inAppScore839] : [inAppScore36]),
    inAppCourse,
    // in-apps credits
    credit2pack,
    credit3pack,
    credit5pack,
    credit10pack,
    credit25pack,
    // in-apps book
    inAppBook20Cost,
    inAppBook35Cost,
    inAppBook55Cost,
]

const listPieceSaleInApps = [
    // in-apps scores, courses, ebooks
    inAppScore39,
    inAppScore48,
    inAppScore59,
    inAppScore719,
    inAppScore79,
    inAppScore99,
    inAppScore119,
    inAppScore139,
    ...(platform.isIos ? [inAppScore839] : [inAppScore36]),

    inAppCourse,
    inAppBook20Cost,
    inAppBook35Cost,
    inAppBook55Cost,
]
const creditsPack = [credit2pack, credit3pack, credit5pack, credit10pack]
const currentTime = new Date().getTime()

const listOfSubscriptions = [
    // subscriptions
    instantOneSubscriptionId,
    yearOneSubscriptionId,
    monthOneSubscriptionId,

    monthLearnSubscriptionId,
    instantLearnSubscriptionId,
    yearLearnSubscriptionId,
    flashSaleSubscriptionId,
    trialLearn80SaleId,
    instantLearn80SaleId,
    yearTrialLearnLiteSubscriptionId,
    instantLearnLiteSubscriptionId,
    monthLearnLiteSubscriptionId,

    monthLiteSubscriptionInstantId,
    instant75OffLiteSubscriptionId,
    yearLiteSubscriptionId,
    instantLiteSubscriptionId,
    expansiveInstantLiteSubscriptionId,

    instantOffScoresLiteSubscriptionId,
    monthOffScoresLiteSubscriptionId,
    yearOffScoresLiteSubscriptionId,
    year70OffScoresLiteSubscriptionId,
    year75OffScoresLiteSubscriptionId,

    weekProSubscriptionId,
    weekOffScoresSubscriptionId,
    offScores99SubscriptionIdTrial,
    offScores69SubscriptionId,
    offScores59SubscriptionId,
    pro69SubscriptionId,

    yearLearnLiteTrialExpSubscriptionId,
    yearLearnLiteExpSubscriptionId,
    monthLearnLiteExpSubscriptionId,

    offScoresMonth16SubscriptionId,
    proMonth10SubscriptionId,
    offScores1month19SubscriptionId,

    pro45SubscriptionId,
    offScores55SubscriptionId,

    ...(platform.isIos
        ? [
              year99OffScoresLiteSubscriptionId,
              offScores1week15SubscriptionId,
              proPlusAutoGradeWeekSubscriptionId,
              yearOneTrial199SubscriptionId,
              yearLearn180,
              monthLearn2025ProductId,
              yearLearnTrial2025ProductId,
              yearLearn2025ProductId,
              yearLearnTrial2026ProductId,
              yearLearn2026ProductId,
              monthLearn2026ProductId,
              offScoresYearWithCreditsProductId,
              offScores149YearTrialProductId,
              offScores99YearIntroProductId,
              yearLearnBundleOffScoresTrialProductId,
              yearLearnBundleOffScoresProductId,
              monthLearnBundleOffScoresProductId,
              yearLearnBundleOffScores179TrialProductId,
              yearLearnBundleOffScores179IntroProductId,
              monthLearnBundleOffScores1999ProductId,
              monthLearnBundleOffScores2999ProductId,
              quarterLearnBundleOffScores59ProductId,
          ]
        : [
              offScores2025YearTrialProductId,
              offScores2025YearInstantIntroductoryProductId,
              offScores2025MonthProductId,
              pro2025YearTrialProductId,
              pro2025MonthProductId,
              pro2025YearInstantIntroductoryProductId,
              offScoresTrial69LiteSubscriptionId,
              offScores49SubscriptionId,
              offScores79SubscriptionId,
              pro39SubscriptionId,
              pro59SubscriptionId,
              proPlusAutoGradeMonthSubscriptionId,
              yearLearnBundleOffScores179TrialProductId,
              yearLearnBundleOffScores179IntroProductId,
              monthLearnBundleOffScores2999ProductId,
          ]),

    ebookWeekSubscriptionId,
    ebookYearInstantSubscriptionId,
    ebookYearTrialSubscriptionId,
    proPlusAutoGradeInstantSubscriptionId,

    proYearIntroductory,
    proIntroductoryAnniversaryYear,
    offScoresYearIntroductoryAnniversary,
    offScoresYearIntroductory,

    premiumYearSubscriptionId,
    premiumQuarterlySubscriptionId,
]
const isShortStock = false
const dateForBadgeTimer = new Date(2023, 1, 1, 0o0, 5, 0o0, 0o0)
const currentDateTimer = new Date(dateForBadgeTimer).getTime()
const fiveMin = 1000 * 60 * 5

const oldAppInstallProductId = 'com.musescore.player.old_app_install'
const privacyLink = 'https://musescore.com/legal/privacy'
const requiredPrivacyLink = 'https://musescore.com/consent/required'
const optionalPrivacyLink = 'https://musescore.com/consent/optional'
const termsLink = 'https://musescore.com/legal/terms'
const appleFamilySharingSite = 'https://www.apple.com/family-sharing'

export const subscriptionsGroup = {
    pro: 'PRO',
    proTrialExp: 'PRO',
    offScores: 'PRO+',
    offScoresTrialExp: 'PRO+',
    learning: 'Learn',
    learningLite: 'Learn Lite',
    offScoresDoubt: 'PRO+',
    proDoubt: 'PRO',
    learningDoubt: 'Learn',
    ebook: 'BOOKS',
    premium: 'Premium',
    one: 'ONE',
    learningBundle: 'Learn & PRO+',
} as const

const proIntroductorySubscriptions = [
    proYearIntroductory,
    offScoresYearIntroductory,
    proIntroductoryAnniversaryYear,
    offScoresYearIntroductoryAnniversary,
    pro2025YearInstantIntroductoryProductId,
    offScores2025YearInstantIntroductoryProductId,
    offScores2025YearTrialProductId,
    pro69SubscriptionId,
    offScores99SubscriptionIdTrial,
    offScoresYearWithCreditsProductId,
    offScores99YearIntroProductId,
    yearLearnBundleOffScoresProductId,
    yearLearnBundleOffScores179IntroProductId,
]

const proTrialSubscriptions = [
    offScores149YearTrialProductId,
    pro69SubscriptionId,
    offScores99SubscriptionIdTrial,
    yearLearnBundleOffScoresTrialProductId,
    yearLearnBundleOffScores179TrialProductId,
]

const learnIntroductorySubscriptions = [
    yearLearnTrial2025ProductId,
    yearLearn2025ProductId,
    yearLearnTrial2026ProductId,
    yearLearn2026ProductId,
    yearLearnSubscriptionId,
    instantLearnSubscriptionId,
]
const plansSaleLabel = [offScores55SubscriptionId, pro45SubscriptionId]

const ebookIntroductorySubscriptions = [ebookYearTrialSubscriptionId]
const oneIntroductorySubscriptions = [yearOneSubscriptionId, yearOneTrial199SubscriptionId]

// anniversary intro-year plans: $30 vs $260 a year on iOS
const anniversaryDiscount = platform.isIos ? '88%' : '77%'

const getSaleDiscountForPaymentLayer = (currentSubscriptionsGroup: TStockLandingPlanType) => {
    const isDoubt =
        currentSubscriptionsGroup === 'proDoubt' || currentSubscriptionsGroup === 'offScoresDoubt'

    if (currentSubscriptionsGroup === 'ebook') return '90%'
    if (currentSubscriptionsGroup === 'learning' || currentSubscriptionsGroup === 'learningLite')
        return '50%'
    if (platform.isIos) return isDoubt ? '72%' : '77%'
    return isDoubt ? '55%' : '66.6%'
}

const getSaleValueForPaymentLayer = (currentSubscriptionsGroup: TStockLandingPlanType) => {
    const saleValue = translate('native.marketing.discount_off', {
        discount: getSaleDiscountForPaymentLayer(currentSubscriptionsGroup),
    })
    const isSeparatedWithSpace = !['ebook', 'learning', 'learningLite'].includes(
        currentSubscriptionsGroup,
    )

    return isSeparatedWithSpace ? ` ${saleValue}` : saleValue
}

const proGroupId = '20473832'
const learnGroupId = '20881260'
const ebookGroupId = '21474375'
const oneGroupId = '20883530'

const listIdsForUpgradeToBundleLearnProPlus = new Set(
    [
        ...plansForUpgrade,
        ...plansForAutoGradeUpgrade,
        offScores149YearTrialProductId,
        offScores99YearIntroProductId,
        offScoresYearWithCreditsProductId,
        offScores2025YearTrialProductId,
        offScores2025YearInstantIntroductoryProductId,
        offScores2025MonthProductId,
        offScores55SubscriptionId,
        proPlusAutoGradeWeekSubscriptionId,
        proPlusAutoGradeMonthSubscriptionId,
        proPlusAutoGradeInstantSubscriptionId,
    ].filter(Boolean),
)

const listIdsMonthlyForUpgradeToBundle = new Set(
    [
        monthLiteSubscriptionInstantId,
        proMonth10SubscriptionId,
        weekProSubscriptionId,
        pro2025MonthProductId,
        monthOffScoresLiteSubscriptionId,
        weekOffScoresSubscriptionId,
        offScoresMonth16SubscriptionId,
        offScores1month19SubscriptionId,
        offScores1week15SubscriptionId,
        offScores2025MonthProductId,
        proPlusAutoGradeWeekSubscriptionId,
        proPlusAutoGradeMonthSubscriptionId,
        'com.musescore.player.1month.instant',
        'com.musescore.player.1month.7day',
        'com.musescore.player.1month',
        'com.musescore.playerlite.1month.2022',
        'com.musescore.player.1month.2020',
    ].filter(Boolean),
)

export const marketingConstants = {
    anniversaryDiscount,
    sources,
    maxDaysToShowAnniversary,
    everyHowManyDaysShowAnniversary: EVERY_HOW_MANY_DAYS_SHOW,
    coursesCount,
    museScoreOneTitle,
    museScoreProTitle: MUSE_SCORE_PRO_TITLE,
    museScoreProPlusTitle: MUSE_SCORE_PRO_PLUS_TITLE,
    museScoreLearningTitle: MUSE_SCORE_LEARNING_TITLE,
    isShowOffScoresGlobal,
    proPlanName,
    offScoresPlanName,
    isDiscountNow,
    monthLearnSubscriptionId,
    yearLearnSubscriptionId,
    instantLearnSubscriptionId,
    instantOneSubscriptionId,
    yearOneSubscriptionId,
    flashSaleSubscriptionId,
    instantLearn80SaleId,
    trialLearn80SaleId,
    yearTrialLearnLiteSubscriptionId,
    instantLearnLiteSubscriptionId,
    monthLearnLiteSubscriptionId,
    monthLiteSubscriptionInstantId,
    instant75OffLiteSubscriptionId,
    yearLiteSubscriptionId,
    instantLiteSubscriptionId,
    expansiveInstantLiteSubscriptionId,
    instantOffScoresLiteSubscriptionId,
    monthOffScoresLiteSubscriptionId,
    yearOffScoresLiteSubscriptionId,
    year70OffScoresLiteSubscriptionId,
    year75OffScoresLiteSubscriptionId,
    weekProSubscriptionId,
    weekOffScoresSubscriptionId,
    offScores99SubscriptionIdTrial,
    offScores69SubscriptionId,
    offScores59SubscriptionId,
    pro69SubscriptionId,
    inAppScore59,
    listInApps,
    listOfSubscriptions,
    webUpgrade,
    iosUpgrade,
    androidUpgrade,
    plansForUpgrade,
    accessRights,
    tourId,
    typeOfStart,
    currentSubscriptionType,
    currentTime,
    scoreCount,
    gameSteps,
    isShortStock,
    dateForBadgeTimer,
    currentDateTimer,
    fiveMin,
    credit2pack,
    credit3pack,
    credit5pack,
    credit10pack,
    credit25pack,
    creditsPack,
    inAppCourse,
    listPieceSaleInApps,
    plansForUpgradeLite,
    oldAppInstallProductId,
    privacyLink,
    termsLink,
    appleFamilySharingSite,
    yearLearnLiteTrialExpSubscriptionId,
    yearLearnLiteExpSubscriptionId,
    monthLearnLiteExpSubscriptionId,
    offScoresMonth16SubscriptionId,
    proMonth10SubscriptionId,
    year99OffScoresLiteSubscriptionId,
    offScoresTrial69LiteSubscriptionId,
    requiredPrivacyLink,
    optionalPrivacyLink,
    inAppBook20Cost,
    inAppBook35Cost,
    inAppBook55Cost,
    ebookWeekSubscriptionId,
    ebookYearInstantSubscriptionId,
    ebookYearTrialSubscriptionId,
    offScores49SubscriptionId,
    offScores79SubscriptionId,
    pro39SubscriptionId,
    pro59SubscriptionId,
    coachMarkId,
    inAppScore39,
    inAppScore79,
    inAppScore99,
    inAppScore119,
    inAppScore139,
    offScores1week15SubscriptionId,
    offScores1month19SubscriptionId,
    proPlusAutoGradeInstantSubscriptionId,
    proPlusAutoGradeWeekSubscriptionId,
    proPlusAutoGradeMonthSubscriptionId,
    plansForAutoGradeUpgrade,
    monthOneSubscriptionId,
    proYearIntroductory,
    proIntroductoryAnniversaryYear,
    offScoresYearIntroductoryAnniversary,
    offScoresYearIntroductory,
    yearOneTrial199SubscriptionId,
    yearLearn180,
    offScores55SubscriptionId,
    pro45SubscriptionId,
    inAppScore36,
    inAppScore48,
    inAppScore719,
    inAppScore839,
    defaultScoresNumber: 3381071,
    premiumYearSubscriptionId,
    premiumQuarterlySubscriptionId,
    proIntroductorySubscriptions,
    offScores2025YearTrialProductId,
    offScores2025YearInstantIntroductoryProductId,
    offScores2025MonthProductId,
    pro2025YearTrialProductId,
    pro2025MonthProductId,
    pro2025YearInstantIntroductoryProductId,
    monthLearn2025ProductId,
    yearLearnTrial2025ProductId,
    yearLearn2025ProductId,
    yearLearnTrial2026ProductId,
    yearLearn2026ProductId,
    monthLearn2026ProductId,
    learnIntroductorySubscriptions,
    ebookIntroductorySubscriptions,
    getSaleDiscountForPaymentLayer,
    getSaleValueForPaymentLayer,
    plansSaleLabel,
    proTrialSubscriptions,
    offScoresYearWithCreditsProductId,
    offScores149YearTrialProductId,
    offScores99YearIntroProductId,
    yearLearnBundleOffScoresTrialProductId,
    yearLearnBundleOffScoresProductId,
    monthLearnBundleOffScoresProductId,
    yearLearnBundleOffScores179TrialProductId,
    yearLearnBundleOffScores179IntroProductId,
    monthLearnBundleOffScores1999ProductId,
    monthLearnBundleOffScores2999ProductId,
    quarterLearnBundleOffScores59ProductId,
    proGroupId,
    learnGroupId,
    ebookGroupId,
    oneGroupId,
    oneIntroductorySubscriptions,
    listIdsForUpgradeToBundleLearnProPlus,
    listIdsMonthlyForUpgradeToBundle,
}
