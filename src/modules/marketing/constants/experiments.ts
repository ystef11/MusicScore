import { platform } from '@mu-native/common'

export const firstSessionFlowExperimentId = platform.isIos ? 8450 : 8453

export const enum ExperimentsMonetization {
    discountLabel = 'discountLabel',
    showBenefitsInTour = 'showBenefitsInTour',
    adoptUgPlan4iterationBundle = 'adoptUgPlan4iterationBundle',
    billedAnnually = 'billedAnnually',
    quizProgressBar = 'quizProgressBar',
    openLearnTabAfterTour = 'openLearnTabAfterTour',
    firstSessionFlow = 'firstSessionFlow',
    purchaseSuccessScreen = 'purchaseSuccessScreen',
    closeIconContrastBg = 'closeIconContrastBg',
    longLandingTour = 'longLandingTour',
    removeProSwitcherTour = 'removeProSwitcherTour',
    scoreDiscountSplash = 'scoreDiscountSplash',
    quizAgreeQuestions = 'quizAgreeQuestions',
    floatingUpgradeBundle = 'floatingUpgradeBundle',
}
