import { clearWebFavoritesSession } from '../services/webFavorites'
import { googleWebAuth } from '../services/googleWebAuth'
import { deepLinkService } from '../../deferredDeeplink/services/deepLinkService'
import { deferredDeeplinkStoreChunk } from '../../deferredDeeplink/store/deferredDeeplinkStoreChunk'
import { AppleAuthError } from '@invertase/react-native-apple-authentication'
import { analyticsThunks } from '@mu-native/analytics'
import {
    apiStoreChunk,
    isAttestationFailure,
    handleError,
    isResponse,
    responseCode,
    showApiAlertError,
} from '@mu-native/api'
import {
    DispatchFun,
    fcm,
    GetStateFun,
    globalStorage,
    platform,
    TThunkAction,
    TThunkActionR,
} from '@mu-native/common'
import { translate } from '@mu-native/locale'
import { NavigationService } from '@mu-native/navigation'
import { rtAnalyticsService } from '@mu-native/rt-analytics'
import { searchStoreChunk } from '@mu-native/search'
import { appEventsEmitter, checkConnection, ensureNetwork } from '@mu-native/system'
import { GoogleSignin } from '@react-native-google-signin/google-signin'

import MetricaEvents from '../../../App/constants/MetricaEvents'
import { resetIdentity } from '../../../App/Controllers/CustomerSupport'
import { showAlertNotification } from '../../../App/Elements/NewAlertNotifications'
import { clearRecentlyScores } from '../../../App/Explore/exploreAsyncActions'
import MSScore from '../../../App/Model/MSScore.ts'
import { requestAndProcessUserProfile } from '../../../App/profileScreens/users/userService'
import reportEvent from '../../../App/Utils/Analytics'
import SentryUtils from '../../../App/Utils/Sentry'
import { consentOfferData } from '../constants/consentConstants.ts'
import { authErrors } from '../constants/errors'
import { recaptchaPlace } from '../constants/recaptchaPlace'
import { extractExpirationDate } from '../dataConverters/convertAuthData'
import { getAuthRtParams } from '../helpers/getAuthRtParams'
import { reportError } from '../helpers/reportError'
import { socialLoginAlert } from '../helpers/socialLoginAlert'
import { authServices, RefreshTokenExpiredError } from '../services/authServices'
import type { TAuthData } from '../types/authTypes'
import { TAuthMethod } from '../types/authTypes'

import {
    AuthModalStep,
    authStoreChunk,
    getIsAuthorized,
    SocialLoginParams,
    TAuthArgs,
    TAuthCreateArgs,
} from './authStoreChunk'

const updateFcmToken = async (state: any) => {
    try {
        const permission = await fcm().hasPermission()
        if (!(platform.isAndroid || permission === 1)) return
        const currentFcmToken = authStoreChunk.props.getFcmToken(state)
        const fcmToken = await fcm().getToken()

        if (fcmToken && fcmToken !== currentFcmToken) {
            await authServices.subscribeNotifications(currentFcmToken, fcmToken)
        }
    } catch (error) {
        console.log('FCM TOKEN ERROR', error)
    }
}

function closeAuthDialog(dispatch: (params: any) => void) {
    dispatch(authStoreChunk.actions.setIsVisible(false))
    dispatch(authStoreChunk.actions.setIsOpenTourAuthModal(false))
    dispatch(authStoreChunk.actions.setIsRecaptchaShown(false))
    dispatch(authStoreChunk.actions.setRecaptchaToken(null))
    setTimeout(() => {
        dispatch(authStoreChunk.actions.setStep(AuthModalStep.WelcomeModal))
    }, 500)
}

const completeLogin: TThunkAction<{
    data: TAuthData
    ui: TAuthMethod
    shouldCloseStack: boolean
}> =
    ({ data, ui, shouldCloseStack }) =>
    async (dispatch: any, getState: any) => {
        if (!data || typeof data.token !== 'string' || !data.token || !data.user_id) {
            throw new Error('Сервер не вернул данные аккаунта после авторизации.')
        }
        dispatch(authStoreChunk.actions.setAuthData(data))
        try {
            // Support SDK cleanup is independent of the signed-in session.
            void resetIdentity().catch(error => {
                console.warn('Support identity reset failed', error)
            })

            updateFcmToken(getState())
            closeAuthDialog(dispatch)

            if (shouldCloseStack) {
                NavigationService.popToTop()
                NavigationService.goBack()
            }

            const currentState = getState()

            const modalAction = authStoreChunk.props.getModalAction(currentState)

            if (modalAction) {
                setTimeout(() => {
                    modalAction()
                    dispatch(authStoreChunk.actions.setModalAction(null))
                }, 1000)
            }
            rtAnalyticsService.updateUserAttributes({ force: true })
            const isModalInTour = authStoreChunk.props.getIsModalInTour(currentState)
            const isConsentOfferCheckbox =
                authStoreChunk.props.getIsConsentOfferCheckbox(currentState)

            reportEvent(
                data.is_new_user
                    ? MetricaEvents.LANDING_SIGN_UP_SUCCESS
                    : MetricaEvents.LANDING_SIGN_IN_SUCCESS,
                {
                    value: ui,
                    ui: 'modal-short',
                    funnel_type: isModalInTour ? 'intentional' : 'unintentional',
                    ...(isModalInTour ? { funnel_source: 'Tour install' } : getAuthRtParams()),
                    'params.key': ['special_offers'],
                    'params.str_value': ['email'],
                    'params.value': [isConsentOfferCheckbox ? 1 : 0],
                },
            )
            reportEvent(
                data.is_new_user
                    ? MetricaEvents.NEW_ACCOUNT_SUCCESS
                    : MetricaEvents.TOUR_AUTHENTICATION_SUCCESS,
                { ui },
            )
            dispatch(clearRecentlyScores())
            dispatch(analyticsThunks.reLinkAppsFlyerThunk())
        } catch (error) {
            reportEvent(MetricaEvents.LANDING_SIGN_UP_ERROR, {
                value: ui,
                ui: 'modal-short',
            })
            console.log('COMPLETE LOGIN ERROR', error)
        } finally {
            dispatch(authStoreChunk.actions.setIsLoginLoading(false))
            dispatch(authStoreChunk.actions.setErrorCustom(null))
        }
    }

const appleLogin: TThunkAction<SocialLoginParams> =
    data => async (dispatch: any, getState: any) => {
        try {
            const isConsentOfferCheckbox =
                authStoreChunk.props.getIsConsentOfferCheckbox(getState())
            const consent =
                data.consent || isConsentOfferCheckbox
                    ? [
                          ...(isConsentOfferCheckbox ? [consentOfferData] : []),
                          ...(data.consent ? data.consent : []),
                      ]
                    : undefined

            const with_required_consents = isConsentOfferCheckbox ? 0 : undefined

            const response = await authServices.oAuth(
                data.token,
                'apple',
                consent,
                with_required_consents,
            )

            dispatch(
                completeLogin({
                    data: response,
                    ui: 'apple',
                    shouldCloseStack: data.shouldCloseStack === true,
                }),
            )

            reportEvent(MetricaEvents.APPLE_LOGIN_SUCCESS)
            dispatch(authStoreChunk.actions.setAuthMethod('apple'))
        } catch (error) {
            const isModalInTour = authStoreChunk.props.getIsModalInTour(getState())
            if (isModalInTour) {
                reportEvent(MetricaEvents.TOUR_AUTHENTICATION_ERROR, {
                    ui: 'apple',
                })
            }
            reportEvent(MetricaEvents.LANDING_SIGN_UP_ERROR, {
                value: 'apple',
                ui: 'modal-short',
            })
            if ((error as Record<string, string>).code === AppleAuthError.CANCELED) {
                reportEvent(MetricaEvents.APPLE_LOGIN_CANCEL)
            } else {
                handleError(error)
                showApiAlertError(await socialLoginAlert(error))
                SentryUtils.sendMessage('appleSignin', error)
                reportEvent(MetricaEvents.APPLE_LOGIN_ERROR)
                const code = await responseCode(error)
                reportError(error as Error, 'Apple', code)
            }
        } finally {
            dispatch(authStoreChunk.actions.setIsLoginLoading(false))
        }
    }

const googleLogin: TThunkAction<SocialLoginParams> =
    data => async (dispatch: any, getState: any) => {
        try {
            const response = await authServices.oAuth(data.token, 'google', data.consent)
            await dispatch(
                completeLogin({
                    data: response,
                    ui: 'google',
                    shouldCloseStack: data.shouldCloseStack === true,
                }),
            )
            reportEvent(MetricaEvents.GOOGLE_LOGIN_SUCCESS)
            dispatch(authStoreChunk.actions.setAuthMethod('google'))
        } catch (error) {
            const isModalInTour = authStoreChunk.props.getIsModalInTour(getState())
            if (isModalInTour) {
                reportEvent(MetricaEvents.TOUR_AUTHENTICATION_ERROR, {
                    ui: 'google',
                })
            }
            reportEvent(MetricaEvents.LANDING_SIGN_UP_ERROR, {
                value: 'google',
                ui: 'modal-short',
            })
            const cancelled = ['12501', 'SIGN_IN_CANCELLED'].includes(String((error as { code?: unknown } | null)?.code ?? ''))
            if (!cancelled) {
                handleError(error)
                showApiAlertError(await socialLoginAlert(error))
                SentryUtils.sendMessage('googleLogin', error)
                reportEvent(MetricaEvents.GOOGLE_LOGIN_ERROR)
            } else {
                reportEvent(MetricaEvents.GOOGLE_LOGIN_CANCEL)
            }
        } finally {
            dispatch(authStoreChunk.actions.setIsLoginLoading(false))
        }
    }

const facebookLogin: TThunkAction<SocialLoginParams> =
    data => async (dispatch: any, getState: any) => {
        try {
            const response = await authServices.oAuth(data.token, 'facebook', data.consent)
            dispatch(
                completeLogin({
                    data: response,
                    ui: 'facebook',
                    shouldCloseStack: data.shouldCloseStack === true,
                }),
            )
            reportEvent(MetricaEvents.FB_LOGIN_SUCCESS)
            dispatch(authStoreChunk.actions.setAuthMethod('facebook'))
        } catch (error: any) {
            const isModalInTour = authStoreChunk.props.getIsModalInTour(getState())
            if (isModalInTour) {
                reportEvent(MetricaEvents.TOUR_AUTHENTICATION_ERROR, { ui: 'facebook' })
            }
            reportEvent(MetricaEvents.LANDING_SIGN_UP_ERROR, {
                value: 'facebook',
                ui: 'modal-short',
            })
            if (!error?.message?.includes('cancelled')) {
                handleError(error)
                // In the tour the failure is rendered inline by setErrorCustom
                // below, so only outside it does the alert have to carry it.
                if (!isModalInTour) showApiAlertError(await socialLoginAlert(error))
                SentryUtils.sendMessage('fbLogin', error)
                reportEvent(MetricaEvents.FB_LOGIN_ERROR)
                const code = await responseCode(error)
                reportError(error as Error, 'Facebook', code)
                dispatch(authStoreChunk.actions.setErrorCustom('facebook'))
            }
        } finally {
            dispatch(authStoreChunk.actions.setIsLoginLoading(false))
        }
    }

const checkRecaptcha: TThunkAction = () => async (dispatch: any, getState: any) => {
    const recaptchaParams = authStoreChunk.props.getRecaptchaActionParams(getState())

    if (recaptchaParams) {
        dispatch(authStoreChunk.actions.setRecaptchaActionParams(null))
        return
    }

    const response = await authServices.requestRecapture()

    if (response.is_required) {
        dispatch(authStoreChunk.actions.setRecaptcha(response))

        throw new Error(authErrors.showRecaptcha)
    }
}

const login: TThunkAction<TAuthArgs> = args => async (dispatch: any, getState: any) => {
    try {
        if (!args.login || !args.password) {
            throw new Error(authErrors.noParamsForLogin)
        }

        await ensureNetwork()
        dispatch(authStoreChunk.actions.setErrorCustom(null))
        const currentState = getState()
        const recaptchaToken = authStoreChunk.props.getRecaptchaToken(currentState)

        dispatch(authStoreChunk.actions.setIsLoginLoading(true))

        await dispatch(checkRecaptcha())

        // Send login first. The API transport handles attestation if the server requires it.
        // A locally failed App Check must not prevent sending a legitimate login request.
        const f = apiStoreChunk.props.getF(getState())

        const response = await authServices.auth(args.login.trim(), args.password, recaptchaToken, f)
        await dispatch(completeLogin({ data: response, ui: 'email', shouldCloseStack: false }))

        reportEvent(MetricaEvents.EMAIL_LOGIN_SUCCESS)
        dispatch(authStoreChunk.actions.setAuthMethod('email'))
    } catch (error: any) {
        if (error?.message === authErrors.showRecaptcha) {
            dispatch(
                authStoreChunk.actions.setRecaptchaActionParams({
                    type: recaptchaPlace.login,
                    params: args,
                }),
            )
            return
        }

        handleError(error)
        let message = isAttestationFailure(error)
            ? 'Сервер требует подтверждения подлинности приложения. Проверка этой сборки не пройдена; войти через мобильный API пока невозможно.'
            : error instanceof Error ? error.message : ''
        if (isResponse(error)) {
            try { message = (await error.clone().json())?.message || `Ошибка входа (HTTP ${error.status})` }
            catch { message = `Ошибка входа (HTTP ${error.status})` }
        }
        dispatch(authStoreChunk.actions.setErrorCustom(message || 'Не удалось войти в аккаунт.'))
        reportEvent(MetricaEvents.LANDING_SIGN_IN_ERROR, {
            value: 'email',
            ui: 'modal-short',
        })
        const isModalInTour = authStoreChunk.props.getIsModalInTour(getState())
        if (isModalInTour) {
            reportEvent(MetricaEvents.TOUR_AUTHENTICATION_ERROR, {
                ui: 'email',
                value: error?.message,
            })
        }
    } finally {
        dispatch(authStoreChunk.actions.setIsLoginLoading(false))
        dispatch(authStoreChunk.actions.setRecaptchaToken(null))
    }
}

const logout: TThunkAction<boolean | void> =
    (force = false) =>
    async (dispatch: DispatchFun, getState: GetStateFun) => {
        const state = getState()
        if (force && !getIsAuthorized(state) && !authStoreChunk.props.getRefreshToken(state)) return

        // Automatic logout applies to the mobile credentials only.
        const keepWebSession = force && platform.isAndroid && !!authStoreChunk.props.getWebFavoriteUser(state)?.id
        try {
            if (!force) {
                await clearWebFavoritesSession()
                try {
                    GoogleSignin.configure()
                    await GoogleSignin.signOut()
                    await GoogleSignin.revokeAccess()
                } catch {
                    /* Google sign-out is optional. */
                }
            }
            dispatch(authStoreChunk.actions.resetAuth(keepWebSession))
            dispatch(apiStoreChunk.actions.reset())
            if (!keepWebSession) dispatch(clearRecentlyScores())
            if (force && !keepWebSession) appEventsEmitter.emit('presentForceLogout')
            await resetIdentity()
        } catch (error) {
            console.log('LOGOUT ERROR', error)
        }
    }

const refreshRequests = new Map<string, Promise<void>>()

const refreshToken: TThunkAction<string> = token => (dispatch: DispatchFun, getState: GetStateFun) => {
    const isCurrent = () => authStoreChunk.props.getRefreshToken(getState()) === token
    if (!isCurrent()) return

    const existing = refreshRequests.get(token)
    if (existing) return existing

    const refresh = async () => {
        let expiresAt = null
        try {
            expiresAt = extractExpirationDate(token)
        } catch {
            // A malformed saved token cannot be refreshed.
        }

        try {
            if (!expiresAt || expiresAt <= Date.now()) throw new RefreshTokenExpiredError()
            const response = await authServices.refreshToken(token)
            if (!isCurrent()) return
            dispatch(authStoreChunk.actions.setPartialFieldsCustom({
                token: response.token,
                tokenExpiresAt: extractExpirationDate(response.token),
                refreshToken: response.refresh_token,
            }))
        } catch (error) {
            if (!isCurrent()) return
            if (!(error instanceof RefreshTokenExpiredError)) throw error
            reportEvent('Dev: force logout')
            await dispatch(logout(true))
        }
    }

    const request = refresh().finally(() => refreshRequests.delete(token))
    refreshRequests.set(token, request)
    return request
}

const getServerValuesThunk: TThunkAction = () => async (dispatch: any) => {
    try {
        console.log('[AuthThunks.getServerValuesThunk]')
        const response = await authServices.getAuthMethodsAvailable()
        if (response.timestamp) {
            dispatch(apiStoreChunk.actions.setServerTimestamp(response.timestamp * 1000))
        }

        if (response?.serviceSettings?.externalServices?.mobile) {
            const { externalServices } = response.serviceSettings
            dispatch(
                authStoreChunk.actions.setAuthMethods({
                    isAppleAvailable: externalServices.mobile['auth.apple'],
                    isGoogleAvailable: externalServices.mobile['auth.google'],
                    isFacebookAvailable: externalServices.mobile['auth.facebook'],
                    isLegallyConsentAvailable: externalServices.mobile['auth.consent'],
                    consentScreenType: response.consentScreenType,
                }),
            )
        }

        if (response) {
            dispatch(
                searchStoreChunk.actions.setTrendingSearchSuggestions({
                    suggestions: response?.trendingSearchSuggestions ?? [],
                    trendingScores: MSScore.processSuggestionScores(response?.trendingScores ?? []),
                }),
            )
        }
    } catch (error) {
        handleError(error)
    }
}

const createAccount = (args: TAuthCreateArgs) => {
    return async function createAccount(dispatch: (params: any) => void, getState: () => any) {
        try {
            dispatch(authStoreChunk.actions.setErrorCustom(null))
            await ensureNetwork()
            const currentState = getState()
            const recaptchaToken = authStoreChunk.props.getRecaptchaToken(currentState)

            await dispatch(checkRecaptcha())

            const response = await authServices.createAccount({
                capcha: recaptchaToken ?? undefined,
                email: args.email,
                password: args.password,
                username: args.login,
            })

            dispatch(
                completeLogin({
                    data: response,
                    ui: 'email',
                    shouldCloseStack: args.shouldCloseStack,
                }),
            )

            reportEvent(MetricaEvents.EMAIL_LOGIN_CREATE_SUCCESS)

            reportEvent(MetricaEvents.LANDING_SIGN_UP_SUCCESS, {
                ui: 'email',
                funnel_type: 'unintentional',
                ...getAuthRtParams(),
            })
            dispatch(authStoreChunk.actions.setAuthMethod('email'))
        } catch (error: any) {
            if (isResponse(error)) {
                try {
                    const json = await error.json()
                    if (json?.message) {
                        reportEvent(MetricaEvents.EMAIL_LOGIN_CREATE_ERROR)
                        dispatch(authStoreChunk.actions.setErrorCustom(json.message))
                        return
                    }
                    // eslint-disable-next-line no-empty
                } catch {}
            }
            dispatch(authStoreChunk.actions.setIsLoginLoading(false))
            reportEvent(MetricaEvents.LANDING_SIGN_UP_ERROR, {
                value: 'email',
                ui: 'modal-short',
            })
            if (error?.message === authErrors.showRecaptcha) {
                dispatch(
                    authStoreChunk.actions.setRecaptchaActionParams({
                        type: recaptchaPlace.createAccount,
                        params: args,
                    }),
                )
            } else {
                showApiAlertError(error)
                reportEvent(MetricaEvents.EMAIL_LOGIN_CREATE_ERROR)
                dispatch(authStoreChunk.actions.setErrorCustom(error.message))
            }
        } finally {
            dispatch(authStoreChunk.actions.setIsLoginLoading(false))
        }
    }
}

const verifyRecaptcha: TThunkAction<{ token: string }> = ({ token }) => {
    return async (dispatch: any, getState: any) => {
        try {
            const recaptchaParams = authStoreChunk.props.getRecaptchaActionParams(getState())
            if (!recaptchaParams) {
                throw new Error(authErrors.noRecaptchaParams)
            }
            const { type, params } = recaptchaParams

            const callbacksMap = {
                [recaptchaPlace.login]: login,
                [recaptchaPlace.createAccount]: createAccount,
            }

            dispatch(authStoreChunk.actions.setRecaptchaToken(token))
            dispatch(callbacksMap[type](params as any))
        } catch (error) {
            handleError(error)
        } finally {
            dispatch(authStoreChunk.actions.setIsLoginLoading(false))
        }
    }
}

const closeAuthModal: TThunkAction<void> = () => {
    return (dispatch: any) => {
        dispatch(authStoreChunk.actions.setIsVisible(false))
        dispatch(authStoreChunk.actions.setStep(AuthModalStep.WelcomeModal))
    }
}

const createAccountTour: TThunkAction = () => async (dispatch: any, getState: any) => {
    try {
        dispatch(authStoreChunk.actions.setIsLoginLoading(true))
        dispatch(authStoreChunk.actions.setErrorCustom(null))
        await ensureNetwork()
        const state = getState()
        const email = authStoreChunk.props.getTourEmail(state)
        const isConsentOfferCheckbox = authStoreChunk.props.getIsConsentOfferCheckbox(state)

        const response = await authServices.createAccount({
            email,
            type: 'email',
            consent: isConsentOfferCheckbox ? [consentOfferData] : undefined,
            with_required_consents: isConsentOfferCheckbox ? 0 : undefined,
        })

        dispatch(
            completeLogin({
                data: response,
                ui: 'email',
                shouldCloseStack: false,
            }),
        )

        reportEvent(MetricaEvents.NEW_ACCOUNT_SUCCESS, {
            ui: 'email',
        })
        dispatch(authStoreChunk.actions.setAuthMethod('email'))
    } catch (error: unknown) {
        let message: string | undefined
        if (isResponse(error)) {
            try {
                message = (await error.json())?.message
                // eslint-disable-next-line no-empty
            } catch {}
        }
        dispatch(
            authStoreChunk.actions.setErrorCustom(
                message || translate('native.alerts.error_occurred'),
            ),
        )
    } finally {
        dispatch(authStoreChunk.actions.setIsLoginLoading(false))
    }
}

const loadUserProfile = () => async (dispatch: DispatchFun, getState: GetStateFun) => {
    const { id } = authStoreChunk.props.getUser(getState())

    if (id) {
        const profile = await requestAndProcessUserProfile(id)
        dispatch(authStoreChunk.actions.setUserProfile(profile))
    }
}

const mobWebUserLogin: TThunkAction<{ secret: string }> =
    ({ secret }) =>
    async (dispatch: DispatchFun) => {
        try {
            if (!secret) {
                throw new Error(authErrors.noParamsForLogin)
            }
            checkConnection()

            const response = await authServices.authMobWeb(secret)

            await dispatch(completeLogin({ data: response, ui: 'mob_web', shouldCloseStack: false }))
            dispatch(authStoreChunk.actions.setAuthMethod('mob_web'))
        } catch (error) {
            handleError(error)

            throw error
        }
    }

const googleWebLogin: TThunkAction = () => async (dispatch: DispatchFun, getState: GetStateFun) => {
    const preserveOtherLinks = (links: Awaited<ReturnType<typeof deepLinkService.fetchDeeplinkData>>['deeplinks']) => {
        const others = links.filter(item => item.action !== 'auth')
        if (!others.length) return
        const existing = deferredDeeplinkStoreChunk.props.getData(getState())
        dispatch(deferredDeeplinkStoreChunk.actions.setData([...existing, ...others]))
    }
    await googleWebAuth({
        beforeOpen: async () => {
            // Do not sign into a stale account from a previous deferred link.
            try { const result = await deepLinkService.fetchDeeplinkData(); preserveOtherLinks(result.deeplinks) }
            catch { /* Failure here must not prevent the user opening the official login page. */ }
        },
        finish: async () => {
            // Accept secrets only from the service's device-specific handoff API, not arbitrary app links.
            const result = await deepLinkService.fetchDeeplinkData()
            preserveOtherLinks(result.deeplinks)
            const secret = result.deeplinks.find(item => item.action === 'auth')?.payload || null
            if (!secret) throw new Error('Сайт не передал приложению данные для входа. Завершите вход Google на сайте и нажмите «Открыть в приложении». Веб-сессия сама по себе не авторизует мобильный API.')
            await dispatch(mobWebUserLogin({ secret }))
        },
    })
}

const onAuthMobWebUserThunk: TThunkAction<{ secret: string }> =
    ({ secret }) =>
    async (dispatch: DispatchFun) => {
        try {
            showAlertNotification({
                title: translate('native.screen_login.mob_web_auth_in_progress'),
                expiresIn: 5000,
            })

            await dispatch(mobWebUserLogin({ secret }))
        } catch (error) {
            if (isResponse(error)) {
                try {
                    const parsedError = await error.json()
                    showAlertNotification({
                        title:
                            parsedError?.message ||
                            translate('native.screen_login.mob_web_auth_error'),
                        expiresIn: 5000,
                    })
                } catch {
                    showAlertNotification({
                        title: translate('native.screen_login.mob_web_auth_error'),
                        expiresIn: 5000,
                    })
                }
            }
        } finally {
            globalStorage.set('deeplinkData', '')
        }
    }

const presentLoginModalIfUnauthorized: TThunkActionR<boolean, (() => void) | void> =
    () => async (dispatch, getState) => {
        if (getIsAuthorized(getState())) return true

        dispatch(authStoreChunk.actions.setIsVisible(true))

        return false
    }

export const authThunks = {
    googleWebLogin,
    appleLogin,
    googleLogin,
    facebookLogin,
    login,
    checkRecaptcha,
    verifyRecaptcha,
    createAccount,
    logout,
    refreshToken,
    getServerValuesThunk,
    closeAuthModal,
    presentLoginModalIfUnauthorized,
    createAccountTour,
    loadUserProfile,
    mobWebUserLogin,
    onAuthMobWebUserThunk,
}
