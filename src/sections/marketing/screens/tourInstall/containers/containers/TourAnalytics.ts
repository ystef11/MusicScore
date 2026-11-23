import { memo, useEffect, useRef } from 'react'

import { analyticsStoreChunk } from '@mu-native/analytics'
import { authStoreChunk } from '@mu-native/auth'
import { useDidUpdate } from '@mu-native/common'
import {
    marketingConstants,
    marketingStorage,
    marketingStoreChunk,
    subscriptionsRtHelpers,
} from '@mu-native/marketing'
import { useNavigation } from '@mu-native/navigation'
import { quizHelpers, quizStoreChunk } from '@mu-native/quiz'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../../../App/Utils/Analytics'
import { TOUR_RT_EVENTS } from '../../constants/tourInstall'
import { sendConversionDataAnalytics } from '../../helpers/tourInstallHelpers'
import { tourInstallScreenStoreChunk } from '../../store/tourInstallScreenStoreChunk'
import { onCloseTourThunk } from '../../store/tourInstallThunkActions'
import { TourSteps } from '../../types/tourTypes'

const { getRtParamsBySource } = subscriptionsRtHelpers

const reportTourInstallStep = (step: number) => {
    reportEvent(TOUR_RT_EVENTS[step], {
        ...getRtParamsBySource({ source: marketingConstants.sources.tourInstall }),
    })
}

const TourAnalytics = () => {
    const actions = useActions({
        setIsModalInTour: authStoreChunk.actions.setIsModalInTour,
        setSplashUpdateLaunchDate: marketingStoreChunk.actions.setSplashUpdateLaunchDate,
        setPartialFieldsCustom: marketingStoreChunk.actions.setPartialFieldsCustom,
    })
    const thunkActions = useActions({
        onCloseTourThunk,
    })

    const [
        isPro,
        isOffScores,
        isLearn,
        currentSubscriptionProductId,
        step,
        userName,
        isUpdateMode,
        conversionData,
        isPaymentInProgress,
    ] = useValues([
        marketingStoreChunk.props.getIsPro,
        marketingStoreChunk.props.getIsOffScores,
        marketingStoreChunk.props.getIsCourses,
        marketingStoreChunk.props.getCurrentSubscriptionProductId,
        tourInstallScreenStoreChunk.props.getStep,
        tourInstallScreenStoreChunk.props.getUserName,
        quizStoreChunk.props.getIsUpdateMode,
        analyticsStoreChunk.props.getConversionData,
        marketingStoreChunk.props.getIsPaymentInProgress,
    ])

    const navigation = useNavigation()

    useEffect(() => {
        return navigation.addListener('blur', () => {
            reportEvent(MetricaEvents.TOUR_END, {
                ...getRtParamsBySource({ source: marketingConstants.sources.tourInstall }),
                ...(currentSubscriptionProductId
                    ? {
                          subscription_purchase:
                              subscriptionsRtHelpers.getSubscriptionPurchaseByProductId(
                                  currentSubscriptionProductId,
                              ),
                      }
                    : {}),
                ...quizHelpers.getQuizAnswersRt(),
            })
            actions.setIsModalInTour(false)
        })
    }, [step, userName, currentSubscriptionProductId])

    const isPurchaseStartedRef = useRef(false)

    useEffect(() => {
        if (isPaymentInProgress) isPurchaseStartedRef.current = true
    }, [isPaymentInProgress])

    useDidUpdate(() => {
        const isPaymentScreen = step === TourSteps.PAYMENT_SCREEN

        if (!isPurchaseStartedRef.current && isPro && isOffScores && isLearn && isPaymentScreen) {
            thunkActions.onCloseTourThunk()

            reportEvent(MetricaEvents.LANDING_PLANS_MISS, {
                ...getRtParamsBySource({ source: marketingConstants.sources.tourInstall }),
                subscription_purchase: subscriptionsRtHelpers.getSubscriptionPurchaseByProductId(
                    currentSubscriptionProductId,
                ),
            })
        }
    }, [isPro, isOffScores, isLearn, step])

    useEffect(() => {
        if (step === TourSteps.PAYMENT_SCREEN && !isUpdateMode) {
            actions.setSplashUpdateLaunchDate()
        }
        if (step === TourSteps.FIRST_TOUR_SCREEN) {
            actions.setPartialFieldsCustom({
                source: marketingConstants.sources.tourInstall,
                isPaymentInProgress: false,
            })
            isPurchaseStartedRef.current = false
        }

        reportTourInstallStep(step)
    }, [step])

    useEffect(() => {
        if (conversionData && !marketingStorage.get('tourInstallshown'))
            sendConversionDataAnalytics(conversionData)
    }, [conversionData])

    return null
}

export default memo(TourAnalytics)
