export const ScorePrivacy = {
    PUBLIC: 0,
    LINK: 1,
    PRIVATE: 2,
} as const

export type ScorePrivacyValue = (typeof ScorePrivacy)[keyof typeof ScorePrivacy]
