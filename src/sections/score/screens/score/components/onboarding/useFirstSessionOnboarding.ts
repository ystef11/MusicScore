export const FIRST_SESSION_ONBOARDING_STEPS = 2
export const TOOLBAR_SURFACE_RADIUS = 20

export const useFirstSessionOnboarding = () => ({
    step: null as number | null,
    isActive: false,
    isDismissibleFromAnyStep: true,
    playbackLockMs: 0,
    isSaveHintVariation: false,
    goToNextStep: () => undefined,
    finish: () => undefined,
})
