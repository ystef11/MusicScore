import { getExperimentVariation } from '@mu-native/ab'
import { authStoreChunk, authThunks } from '@mu-native/auth'
import { DispatchFun, GetStateFun, globalStorage, platform, TThunkAction } from '@mu-native/common'
import { hubConstants } from '@mu-native/hub-common'
import { translate } from '@mu-native/locale'
import {
    checkPurchaseSuccessScreenExpThunk,
    getIsMonetizationPaidTraffic,
    getTimerLeft,
    marketingConstants,
    marketingStorage,
    marketingStoreChunk,
    openLearnTabAfterTourExp,
    resetToLearnTab,
    subscriptionsRtHelpers,
} from '@mu-native/marketing'
import { NavigationService, Screen } from '@mu-native/navigation'
import { pushNotificationsStoreChunk } from '@mu-native/pushNotifications'
import { quizStoreChunk } from '@mu-native/quiz'

import MetricaEvents from '../../../../../App/constants/MetricaEvents'
import { showAlertNotification } from '../../../../../App/Elements/NewAlertNotifications'
import reportEvent from '../../../../../App/Utils/Analytics'
import Sentry from '../../../../../App/Utils/Sentry'
import { TourSteps } from '../types/tourTypes'

import { tourInstallScreenStoreChunk } from './tourInstallScreenStoreChunk'

export const onCloseTourThunk: TThunkAction =
    () => async (dispatch: DispatchFun, getState: GetStateFun) => {
        try {
            const state = getState()
            const notificationsRequest =
                pushNotificationsStoreChunk.props.getPermissionGranted(state)
            const step = tourInstallScreenStoreChunk.props.getStep(state)
            const isUpdateMode = quizStoreChunk.props.getIsUpdateMode(state)
            const routeName = tourInstallScreenStoreChunk.props.getRouteName(state)
            const isProRights = marketingStoreChunk.props.getIsPro(state)
            const isLearnRights = marketingStoreChunk.props.getIsCourses(state)
            const isTrial = marketingStoreChunk.props.getIsTrial(state)
            const routeSource = tourInstallScreenStoreChunk.props.getRouteSource(state)
            const isPurchasedInTour = marketingStoreChunk.props.getIsPurchasedInTour(state)

            const trialValue = isTrial ? 'trial' : 'instant'

            if (step === TourSteps.PAYMENT_SCREEN)
                reportEvent(MetricaEvents.TOUR_PAYMENT_LAYER_CLOSE, {
                    ...subscriptionsRtHelpers.getRtParamsBySource({
                        source: marketingConstants.sources.tourInstall,
                        isLearnPlan: isProRights,
                    }),
                    ...(routeSource ? { funnel_source: routeSource } : {}),
                    datetime_timer: getTimerLeft(),
                    value: isProRights || isLearnRights ? trialValue : 'none',
                })

            if (
                !isUpdateMode &&
                (isProRights || isLearnRights) &&
                step !== TourSteps.AFTER_SELL_SCREEN &&
                step !== TourSteps.PURCHASE_SUCCESS_SCREEN
            ) {
                dispatch(tourInstallScreenStoreChunk.actions.setStep(TourSteps.AFTER_SELL_SCREEN))
                return
            }

            if (
                !isUpdateMode &&
                isPurchasedInTour &&
                step !== TourSteps.PURCHASE_SUCCESS_SCREEN &&
                (await dispatch(checkPurchaseSuccessScreenExpThunk()))
            ) {
                dispatch(
                    tourInstallScreenStoreChunk.actions.setStep(TourSteps.PURCHASE_SUCCESS_SCREEN),
                )
                return
            }

            dispatch(authStoreChunk.actions.setIsModalInTour(false))
            dispatch(marketingStoreChunk.actions.setIsPurchasedInTour(false))
            dispatch(marketingStoreChunk.actions.setTimerSaleLashShown(Date.now()))
            dispatch(marketingStoreChunk.actions.setTimerSaleLashShownOffScoresCustom())

            marketingStorage.set('tourInstallshown', true)
            globalStorage.set('isDeepLinkEnabled', true)

            const isOpenLearnTabExpInit =
                platform.isIos &&
                !isUpdateMode &&
                isLearnRights &&
                !getIsMonetizationPaidTraffic(state)
            let isOpenLearnTab = false

            if (isOpenLearnTabExpInit) {
                reportEvent(MetricaEvents.USER_EXPERIMENT_PARTICIPATE, {
                    value: openLearnTabAfterTourExp.id,
                })
                isOpenLearnTab = getExperimentVariation(openLearnTabAfterTourExp.id, state) === 2
            }

            if (!isUpdateMode) {
                if (notificationsRequest === null) {
                    NavigationService.replace(Screen.notifications, { isOpenLearnTab })
                } else if (isOpenLearnTab) {
                    resetToLearnTab()
                } else {
                    NavigationService.replace(Screen.app, {
                        index: 0,
                        routes: [{ name: Screen.app }],
                    })
                }
            }

            if (isUpdateMode) {
                if (routeName)
                    NavigationService.reset({
                        index: 0,
                        routes: [
                            {
                                name: Screen.app,
                                params: {
                                    screen: Screen.tabNavigator,
                                    params: {
                                        screen: routeName,
                                        params: {
                                            hub: hubConstants.hubNewForYou,
                                        },
                                    },
                                },
                            },
                        ],
                    })

                setTimeout(() => {
                    showAlertNotification({
                        title: translate('native.preferences.title'),
                        expiresIn: 4000,
                    })
                }, 1000)
            }

            setTimeout(() => {
                dispatch(quizStoreChunk.actions.resetTourStep())
            }, 1000)
        } catch (error) {
            Sentry.sendMessage('onCloseTourThunk', error)
        }
    }

export const onAuthMobWebUserThunk: TThunkAction<{ secret: string }> =
    ({ secret }) =>
    async (dispatch: DispatchFun) => {
        try {
            dispatch(tourInstallScreenStoreChunk.actions.setIsLoadingDeepLinkAuth(true))

            await dispatch(authThunks.onAuthMobWebUserThunk({ secret }))
        } finally {
            dispatch(tourInstallScreenStoreChunk.actions.setIsLoadingDeepLinkAuth(false))
        }
    }
