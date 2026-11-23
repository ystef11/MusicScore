import { dismissFittedPresented } from 'react-native-sheet2'

import { analyticsStoreChunk } from '@mu-native/analytics'
import { handleError } from '@mu-native/api'
import { authStoreChunk } from '@mu-native/auth'
import { platform, TThunkAction } from '@mu-native/common'
import { mainAppScreens, NavigationService, Screen } from '@mu-native/navigation'

import MetricaEvents from '../../../App/constants/MetricaEvents'
import { MSScoreT } from '../../../App/Model/MSScore'
import reportEvent from '../../../App/Utils/Analytics'
import { marketingConstants, sources, typeOfStart } from '../constants/marketingConstants'
import { checkPurchaseSuccessScreenExpThunk } from '../experiments/purchaseSuccessScreenExp/purchaseSuccessScreenExp.ts'
import {
    dynamicContentFieldService,
    freeGiftCreditService,
    purchaseTokenAndroidService,
    userBalanceCreditService,
} from '../services/marketingServices'
import { type TProductId, TSources } from '../types/marketingTypes.ts'

import { marketingStoreChunk } from './marketingStoreChunk'

// Keep any cached payment account; do not register the device with the analytics tracker.
export const loadPaymentAccountId: TThunkAction = () => async () => {}

const loadAndroidPurchaseTokenThunk: TThunkAction = () => async dispatch => {
    try {
        const response = await purchaseTokenAndroidService()
        // @ts-ignore
        dispatch(marketingStoreChunk.actions.setPurchaseTokenAndroidInfo(response))
    } catch (error) {
        handleError(error)
    }
}

const invokeClosePaymentModalCallbackThunk: TThunkAction = () => async (dispatch, getState) => {
    const closeCallback = marketingStoreChunk.props.getCloseCallback(getState())

    if (closeCallback) {
        closeCallback()
        dispatch(marketingStoreChunk.actions.setCloseCallback(null))
    }
}

const openReturnSplashThunk: TThunkAction = () => dispatch => {
    dispatch(marketingStoreChunk.actions.setSource(marketingConstants.sources.splashReturnOffer))
    dispatch(marketingStoreChunk.actions.setReturnSplashCountShowCustom({}))

    NavigationService.navigate('App', {
        screen: Screen.returnSplash,
    })
}

const openSplashSaleThunk: TThunkAction = () => async dispatch => {
    const currentDate = new Date().getTime()

    dispatch(marketingStoreChunk.actions.setFlashSaleCountCustom({}))
    dispatch(
        marketingStoreChunk.actions.setPartialFieldsCustom({
            timerSaleStart: currentDate,
            timerSaleLashShown: currentDate,
            timerSaleDate: new Date(2022, 1, 1, 23, 59, 59, 59),
            source: sources.splashFlashSale,
        }),
    )

    NavigationService.navigate(Screen.flashSplash, {
        planName: 'learn',
    })
}

const loadDynamicFieldContentCount: TThunkAction = () => async dispatch => {
    try {
        const contentData = await dynamicContentFieldService()

        if (contentData) {
            dispatch(
                marketingStoreChunk.actions.setContentFields({
                    coursesCount: Math.floor(contentData?.courses_all || 0),
                    offScoresCount: contentData?.scores_official,
                    scoresNew: contentData?.scores_new,
                    scoresAll: (
                        (contentData?.scores_all || marketingConstants.defaultScoresNumber) /
                        1000000
                    )?.toFixed(1),
                    ebookAll: contentData?.ebook_all,
                }),
            )
        }
    } catch (error) {
        handleError(error)
    }
}

const loadUserBalance: TThunkAction = () => async (dispatch, getState) => {
    try {
        const user = analyticsStoreChunk.props.getProfile(getState())

        if (!user?.userId) return

        const balance = await userBalanceCreditService({ user_id: user.userId })

        dispatch(
            marketingStoreChunk.actions.setPartialFieldsCustom({
                creditBalance: balance?.credits_amount ?? 0,
                courseBalance: balance?.course_credits_abonement ?? 0,
                ebookBalance: balance?.ebook_credits_amount ?? 0,
            }),
        )
    } catch (error) {
        handleError(error)
    }
}

const checkToShowRestoreSplashThunk: TThunkAction = () => (_, getState) => {
    try {
        const subscriptionForRestore =
            marketingStoreChunk.props.getSubscriptionsForRestore(getState())
        if (subscriptionForRestore.length === 0) return
        NavigationService.navigate(mainAppScreens.restoreOfferScreen)
    } catch (error) {
        handleError(error)
    }
}

const checkOpenScoreForSaleThunk: TThunkAction<{
    ui: string
    score: MSScoreT
    callbackAfterCheck: () => void
}> =
    ({ ui, score, callbackAfterCheck }) =>
    (dispatch, getState) => {
        try {
            const state = getState()
            const isOffScores = marketingStoreChunk.props.getIsOffScores(state)
            const isPurchased =
                score?.isPurchased ||
                marketingStoreChunk.props.getPurchasedScoreIds(state).includes(String(score?.id))
            if (!isOffScores && score?.isOfficial && !isPurchased) {
                reportEvent(MetricaEvents.SCORE_OFFICIAL_SCORE_LANDING_SHOW, {
                    ui,
                })
                const scorePrice =
                    score.isPdf && !!score?.billing?.price && score?.billing?.price <= 999 // only pdf scores are on sale for less than $9.99 (999 cents)
                        ? score?.billing?.price
                        : undefined

                dispatch(
                    marketingStoreChunk.actions.setPartialFieldsCustom({
                        inAppForSale: {
                            id: score.id,
                            title: score.title,
                            price: scorePrice,
                        },
                        source: sources.offScoresLanding,
                    }),
                )

                NavigationService.navigate(Screen.screenLongLanding, {
                    planName: 'offScores',
                    inAppItem:
                        !!score?.billing?.price && score?.billing?.price >= 1400
                            ? null
                            : {
                                  id: score.id,
                                  title: score.title,
                                  price: scorePrice,
                                  largePreviewUrl: score.largePreviewUrl,
                              },
                    score:
                        !!score?.billing?.price && score?.billing?.price >= 1400
                            ? null
                            : {
                                  id: score.id,
                                  title: score.title,
                                  price: scorePrice,
                                  largePreviewUrl: score.largePreviewUrl,
                              },
                    isOfficialScore: true,
                    funnelStartAction: 'official score',
                })
                return
            }

            callbackAfterCheck()
        } catch (error) {
            handleError(error)
        }
    }

const checkStartMode: TThunkAction = () => (dispatch, getState) => {
    try {
        const { buildNumber: currentBuildNumber } = platform
        dispatch(marketingStoreChunk.actions.setStartMode(typeOfStart.GENERAL))

        dispatch(marketingStoreChunk.actions.setBuildNumber(currentBuildNumber))
    } catch (error) {
        handleError(error)
    }
}

const checkIsProLogicThunk: TThunkAction<{
    source: TSources
    featureText: string
    callbackAfterCheck: () => void
}> =
    ({ source, featureText, callbackAfterCheck }) =>
    (dispatch, getState) => {
        try {
            const isPro = marketingStoreChunk.props.getIsPro(getState())
            if (isPro) {
                callbackAfterCheck()
                return
            }

            dispatch(
                marketingStoreChunk.actions.setPartialFieldsCustom({
                    featureText,
                    source,
                }),
            )
            dismissFittedPresented()
            NavigationService.navigate(Screen.screenLongLanding)
        } catch (error) {
            handleError(error)
        }
    }

const checkIsProPlusLogicThunk: TThunkAction<{
    source: TSources
    callbackAfterCheck: () => void
}> =
    ({ source, callbackAfterCheck }) =>
    (dispatch, getState) => {
        try {
            const isOffScores = marketingStoreChunk.props.getIsOffScores(getState())
            if (isOffScores) {
                callbackAfterCheck()
                return
            }

            dispatch(marketingStoreChunk.actions.setSource(source))
            dismissFittedPresented()
            NavigationService.navigate(Screen.screenLongLanding, {
                isOfficialScore: true,
            })
        } catch (error) {
            handleError(error)
        }
    }

const getFreeGiftCreditThunk: TThunkAction<{ type: number }> =
    ({ type }) =>
    async dispatch => {
        try {
            await freeGiftCreditService(type)
            await dispatch(loadUserBalance())
        } catch (error) {
            handleError(error)
        }
    }

const openSplashSaleOffScoresThunk: TThunkAction = () => async dispatch => {
    const currentDate = new Date().getTime()

    dispatch(marketingStoreChunk.actions.setFlashSaleCountOffScoresCustom({}))
    dispatch(
        marketingStoreChunk.actions.setPartialFieldsCustom({
            timerSaleStartOffScores: currentDate,
            timerSaleLashShownOffScores: currentDate,
            timerSaleDateOffScores: new Date(2026, 1, 1, 23, 59, 59, 59),
            source: sources.splashFlashSaleOffScores,
        }),
    )

    NavigationService.navigate(Screen.flashSplash, {
        planName: 'offScores',
    })
}

const openPurchaseSuccessScreenThunk: TThunkAction<{ productId: TProductId }> =
    ({ productId }) =>
    async (dispatch, getState) => {
        const isModalInTour = authStoreChunk.props.getIsModalInTour(getState())

        if (isModalInTour || marketingConstants.listInApps.includes(productId)) return

        const isShowPurchaseSuccessScreen = await dispatch(checkPurchaseSuccessScreenExpThunk())

        if (isShowPurchaseSuccessScreen) NavigationService.navigate(Screen.purchaseSuccess)
    }

export const marketingThunks = {
    loadPaymentAccountId,
    loadAndroidPurchaseTokenThunk,
    invokeClosePaymentModalCallbackThunk,
    openReturnSplashThunk,
    openSplashSaleThunk,
    loadDynamicFieldContentCount,
    loadUserBalance,
    checkToShowRestoreSplashThunk,
    checkOpenScoreForSaleThunk,
    checkStartMode,
    checkIsProLogicThunk,
    getFreeGiftCreditThunk,
    checkIsProPlusLogicThunk,
    openSplashSaleOffScoresThunk,
    openPurchaseSuccessScreenThunk,
}
