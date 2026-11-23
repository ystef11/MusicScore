import { Alert } from 'react-native'
import {
    finishTransaction,
    getAvailablePurchases,
    getStorefront,
    isEligibleForIntroOfferIOS,
    type Purchase,
    type PurchaseAndroid,
    PurchaseIOS,
    requestPurchase,
} from '../services/storeBilling'

import { handleError, isNetworkError, isResponse } from '@mu-native/api'
import { authStoreChunk } from '@mu-native/auth'
import { device, getCountry, platform, TThunkAction, wait } from '@mu-native/common'
import { showAlertNotification } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { checkConnectionSafely, ensureNetwork } from '@mu-native/system'

import MetricaEvents from '../../../App/constants/MetricaEvents'
import reportEvent from '../../../App/Utils/Analytics'
import Sentry from '../../../App/Utils/Sentry'
import { marketingConstants, sources } from '../constants/marketingConstants'
import {
    getEbooksFeatures,
    getLearnFeatures,
    getLearnLiteFeatures,
    getOffScoresFeatures,
    getProFeatures,
    planNames,
} from '../constants/subsriptionBillingConstants.ts'
import { billingHelpers } from '../helpers/billingHelpers'
import { convertToAccessRights, validateServiceJSON } from '../helpers/convertDataHelpers'
import { getContentTypeByProductId } from '../helpers/getContentTypeByProductId'
import { getCurrentUpgradeMode } from '../helpers/getCurrentUpgradeMode'
import { withIapConnection } from '../helpers/iapConnection'
import { nativeBillingHelpers } from '../helpers/nativeBillingHelpers'
import {
    getRtParamsBySource,
    getSubscriptionPurchaseByProductId,
    subscriptionsRtHelpers,
} from '../helpers/subscriptionsRtHelpers'
import {
    accessRightsService,
    buyCourseByCredit,
    buyEbookByCredit,
    buyScoreByCredit,
    getInAppForSale,
    registerSingleReceiptAndroidService,
    registerSingleReceiptIosService,
    saveInAppForSale,
} from '../services/marketingServices'
import { marketingStorage } from '../storage/marketingStorage'
import {
    TAccessRight,
    TInAppForSale,
    TProduct,
    TProductId,
    TProductInApp,
    TSources,
    TSubscription,
    TSubscriptionForRestore,
} from '../types/marketingTypes'

import { marketingStoreChunk } from './marketingStoreChunk'
import { marketingThunks } from './marketingThunks'

const receiptRetryDelaysMs = [1000, 3000, 9000]

const saveAllAccessRightsToStoreThunk: TThunkAction<{
    rights: TAccessRight[]
}> =
    ({ rights }) =>
    async (dispatch, getState) => {
        try {
            if (rights?.length) {
                const servicePro = rights.find(
                    el => el.serviceName === billingHelpers.getAccessRightsByPlatform(),
                )
                const serviceOffScores = rights.find(
                    el => el.serviceName === billingHelpers.getAccessPlusRightsByPlatform(),
                )
                const serviceLearning = rights.find(
                    el => el.serviceName === billingHelpers.getAccessLearningRightsByPlatform(),
                )
                const serviceLearningLite = rights.find(
                    el => el.serviceName === billingHelpers.getAccessLearningLiteRightsByPlatform(),
                )
                const serviceLearningLiteWithLearnLiteSubscription = rights.find(
                    el =>
                        el.productId === marketingConstants.instantLearnLiteSubscriptionId ||
                        el.productId === marketingConstants.monthLearnLiteSubscriptionId ||
                        el.productId === marketingConstants.yearLiteSubscriptionId,
                )
                const serviceEbook = rights.find(
                    el => el.serviceName === billingHelpers.getAccessEbookRightsByPlatform(),
                )
                const serviceAutoGrade = rights.find(
                    el =>
                        el.serviceName === billingHelpers.getAccessAutoGradeLiteRightsByPlatform(),
                )
                const servicePremium = rights.find(
                    el => el.serviceName === billingHelpers.getAccessPremiumRightsByPlatform(),
                )

                const currentDate = Math.floor(Date.now() / 1000)

                const isAccessProUnexpired =
                    !!servicePro?.dateAccess && currentDate < servicePro?.dateAccess
                const isAccessOffScoresUnexpired =
                    !!serviceOffScores?.dateAccess && currentDate < serviceOffScores.dateAccess
                const isAccessLearningUnexpired =
                    !!serviceLearning?.dateAccess && currentDate < serviceLearning.dateAccess
                const isAccessLearningLiteUnexpired =
                    !!serviceLearningLite?.dateAccess &&
                    currentDate < serviceLearningLite.dateAccess
                const isAccessLearningLiteWithLearnLiteSubscription =
                    !!serviceLearningLiteWithLearnLiteSubscription?.dateAccess &&
                    currentDate < serviceLearningLiteWithLearnLiteSubscription.dateAccess
                const isAccessEbookUnexpired =
                    !!serviceEbook?.dateAccess && currentDate < serviceEbook?.dateAccess
                const isAccessAutoGradeUnexpired =
                    !!serviceAutoGrade?.dateAccess && currentDate < serviceAutoGrade?.dateAccess
                const isAccessPremiumUnexpired =
                    !!servicePremium?.dateAccess && currentDate < servicePremium.dateAccess

                const currentProductIdPro = isAccessProUnexpired ? servicePro?.productId : ''
                const currentProductIdOffscores = isAccessOffScoresUnexpired
                    ? serviceOffScores?.productId
                    : ''
                const currentProductIdLearn = isAccessLearningUnexpired
                    ? serviceLearning?.productId
                    : ''
                const currentProductIdLearnLite = isAccessLearningLiteUnexpired
                    ? serviceLearningLite?.productId
                    : ''
                const currentProductIdEbook = isAccessEbookUnexpired ? serviceEbook?.productId : ''
                const isLifetime = !!servicePro?.lifetime
                const isTrial =
                    !!servicePro?.trial || !!serviceOffScores?.trial || !!serviceLearning?.trial

                // handle Android Google Play "Account Hold"
                if (platform.isAndroid) {
                    const isPaymentPending = !!(servicePro && servicePro.isPaymentPending)
                    const dayInterval = 60 * 60 * 24
                    // Дата окончания Account hold на Android (23 дня после грейс периода)
                    const accountHoldExpiringDate =
                        isPaymentPending && servicePro?.dateAccess
                            ? servicePro.dateAccess + dayInterval * 23
                            : null

                    const currentState = getState()
                    const { getIsSubscriptionPaymentPending, getAccountHoldExpiringDate } =
                        marketingStoreChunk.props
                    const prevIsPaymentPending = getIsSubscriptionPaymentPending(currentState)
                    const prevAccountHoldExpiringDate = getAccountHoldExpiringDate(currentState)

                    if (
                        !isPaymentPending &&
                        prevIsPaymentPending &&
                        prevAccountHoldExpiringDate &&
                        prevAccountHoldExpiringDate > currentDate
                    ) {
                        const isGracePeriod =
                            prevAccountHoldExpiringDate - currentDate >= dayInterval * 23
                        reportEvent(MetricaEvents.HOLD_PAYMENT_FIXED, {
                            isGracePeriod,
                        })
                    }

                    dispatch(
                        marketingStoreChunk.actions.setPartialFieldsCustom({
                            isSubscriptionPaymentPending: isPaymentPending,
                            accountHoldExpiringDate,
                        }),
                    )
                }
                dispatch(
                    marketingStoreChunk.actions.setPartialFieldsCustom({
                        isCourses: isAccessLearningUnexpired,
                        isPro: isAccessProUnexpired || isAccessOffScoresUnexpired,
                        isOffScores: isAccessOffScoresUnexpired,
                        isTrialPro: !!servicePro?.trial,
                        isTrial,
                        isHadProAccess: !!servicePro?.dateAccess,
                        isHadProAccessCourses: !!serviceLearning?.dateAccess,
                        isHadProAccessOffScores: !!serviceOffScores?.dateAccess,
                        isHadProAccessEbook: !!serviceEbook?.dateAccess,
                        isLearningLite: !!serviceLearningLite?.dateAccess,
                        isLearnLiteSubscriptionActive:
                            isAccessLearningLiteWithLearnLiteSubscription,
                        isLifetime,
                        isEbookRights: isAccessEbookUnexpired,
                        isAutoGradeRights: isAccessAutoGradeUnexpired,
                        isPremiumRights: isAccessPremiumUnexpired,

                        currentSubscriptionProInfo: {
                            autoRenew: servicePro?.autoRenew,
                            dateEndAccess: servicePro?.dateAccess,
                            productId: currentProductIdPro,
                            featureList: getProFeatures(),
                            planName: planNames.pro,
                            isActive: isAccessProUnexpired,
                        },
                        currentSubscriptionOffScoresInfo: {
                            autoRenew: serviceOffScores?.autoRenew,
                            dateEndAccess: serviceOffScores?.dateAccess,
                            productId: currentProductIdOffscores,
                            featureList: getOffScoresFeatures(),
                            planName: planNames.offScores,
                            isActive: isAccessOffScoresUnexpired,
                        },
                        currentSubscriptionEbookInfo: {
                            autoRenew: serviceEbook?.autoRenew,
                            dateEndAccess: serviceEbook?.dateAccess,
                            productId: currentProductIdEbook,
                            featureList: getEbooksFeatures(),
                            planName: planNames.ebooks,
                            isActive: isAccessEbookUnexpired,
                        },
                        currentSubscriptionLearnInfo: {
                            autoRenew: serviceLearning?.autoRenew,
                            dateEndAccess: serviceLearning?.dateAccess,
                            productId: currentProductIdLearn,
                            featureList: getLearnFeatures(),
                            planName: planNames.learn,
                            isActive: isAccessLearningUnexpired,
                        },
                        currentSubscriptionLearnLiteInfo: {
                            autoRenew: serviceLearningLite?.autoRenew,
                            dateEndAccess: serviceLearningLite?.dateAccess,
                            productId: currentProductIdLearnLite,
                            featureList: getLearnLiteFeatures(),
                            planName: planNames.learnLite,
                            isActive: isAccessLearningLiteUnexpired,
                        },
                        currentSubscriptionProductId: currentProductIdPro,
                        rights,
                    }),
                )
            } else {
                dispatch(
                    marketingStoreChunk.actions.setPartialFieldsCustom({
                        isCourses: false,
                        isPro: false,
                        isOffScores: false,
                        isLearningLite: false,
                        isTrial: false,
                        isTrialPro: false,
                        isLearnLiteSubscriptionActive: false,
                        isLifetime: false,
                        isEbookRights: false,
                        isAutoGradeRights: false,
                        currentSubscriptionProductId: '',
                        currentSubscriptionProInfo: null,
                        currentSubscriptionOffScoresInfo: null,
                        currentSubscriptionLearnInfo: null,
                        currentSubscriptionLearnLiteInfo: null,
                        currentSubscriptionEbookInfo: null,
                        subscriptionsForRestore: [],
                        isHadProAccess: false,
                        isHadProAccessOffScores: false,
                        isHadProAccessCourses: false,
                        isHadProAccessEbook: false,
                    }),
                )
            }
        } catch (error) {
            reportEvent('Save rights thunk error', {
                error: (error as Error)?.message,
            })
        } finally {
            if (platform.isIos) dispatch(checkIntroductoryOffersIos())
        }
    }

const registerSingleReceiptThunk: TThunkAction<{
    purchase: Purchase
    source: TSources
    productId?: TProductId
    isUpgradeMode?: boolean
    inAppForSale?: TInAppForSale
}> = ({ purchase, source, productId = '', isUpgradeMode = false, inAppForSale }) => {
    return async (dispatch, getState) => {
        try {
            const currentState = getState()

            const inAppDetails = marketingStorage.get('inAppDetails')
            const currentSubscriptionInfo = marketingStoreChunk.props
                .getSubscriptions(currentState)
                .find(({ id }) => id === purchase.productId)

            let responseRights = null

            if (platform.isAndroid) {
                purchase = purchase as PurchaseAndroid
                responseRights = await registerSingleReceiptAndroidService({
                    purchase: purchase.dataAndroid as string,
                    purchase_signature: purchase.signatureAndroid as string,
                    ...(inAppDetails || {}),
                    source,
                    ...(marketingConstants.listInApps.includes(productId)
                        ? {
                              content_type: getContentTypeByProductId(productId),
                              content_id: marketingConstants.listPieceSaleInApps.includes(productId)
                                  ? inAppForSale?.id
                                  : productId,
                          }
                        : {}),
                })
            }
            if (platform.isIos) {
                purchase = purchase as PurchaseIOS
                responseRights = await registerSingleReceiptIosService({
                    bodyObject: {
                        transaction_id: purchase.transactionId as string,
                        source,
                        ...(inAppDetails || {}),
                        ...(marketingConstants.listInApps.includes(productId)
                            ? {
                                  purchased_content: JSON.stringify({
                                      [purchase.transactionId as string]: {
                                          content_type: getContentTypeByProductId(productId),
                                          content_id:
                                              marketingConstants.listPieceSaleInApps.includes(
                                                  productId,
                                              )
                                                  ? inAppForSale?.id
                                                  : productId,
                                      },
                                  }),
                              }
                            : {}),
                    },
                })
            }

            if (!validateServiceJSON(responseRights)) {
                return
            }

            const rights = marketingConstants.listInApps.includes(productId)
                ? null
                : convertToAccessRights(responseRights)

            reportEvent(MetricaEvents.BILLING_RECEIPT_VALIDATE, {
                productId,
                subscription_purchase: getSubscriptionPurchaseByProductId(
                    purchase?.productId as TProductId,
                ),
                ...(source
                    ? getRtParamsBySource({
                          source,
                          isUpgradeMode,
                          productId: purchase?.productId as TProductId,
                      })
                    : {}),
                funnel_source: source,
                screen: 'PaywallCheckoutScreen',
                ...(!!currentSubscriptionInfo &&
                    subscriptionsRtHelpers.getRtBillingParams(currentSubscriptionInfo)),
            })

            if (rights) dispatch(saveAllAccessRightsToStoreThunk({ rights }))
        } catch (error) {
            let parsedError = error as Error
            if (isResponse(parsedError)) {
                try {
                    parsedError = await parsedError.json()
                } catch (e) {
                    console.error('Error parsed response registerSingleReceiptThunk')
                }
            }
            try {
                reportEvent(RT_EVENTS.BILLING_RECEIPT_FAIL, {
                    value: parsedError?.message || JSON.stringify(parsedError),
                })
            } catch (e) {
                console.error('Error parsed registerSingleReceiptThunk')
            }

            throw parsedError
        }
    }
}

const getAllAccessRightsThunk: TThunkAction = () => async dispatch => {
    try {
        if (!checkConnectionSafely()) return

        const responseJSON = await accessRightsService()
        const rights = convertToAccessRights(responseJSON)
        if (rights) {
            await dispatch(saveAllAccessRightsToStoreThunk({ rights }))
            dispatch(marketingStoreChunk.actions.setIsAccessRightsLoaded(true))
        }
        dispatch(marketingThunks.loadUserBalance())
    } catch (error) {
        // 5xx says nothing about the user's rights: keep the persisted ones and don't unlock offers
        if (isResponse(error) && error.status < 500) {
            await dispatch(saveAllAccessRightsToStoreThunk({ rights: [] }))
            dispatch(marketingStoreChunk.actions.setIsAccessRightsLoaded(true))
        }
    }
}

const checkCancelSubscriptionThunk: TThunkAction<{
    planNames: ('pro' | 'offScores' | 'learning' | 'learningLite' | 'ebook')[]
}> =
    ({ planNames }) =>
    async dispatch => {
        try {
            const responseJSON = await accessRightsService()
            const rights = convertToAccessRights(responseJSON)
            if (rights) {
                planNames.forEach(planName => {
                    const currentService = rights.find(
                        el =>
                            el.serviceName ===
                            {
                                pro: billingHelpers.getAccessRightsByPlatform(),
                                offScores: billingHelpers.getAccessPlusRightsByPlatform(),
                                learning: billingHelpers.getAccessLearningRightsByPlatform(),
                                learningLite:
                                    billingHelpers.getAccessLearningLiteRightsByPlatform(),
                                ebook: billingHelpers.getAccessEbookRightsByPlatform(),
                            }[planName],
                    )

                    if (currentService?.autoRenew === 0) {
                        dispatch(
                            marketingStoreChunk.actions.addSubscriptionForRestoreCustom({
                                subscriptionForRestore: {
                                    productId: currentService.productId,
                                    dateEndAccess: currentService.dateAccess,
                                    planName,
                                },
                            }),
                        )
                    }
                    if (currentService?.autoRenew === 1) {
                        dispatch(
                            marketingStoreChunk.actions.removeSubscriptionForRestoreCustom({
                                subscriptionForRestore: {
                                    productId: currentService.productId,
                                    dateEndAccess: currentService.dateAccess,
                                    planName,
                                },
                            }),
                        )
                    }
                })
            }
        } catch (error) {
            Sentry.sendMessage('checkCancelSubscriptionThunk', error)
        }
    }

const checkStatusSubscriptionThunk: TThunkAction<{
    subscriptionForRestore: TSubscriptionForRestore
}> =
    ({ subscriptionForRestore }) =>
    async dispatch => {
        try {
            if (!subscriptionForRestore) return

            const responseJSON = await accessRightsService()
            const rights = convertToAccessRights(responseJSON)
            const {
                productId,
                sourceRestore = 'store-settings',
                dateEndAccess,
                planName,
            } = subscriptionForRestore

            if (rights && productId) {
                const currentService = rights.find(
                    el =>
                        el.serviceName ===
                        {
                            pro: billingHelpers.getAccessRightsByPlatform(),
                            offScores: billingHelpers.getAccessPlusRightsByPlatform(),
                            learning: billingHelpers.getAccessLearningRightsByPlatform(),
                            learningLite: billingHelpers.getAccessLearningLiteRightsByPlatform(),
                            ebook: billingHelpers.getAccessEbookRightsByPlatform(),
                        }[planName],
                )
                if (currentService) {
                    if (currentService.autoRenew === 1) {
                        reportEvent(MetricaEvents.BILLING_RESTORE_PURCHASE, {
                            funnel_source: sourceRestore,
                        })
                        dispatch(
                            marketingStoreChunk.actions.removeSubscriptionForRestoreCustom({
                                subscriptionForRestore,
                            }),
                        )
                        setTimeout(() => {
                            showAlertNotification({
                                title: translate(
                                    'native.marketing_text.auto_renewal_restored_success',
                                ),
                                expiresIn: 4000,
                            })
                        }, 1000)
                    }
                    if (currentService.autoRenew === 0) {
                        reportEvent(MetricaEvents.BILLING_RESTORE_PURCHASE_FAIL, {
                            funnel_source: sourceRestore,
                        })

                        dispatch(
                            marketingStoreChunk.actions.updateSubscriptionForRestoreCustom({
                                productId,
                                dateEndAccess,
                                planName,
                                sourceRestore: '',
                            }),
                        )
                        if (sourceRestore) {
                            setTimeout(() => {
                                showAlertNotification({
                                    title: translate(
                                        'native.marketing_text.auto_renewal_restored_failure',
                                    ),
                                    expiresIn: 4000,
                                })
                            }, 1000)
                        }
                    }
                }
            }
        } catch (error) {
            Sentry.sendMessage('checkStatusSubscriptionThunk', error)
        }
    }

const restorePurchases: TThunkAction<{ callback?: () => void }> =
    ({ callback = () => null }) =>
    async (dispatch, getState) => {
        try {
            await ensureNetwork()
            dispatch(marketingStoreChunk.actions.setIsRestoreProcessing(true))
            const restoredPurchases = await withIapConnection(() =>
                getAvailablePurchases({
                    alsoPublishToEventListenerIOS: true,
                }),
            )
            const restoredSubscriptionPurchase = restoredPurchases.filter(item =>
                marketingConstants.listOfSubscriptions.includes(item.productId),
            )
            const state = getState()

            const isPro = marketingStoreChunk.props.getIsPro(state)
            const isOffScores = marketingStoreChunk.props.getIsOffScores(state)
            const isCourses = marketingStoreChunk.props.getIsCourses(state)
            const isEbookRights = marketingStoreChunk.props.getIsEbookRights(state)
            const isLearnLite = marketingStoreChunk.props.getIsLearningLite(state)
            const isNotHaveRights =
                !isPro && !isOffScores && !isCourses && !isEbookRights && !isLearnLite

            if (!restoredSubscriptionPurchase?.length) {
                Alert.alert(
                    isNotHaveRights
                        ? translate('native.marketing_text.restore_purchase_message_negative', {
                              store: platform.isIos ? 'AppStore' : 'Google Play',
                          })
                        : translate('native.marketing_text.restore_purchase_message_has_rights'),
                    isNotHaveRights
                        ? ''
                        : translate(
                              'native.marketing_text.restore_purchase_message_has_rights_sub_title',
                          ),
                    [{ text: translate('native.actions.okay') }],
                    { cancelable: false },
                )
                return
            }
            const purchase = restoredSubscriptionPurchase[0] as PurchaseAndroid
            const responseRights = platform.isAndroid
                ? await registerSingleReceiptAndroidService({
                      purchase: purchase.dataAndroid as string,
                      purchase_signature: purchase.signatureAndroid as string,
                      source: sources.restore,
                  })
                : await registerSingleReceiptIosService({
                      bodyObject: {
                          transaction_id: purchase.transactionId,
                          source: sources.restore,
                      },
                  })

            if (!validateServiceJSON(responseRights)) {
                Alert.alert(
                    translate('native.marketing_text.restore_purchase_message_negative', {
                        store: platform.isIos ? 'AppStore' : 'Google Play',
                    }),
                    '',
                    [{ text: translate('native.actions.okay'), onPress: () => callback?.() }],
                    { cancelable: false },
                )
                return
            }

            const rights = convertToAccessRights(responseRights)

            if (rights) dispatch(saveAllAccessRightsToStoreThunk({ rights }))
            reportEvent(MetricaEvents.BILLING_RESTORE_PURCHASE, {
                funnel_source: sources.restore,
            })
            showAlertNotification({
                title: translate('native.screen_profile.finished_restore'),
                expiresIn: 3000,
            })
        } catch (error) {
            Alert.alert(
                (error as Response)?.status === 403
                    ? translate('native.marketing_text.restore_purchase_message_negative', {
                          store: platform.isIos ? 'AppStore' : 'Google Play',
                      })
                    : translate('native.marketing_text.restore_purchase_message_error'),
                '',
                [{ text: translate('native.actions.okay'), onPress: () => callback?.() }],
                { cancelable: false },
            )
        } finally {
            dispatch(marketingStoreChunk.actions.setIsRestoreProcessing(false))
        }
    }

const buyScoreByCreditThunk: TThunkAction<{
    scoreId: string | number
    callback?: () => Promise<void> | void
}> =
    ({ scoreId, callback }) =>
    async dispatch => {
        try {
            dispatch(marketingStoreChunk.actions.setIsPaymentInProgress(true))
            if (scoreId) await buyScoreByCredit({ score_id: scoreId })
            await dispatch(marketingThunks.loadUserBalance())
            if (callback) await callback()
        } catch (error) {
            reportEvent('buyScore error', { error: String(error) })
        } finally {
            dispatch(marketingStoreChunk.actions.setIsPaymentInProgress(false))
        }
    }

const buyCourseByCreditThunk: TThunkAction<{ courseId: string; callback?: () => void }> =
    ({ courseId, callback }) =>
    async () => {
        try {
            if (courseId) {
                await buyCourseByCredit({ course_id: courseId })
            }
        } catch (error) {
            Alert.alert(translate('native.marketing.something_went_wrong_try_again'))
            reportEvent('buyCourse error', { error: String(error) })
        } finally {
            if (callback) callback()
        }
    }

const buyEbookByCreditThunk: TThunkAction<{ ebookId: string; callback?: () => void }> =
    ({ ebookId, callback }) =>
    async dispatch => {
        try {
            if (ebookId) {
                await buyEbookByCredit({ ebook_id: ebookId })
                await dispatch(marketingThunks.loadUserBalance())
            }
        } catch (error) {
            Alert.alert(translate('native.marketing.something_went_wrong_try_again'))
        } finally {
            callback?.()
        }
    }

// Installation and advertising statistics are no longer collected.
const registerInstallEvent: TThunkAction = () => async () => {}

const getScoreDataForPurchase: () => Promise<{ id: string }> = async () => {
    try {
        const scoreData = await getInAppForSale()

        return { id: scoreData.content_id }
    } catch (e) {
        return { id: '' }
    }
}

const handleSubscriptionThunk: TThunkAction<{
    currentPurchase: Purchase
    isCheckoutRecovery?: boolean
}> =
    ({ currentPurchase, isCheckoutRecovery = false }) =>
    async (dispatch, getState) => {
        const currentState = getState()
        const isHandleProductProgress =
            marketingStoreChunk.props.getIsHandleProductProgress(currentState)

        if (isHandleProductProgress) return

        let isSuccessPurchase = false
        const isRenewal =
            'transactionReasonIOS' in currentPurchase &&
            currentPurchase.transactionReasonIOS === 'RENEWAL'
        // Payment Success must only count purchases the user went through checkout for:
        // the store also delivers renewals and unfinished transactions right after
        // launch (e.g. after a reinstall), before any paywall was shown.
        const isCheckoutPurchase =
            !isRenewal &&
            (isCheckoutRecovery ||
                marketingStoreChunk.props.getCheckoutProductId(currentState) ===
                    currentPurchase.productId)

        try {
            if (platform.isIos && !currentPurchase?.transactionId) {
                throw new Error('Error while purchasing')
            }

            dispatch(
                marketingStoreChunk.actions.setPartialFieldsCustom({
                    isPaymentInProgress: true,
                    isHandleProductProgress: true,
                }),
            )

            const currentSource = marketingStorage.get('sourceSubscription') as TSources

            const storeSource = marketingStoreChunk.props.getSource(currentState)
            const source = storeSource || currentSource

            const { productId } = currentPurchase

            // страховка от обрыва сети: пока бэк не подтвердил чек и транзакция
            // не завершена — держим в сторадже, далее проверка в processPendingPurchaseThunk
            marketingStorage.set('pendingPurchase', {
                productId,
                transactionId: (currentPurchase?.transactionId as string) || '',
                isCheckout: isCheckoutPurchase,
            })

            const isPro = marketingStoreChunk.props.getIsPro(currentState)
            const currentSubscriptionProductId =
                marketingStoreChunk.props.getCurrentSubscriptionProductId(currentState)

            const { typeUpgrade } = getCurrentUpgradeMode({
                isPro,
                currentSubscriptionId: currentSubscriptionProductId,
            })

            const isUpgradeMode = typeUpgrade === 'ios-upgrade' || typeUpgrade === 'android-upgrade'

            let inAppForSale = (marketingStoreChunk.props.getInAppForSale(currentState) ||
                marketingStorage.get('scoreForSale')) as TInAppForSale

            if (marketingConstants.listPieceSaleInApps.includes(productId) && !inAppForSale) {
                const scoreData = await getScoreDataForPurchase()
                inAppForSale = { id: scoreData.id }
            }

            const currentSubscriptionInfo = marketingStoreChunk.props
                .getSubscriptions(currentState)
                .find(({ id }) => id === currentPurchase.productId)

            const currentInAppId = marketingConstants.listPieceSaleInApps.includes(productId)
                ? inAppForSale?.id
                : undefined

            if (!currentInAppId && marketingConstants.listPieceSaleInApps.includes(productId)) {
                showAlertNotification({
                    title: translate('native.marketing.purchase_content_error'),
                    expiresIn: 5000,
                })

                return
            }

            for (let attempt = 0; ; attempt++) {
                try {
                    await dispatch(
                        registerSingleReceiptThunk({
                            purchase: currentPurchase,
                            source,
                            productId,
                            isUpgradeMode,
                            inAppForSale,
                        }),
                    )
                    break
                } catch (error) {
                    const delayMs = receiptRetryDelaysMs[attempt]

                    if (!isNetworkError(error) || !delayMs) throw error

                    reportEvent(RT_EVENTS.BILLING_RECEIPT_NETWORK_RETRY, {
                        value: attempt + 1,
                        productId,
                    })
                    await wait(delayMs)
                }
            }
            if (marketingConstants.creditsPack.includes(productId) && currentInAppId) {
                await dispatch(buyScoreByCreditThunk({ scoreId: currentInAppId }))
            }
            // score lists keep the stale isPurchased until they are refetched
            if (currentInAppId) {
                dispatch(marketingStoreChunk.actions.setPurchasedScoreIdsCustom(currentInAppId))
            }
            dispatch(marketingThunks.loadUserBalance())

            // The receipt is registered and access is already granted by now, so a
            // failure here is not a purchase failure and must not reach the catch
            // below. Keep the pending record: processPendingPurchaseThunk retries
            // the unfinished transaction on the next launch (MUP-14274).
            try {
                await withIapConnection(() =>
                    finishTransaction({
                        purchase: currentPurchase,
                        isConsumable: marketingConstants.listInApps.includes(productId),
                    }),
                )

                marketingStorage.delete('pendingPurchase')

                const billingParams =
                    !!currentSubscriptionInfo &&
                    subscriptionsRtHelpers.getRtBillingParams(currentSubscriptionInfo)
                const subscriptionPurchase =
                    subscriptionsRtHelpers.getSubscriptionPurchaseByProductId(productId)

                if (isCheckoutPurchase) {
                    dispatch(marketingStoreChunk.actions.setCheckoutProductId(''))

                    reportEvent(MetricaEvents.PAYMENT_SUCCESS, {
                        productId,
                        subscription_purchase: subscriptionPurchase,
                        ...(source
                            ? subscriptionsRtHelpers.getRtParamsBySource({
                                  source,
                                  isUpgradeMode,
                                  isPieceSale: !!currentInAppId,
                              })
                            : {}),
                        funnel_source: source,
                        screen: 'ProGreat',
                        ...billingParams,
                    })
                } else {
                    reportEvent(MetricaEvents.PAYMENT_RESTORED_TRANSACTION, {
                        productId,
                        subscription_purchase: subscriptionPurchase,
                        value: isRenewal ? 'renewal' : 'unfinished',
                        ...billingParams,
                    })
                }

                isSuccessPurchase = true
            } catch (error) {
                Sentry.sendMessage('finishTransaction', error)
            }
        } catch (error: any) {
            showAlertNotification({
                title: isNetworkError(error)
                    ? translate('native.marketing.payment_received_offline')
                    : `${translate('native.marketing.purchase_error')}${
                          typeof error?.message === 'string'
                              ? `, ${error.message.toLowerCase()}`
                              : ''
                      }${error?.code ? ` code - ${error?.code}` : ''}`,
                expiresIn: 10000,
                actionTitle: translate('native.actions.retry'),
                action: () => {
                    dispatch(handleSubscriptionThunk({ currentPurchase }))
                },
            })

            try {
                reportEvent(MetricaEvents.BILLING_PURCHASE_API_ERROR, {
                    value:
                        typeof error?.message === 'string'
                            ? `${error.message.toLowerCase()}`
                            : JSON.stringify(error),
                })
            } catch (e) {
                console.error('Error parsed handle subscription error')
            }
        } finally {
            dispatch(
                marketingStoreChunk.actions.setPartialFieldsCustom({
                    isPaymentInProgress: false,
                    isHandleProductProgress: false,
                    isShowRestoreBanner: false,
                }),
            )

            if (
                isSuccessPurchase &&
                !isRenewal &&
                authStoreChunk.props.getIsModalInTour(getState())
            ) {
                dispatch(marketingStoreChunk.actions.setIsPurchasedInTour(true))
            }

            dispatch(marketingThunks.invokeClosePaymentModalCallbackThunk())

            if (isSuccessPurchase && !isRenewal) {
                dispatch(marketingStoreChunk.actions.setProductId(currentPurchase.productId))
                await dispatch(
                    marketingThunks.openPurchaseSuccessScreenThunk({
                        productId: currentPurchase.productId,
                    }),
                )
            }
        }
    }

const requestProductPurchase: TThunkAction<{
    subscription: TSubscription | TProductInApp | TProduct
    purchaseTokenAndroid?: string
    isOfferPersonalized: boolean
}> =
    ({ subscription, purchaseTokenAndroid, isOfferPersonalized }) =>
    async (dispatch, getState) => {
        try {
            const currentState = getState()
            const paymentAccountId = marketingStoreChunk.props.getPaymentAccountId(currentState)
            const appAccountToken = marketingStoreChunk.props.getAppAccountToken(currentState)

            if (marketingConstants.listInApps.includes(subscription.id)) {
                await withIapConnection(() =>
                    requestPurchase({
                        request: {
                            ios: {
                                sku: subscription?.id,
                                appAccountToken,
                                quantity: 1,
                            },
                            android: {
                                skus: [subscription?.id],
                                obfuscatedAccountId: paymentAccountId.toString(),
                            },
                        },
                        type: 'in-app',
                    }),
                )
            } else {
                const offers =
                    'subscriptionOfferDetails' in subscription
                        ? subscription?.subscriptionOfferDetails
                        : ''
                await withIapConnection(() =>
                    requestPurchase({
                        request: {
                            ios: {
                                sku: subscription.id,
                                appAccountToken,
                            },
                            android: {
                                skus: [subscription.id],
                                isOfferPersonalized,
                                ...(offers ? { subscriptionOffers: offers } : {}),
                                obfuscatedAccountId: paymentAccountId.toString(),
                                ...(purchaseTokenAndroid
                                    ? {
                                          purchaseToken: purchaseTokenAndroid,
                                          replacementMode: 2,
                                      }
                                    : {}),
                            },
                        },
                        type: 'subs',
                    }),
                )
            }
        } catch (error) {
            dispatch(
                marketingStoreChunk.actions.setPartialFieldsCustom({
                    isPaymentInProgress: false,
                    checkoutProductId: '',
                }),
            )
        }
    }

const requestPurchaseThunk: TThunkAction<{
    subscription: TSubscription | TProductInApp | TProduct
    source: TSources
    callback: () => void
    purchaseTokenAndroid?: string
    isOfferPersonalized?: boolean
}> =
    ({ subscription, source, callback, purchaseTokenAndroid, isOfferPersonalized = false }) =>
    async dispatch => {
        try {
            if (!subscription) return

            await ensureNetwork()

            const { id: productId, price, currency } = subscription
            dispatch(
                marketingStoreChunk.actions.setPartialFieldsCustom({
                    productId,
                    checkoutProductId: productId,
                    closeCallback: callback,
                    isPaymentInProgress: true,
                    source,
                }),
            )

            marketingStorage.set('sourceSubscription', source)
            marketingStorage.set('inAppDetails', {
                price: `${price}`,
                currency,
            })

            if (marketingConstants.listPieceSaleInApps.includes(productId)) {
                const scoreData = marketingStorage.get('scoreForSale')
                if (scoreData) {
                    await saveInAppForSale({
                        content_id: scoreData.id,
                        content_type: getContentTypeByProductId(productId),
                        device_id: device.uniqueId,
                    })
                }
                if (!scoreData) {
                    reportEvent(RT_EVENTS.MISSING_SCORE_FOR_SALE_DATA, {
                        funnel_source: source,
                        productId,
                    })
                }
            }

            await dispatch(
                requestProductPurchase({
                    subscription,
                    purchaseTokenAndroid,
                    isOfferPersonalized,
                }),
            )
        } catch (error) {
            dispatch(marketingStoreChunk.actions.setIsPaymentInProgress(false))
            reportEvent('Request Purchase thunk error', { error: String(error) })
        }
    }

const processPendingPurchaseThunk: TThunkAction = () => async (dispatch, getState) => {
    try {
        const pendingPurchase = marketingStorage.get('pendingPurchase')
        if (!pendingPurchase) return
        if (!checkConnectionSafely()) return
        if (marketingStoreChunk.props.getIsHandleProductProgress(getState())) return

        const availablePurchases = await withIapConnection(() =>
            getAvailablePurchases({ alsoPublishToEventListenerIOS: false }),
        )
        const currentPurchase =
            availablePurchases.find(
                ({ transactionId }) =>
                    !!pendingPurchase.transactionId &&
                    transactionId === pendingPurchase.transactionId,
            ) || availablePurchases.find(({ productId }) => productId === pendingPurchase.productId)

        if (!currentPurchase) {
            marketingStorage.delete('pendingPurchase')
            return
        }

        reportEvent(RT_EVENTS.BILLING_PENDING_RECEIPT_RECOVERY, {
            productId: pendingPurchase.productId,
        })
        await dispatch(
            handleSubscriptionThunk({
                currentPurchase,
                isCheckoutRecovery: !!pendingPurchase.isCheckout,
            }),
        )
    } catch (error) {
        reportEvent(RT_EVENTS.BILLING_PENDING_PURCHASE_ERROR, { error: String(error) })
    }
}

const checkIntroductoryOffersIos: TThunkAction = () => async dispatch => {
    try {
        // One gate around the batch: four parallel calls on a cold connection
        // would otherwise each try to reconnect.
        const [isProGroup, isLearnGroup, isEbookGroup, isOneGroup] = await withIapConnection(() =>
            Promise.all([
                isEligibleForIntroOfferIOS(marketingConstants.proGroupId),
                isEligibleForIntroOfferIOS(marketingConstants.learnGroupId),
                isEligibleForIntroOfferIOS(marketingConstants.ebookGroupId),
                isEligibleForIntroOfferIOS(marketingConstants.oneGroupId),
            ]),
        )

        dispatch(
            marketingStoreChunk.actions.setPartialFieldsCustom({
                introductoryOfferData: {
                    isPro: isProGroup,
                    isLearn: isLearnGroup,
                    isEbook: isEbookGroup,
                    isOne: isOneGroup,
                },
                isHadProAccess: !isProGroup,
                isHadProAccessOffScores: !isProGroup,
                isHadProAccessCourses: !isLearnGroup,
                isHadProAccessEbook: !isEbookGroup,
            }),
        )
    } catch (error) {
        handleError(error)
    }
}

const checkStoreRegion: TThunkAction = () => async dispatch => {
    try {
        const storeName = await withIapConnection(() => getStorefront())

        dispatch(
            marketingStoreChunk.actions.setIsUsaStore(storeName === 'USA' || storeName === 'US'),
        )
    } catch (error) {
        console.error('@@---->error check region', error)
    }
}

export const billingThunks = {
    requestPurchaseThunk,
    registerSingleReceiptThunk,
    getAllAccessRightsThunk,
    processPendingPurchaseThunk,
    restorePurchases,
    registerInstallEvent,
    handleSubscriptionThunk,
    buyScoreByCreditThunk,
    buyCourseByCreditThunk,
    buyEbookByCreditThunk,
    checkCancelSubscriptionThunk,
    checkStatusSubscriptionThunk,
    checkStoreRegion,
}
