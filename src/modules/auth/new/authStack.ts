import type { TNavigatorParams } from '../../navigation/types/navgationTypes'

export const AuthStackScreens = {
    AuthPasswordScreen: 'AuthPasswordScreen',
    KoreanPrivacyComplianceScreen: 'KoreanPrivacyComplianceScreen',
} as const

export const authStack: TNavigatorParams[] = [
    {
        name: 'AuthEmailLoginScreen',
        component: require('./AuthEmailLoginScreen').AuthEmailLoginScreen,
    },
    {
        name: 'AuthPasswordScreen',
        component: require('./password/AuthPasswordScreen').AuthPasswordScreen,
    },
    {
        name: 'KoreanPrivacyComplianceScreen',
        component: require('./terms/KoreanPrivacyComplianceScreen').KoreanPrivacyComplianceScreen,
    },
]
