/* eslint-disable camelcase */
import type { TAuthDataDto, TCaptchaDto } from '@mu-native/api'

export type TAuthData = TAuthDataDto

export type TAuthMethod = 'no_auth' | 'apple' | 'google' | 'facebook' | 'email' | 'mob_web'

export type TRecaptchaResponse = TCaptchaDto

export type TConsentScreenType = 'korean' | null

export type TAuthMethods = {
    isGoogleAvailable: boolean
    isAppleAvailable: boolean
    isFacebookAvailable: boolean
    isLegallyConsentAvailable: boolean
    consentScreenType: TConsentScreenType
}

export type TSocialButtonSource = 'login' | 'sign_up'

export enum TourAuthModalMode {
    SIGN_IN = 'sign_in',
    SIGN_UP = 'sign_up',
}
