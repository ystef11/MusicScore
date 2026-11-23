import { createExtendedStoreChunk } from '@ug/store'
import { createSelector } from 'reselect'

import type { UserInfoT } from '../../../App/profileScreens/users/userTypes'
import { recaptchaPlace } from '../constants/recaptchaPlace'
import {
    convertAuthData,
    extractExpirationDate,
    type TAuth,
} from '../dataConverters/convertAuthData'
import { convertAuthError } from '../dataConverters/convertAuthError'
import { convertRecaptchaData, type TRecaptchaData } from '../dataConverters/convertRecaptchaData'
import {
    type TAuthMethod,
    type TAuthMethods,
    TourAuthModalMode,
    type TRecaptchaResponse,
} from '../types/authTypes'

export type TAuthArgs = {
    type: 'login'
    login: string
    password: string
}

export type TAuthCreateArgs = {
    type: 'create'
    email: string
    login: string
    password: string
    consent?: AuthConsent
    shouldCloseStack: boolean
}

export type SocialLoginParams = {
    token: string
    consent?: AuthConsent
    shouldCloseStack?: boolean
}

export type AuthConsent = { type: number; value: number }[]

export type TAuthRecaptchaParams = {
    type: keyof typeof recaptchaPlace
    params: TAuthArgs | TAuthCreateArgs
}

export enum AuthModalStep {
    WelcomeModal = 0,
    Login = 1,
    CreateAccount = 2,
}

export type TWebFavoriteUser = { id: number; name: string; email: string | null; avatar: string | null }

type TAuthState = TAuth & {
    webFavoriteUser: TWebFavoriteUser | null
    authMethod: TAuthMethod
    fcmToken: string | null
    error: string | null
    isLoginLoading: boolean
    isAppleLoading: boolean
    isGoogleLoading: boolean
    isFacebookLoading: boolean
    pendingAuthMethod: TAuthMethod | null
    isVisible: boolean
    isRecaptchaShown: boolean
    modalAction: (() => void) | null
    recaptcha: TRecaptchaData
    recaptchaActionParams: TAuthRecaptchaParams | null
    recaptchaToken: string | null
    step: AuthModalStep
    isModalInTour: boolean
    authMethods: TAuthMethods
    isOpenTourAuthModal: boolean
    tourEmail: string
    tourModalMode: TourAuthModalMode
    userProfile: UserInfoT | null
    isConsentOfferCheckbox: boolean
}

const initialMobileAuth: TAuth = {
    access: null,
    isActive: false,
    outdatedAccesses: null,
    refreshToken: null,
    rights: [],
    token: null,
    tokenExpiresAt: null,
    trackingId: null,
    user: {
        avatar: null,
        email: null,
        id: null,
        name: null,
    },
}

export const authStoreChunk = createExtendedStoreChunk<TAuthState>({
    treeKey: 'modules',
    storeKey: 'auth',
})({
    persist: [
        'webFavoriteUser',
        'user',
        'token',
        'tokenExpiresAt',
        'refreshToken',
        'authMethod',
        'access',
        'outdatedAccesses',
    ],
    initialState: {
        ...initialMobileAuth,
        webFavoriteUser: null,
        authMethod: 'no_auth',
        pendingAuthMethod: null,
        error: null,
        fcmToken: null,
        isAppleLoading: false,
        isGoogleLoading: false,
        isFacebookLoading: false,
        isLoginLoading: false,
        isRecaptchaShown: false,
        isVisible: false,
        modalAction: null,
        recaptcha: {
            domain: '',
            isRequired: 0,
            publicKey: '',
        },
        recaptchaActionParams: null,
        recaptchaToken: null,
        step: 0,
        userProfile: null,
        isModalInTour: false,
        authMethods: {
            isGoogleAvailable: true,
            isAppleAvailable: true,
            isFacebookAvailable: true,
            isLegallyConsentAvailable: false,
            consentScreenType: null,
        },
        isOpenTourAuthModal: false,
        tourEmail: '',
        tourModalMode: TourAuthModalMode.SIGN_UP,
        isConsentOfferCheckbox: false,
    },
    actions: {
        presentAuthModal: (action?: () => void) => {
            return {
                isVisible: true,
                modalAction: action ?? null,
            }
        },

        setAuthData: convertAuthData,
        setErrorCustom: convertAuthError,
        setRecaptcha: (recaptcha: TRecaptchaResponse) => ({
            recaptcha: convertRecaptchaData(recaptcha),
            isRecaptchaShown: true,
        }),

        setRecaptchaToken: (recaptchaToken: TAuthState['recaptchaToken']) => ({
            recaptchaToken,
            isRecaptchaShown: false,
        }),
        setToken: (token: TAuthState['token']) => {
            return {
                token,
                tokenExpiresAt: extractExpirationDate(token),
            }
        },
        resetAuth: (keepWebSession = false) => ({
            ...initialMobileAuth,
            ...(keepWebSession ? {} : { webFavoriteUser: null }),
            authMethod: 'no_auth' as const,
            recaptchaToken: null,
            userProfile: null,
        }),
        setPartialFieldsCustom: (state: Partial<TAuthState>) => state,
    },
})

export const getIsAuthorized = createSelector(authStoreChunk.props.getToken, token => {
    return !!token
})

export const getUserId = createSelector(authStoreChunk.props.getUser, user => user.id)

// Cookie-based favorites are separate from mobile bearer authentication.
export const getCanUseFavorites = createSelector(getIsAuthorized, authStoreChunk.props.getWebFavoriteUser, (mobile, web) => mobile || !!web?.id)
