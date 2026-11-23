import { createExtendedStoreChunk } from '@ug/store'

import { OnboardingSteps } from '../types/autoGradeOnboardingScreenAppTypes'

type TAutoGradeOnboardingScreenState = {
    step: OnboardingSteps
    completed: boolean
}

export const autoGradeOnboardingScreenStoreChunk =
    createExtendedStoreChunk<TAutoGradeOnboardingScreenState>({
        treeKey: 'screens',
        storeKey: 'autoGradeOnboarding',
    })({
        persist: ['completed', 'step'],
        initialState: {
            step: OnboardingSteps.FirstStep,
            completed: false,
        },
        actions: {
            setNextStep: (_, state) => ({
                step: state.step + 1,
            }),
        },
    })
