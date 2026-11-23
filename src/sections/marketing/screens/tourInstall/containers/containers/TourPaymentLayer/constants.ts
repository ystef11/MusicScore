import { marketingConstants } from '@mu-native/marketing'

export const plansWithSwitcher = [
    marketingConstants.yearLearnSubscriptionId,
    marketingConstants.yearOffScoresLiteSubscriptionId,
    marketingConstants.yearLiteSubscriptionId,
]

export const subscriptionTourGroup = {
    offScoresGroup: 'offScores',
    offScoreDoubt: 'offScoresDoubt',
    proGroup: 'pro',
    proDoubt: 'proDoubt',
    learnGroup: 'learning',
} as const
