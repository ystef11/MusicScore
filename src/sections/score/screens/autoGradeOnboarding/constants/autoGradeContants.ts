import { icons } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

import { AutoGradeContentStepComponent } from '../containers/components/AutoGradeContentStepComponent'
import { AutoGradeFeaturesComponent } from '../containers/components/AutoGradeFeaturesComponent'
import { OnboardingSteps } from '../types/autoGradeOnboardingScreenAppTypes'

export const stepsConfig = {
    [OnboardingSteps.FirstStep]: {
        component: AutoGradeContentStepComponent,
        title: translate('native.practice_mode.onboarding.first_step.title'),
        subtitle: translate('native.practice_mode.onboarding.first_step.subtitle'),
        buttonTitle: translate('native.marketing.continue'),
        stepLabel: 1,
        image: icons.autoGradeAcquisition1,
    },
    [OnboardingSteps.SecondStep]: {
        component: AutoGradeContentStepComponent,
        title: translate('native.practice_mode.onboarding.second_step.title'),
        subtitle: translate('native.practice_mode.onboarding.second_step.subtitle'),
        buttonTitle: translate('native.marketing.continue'),
        stepLabel: 2,
        image: icons.autoGradeAcquisition2,
    },
    [OnboardingSteps.ThirdStep]: {
        component: AutoGradeContentStepComponent,
        title: translate('native.practice_mode.onboarding.third_step.title'),
        subtitle: translate('native.practice_mode.onboarding.third_step.subtitle'),
        buttonTitle: translate('native.marketing.continue'),
        stepLabel: 3,
        image: icons.autoGradeAcquisition3,
    },
    [OnboardingSteps.FourthStep]: {
        component: AutoGradeContentStepComponent,
        title: translate('native.practice_mode.onboarding.fourth_step.title'),
        subtitle: translate('native.practice_mode.onboarding.fourth_step.subtitle'),
        buttonTitle: translate('native.marketing.continue'),
        stepLabel: 4,
        image: icons.autoGradeAcquisition4,
    },
    [OnboardingSteps.FifthStep]: {
        component: AutoGradeFeaturesComponent,
        title: translate('native.practice_mode.onboarding.first_step.title'),
        subtitle: translate('native.practice_mode.onboarding.first_step.subtitle'),
        stepLabel: 3,
        image: icons.autogradeOnboarding4,
        buttonTitle: undefined,
    },
    [OnboardingSteps.SixthStep]: {
        component: AutoGradeContentStepComponent,
        title: translate('native.practice_mode.onboarding.sixth_step.title'),
        subtitle: translate('native.practice_mode.onboarding.sixth_step.subtitle'),
        buttonTitle: translate('native.practice_mode.onboarding.sixth_step.button'),
        image: icons.autogradeOnboarding1,
        stepLabel: undefined,
    },
    [OnboardingSteps.SeventhStep]: {
        component: AutoGradeContentStepComponent,
        title: translate('native.practice_mode.onboarding.seventh_step.title'),
        subtitle: translate('native.practice_mode.onboarding.seventh_step.subtitle'),
        stepLabel: 1,
        image: icons.autogradeOnboarding2,
        buttonTitle: undefined,
    },
    [OnboardingSteps.EighthStep]: {
        component: AutoGradeContentStepComponent,
        title: translate('native.practice_mode.onboarding.eighth_step.title'),
        subtitle: translate('native.practice_mode.onboarding.eighth_step.subtitle'),
        stepLabel: 2,
        image: icons.autogradeOnboarding3,
        buttonTitle: undefined,
    },
    [OnboardingSteps.NinthStep]: {
        component: AutoGradeContentStepComponent,
        title: translate('native.practice_mode.onboarding.ninth_step.title'),
        subtitle: translate('native.practice_mode.onboarding.ninth_step.subtitle'),
        stepLabel: 3,
        image: icons.autogradeOnboarding4,
        buttonTitle: undefined,
    },
} as const

export const rtConfigSteps = [
    'discover_power',
    'improve',
    'skills',
    'challenge',
    'plans',
    'microphone',
    'tune',
    'headphones',
    'parts',
]
