import { useCallback, useEffect, useState } from 'react'

import { platform } from '@mu-native/common'
import { RootViewScreenComponent } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { marketingConstants, marketingStoreChunk } from '@mu-native/marketing'
import { Screen, useAppNavigation } from '@mu-native/navigation'
import {
    getTourQuizDataThunk,
    loadTourAnswerThunk,
    QuizApiData,
    quizStoreChunk,
} from '@mu-native/quiz'
import { Orientation } from '@mu-native/system'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../../../../App/constants/MetricaEvents'
import {
    requestReviewApp,
    RequestReviewAppSources,
} from '../../../../../App/ReviewApp/ReviewAppController'
import reportEvent from '../../../../../App/Utils/Analytics'
import { quizName, reportTourUpdateStep, TourUpdateSteps } from '../constants/tourUpdateConstants'

import TourStepComponent from './components/TourFirstStepComponent'
import TourRateAppStep from './components/TourRateAppStep'
import TourUpdateBottomElement from './components/TourUpdateBottomElement'
import { PersonalAnimationComponent } from './components/TourUpdatePersonalizationComponent'
import { TourSocialProofContainer } from './containers/TourSocialProofContainer.tsx'
import TourUpdatePaymentContainer from './containers/TourUpdatePaymentContainer'
import { TourQuizWrapperContainer } from './containers/TourUpdateQuizWrapper'

export const ScreenTourUpdate = () => {
    const { navigate } = useAppNavigation()
    const actions = useActions({
        setTourUpdateId: marketingStoreChunk.actions.setTourUpdateId,
        getTourQuizDataThunk,
        setQuizStepCustom: quizStoreChunk.actions.setQuizStepCustom,
        setIsNeedToUpdateAnswers: quizStoreChunk.actions.setIsNeedToUpdateAnswers,
        resetState: quizStoreChunk.actions.resetState,
        loadTourAnswerThunk,
    })
    const [isPremium, isPro, isLearn, isOffScores, quizStep, quizAnalyticsQuestions] = useValues([
        marketingStoreChunk.props.getIsPremiumRights,
        marketingStoreChunk.props.getIsPro,
        marketingStoreChunk.props.getIsCourses,
        marketingStoreChunk.props.getIsOffScores,
        quizStoreChunk.props.getQuizStep,
        quizStoreChunk.props.getQuizAnalyticsQuestions,
    ])
    const [step, setStep] = useState(TourUpdateSteps.FIRST_STEP)

    useEffect(() => {
        actions.setTourUpdateId(marketingConstants.tourId)

        if (platform.isTablet) Orientation.lockToPortrait()

        actions.setIsNeedToUpdateAnswers(false)
        setTimeout(() => {
            actions.resetState()
            actions.getTourQuizDataThunk({ quizId: QuizApiData.tourUpdateQuiz })
        }, 500)

        reportEvent(MetricaEvents.TOUR_UPDATE_START, {
            value: TourUpdateSteps.FIRST_STEP,
            funnel_source: quizName,
        })
        reportTourUpdateStep('start')

        return () => {
            if (platform.isTablet) Orientation.unlockAllOrientations()
        }
    }, [])

    useEffect(() => {
        if (step === TourUpdateSteps.SECOND_STEP && quizAnalyticsQuestions[quizStep]) {
            reportTourUpdateStep(`quiz_${quizAnalyticsQuestions[quizStep]}`)
        }
    }, [step, quizStep])

    const onClose = () => {
        reportEvent(MetricaEvents.TOUR_UPDATE_END, {
            funnel_source: quizName,
        })
        actions.resetState()
        actions.loadTourAnswerThunk()
        navigate(Screen.start)
    }

    const onRateApp = () => {
        reportEvent(MetricaEvents.TOUR_UPDATE_RATING_CLICK, {
            value: step,
            funnel_source: quizName,
        })
        requestReviewApp(RequestReviewAppSources.TOUR_UPDATE, () => {
            reportEvent(MetricaEvents.TOUR_UPDATE_RATING, {
                value: step,
                funnel_source: quizName,
            })
        })
        onClose()
    }

    const goNext = useCallback(() => {
        setStep(prevStep => prevStep + 1)
    }, [])

    const onPressNextStep = useCallback(() => {
        setStep(prevStep => {
            if (isOffScores || isLearn || isPro || isPremium) {
                if (prevStep === TourUpdateSteps.FIRST_STEP) return TourUpdateSteps.FIFTH_STEP
                if (prevStep === TourUpdateSteps.FIFTH_STEP && isOffScores)
                    return TourUpdateSteps.LAST_STEP
            }
            return prevStep + 1
        })
    }, [isPro, isOffScores, isLearn, isPremium])

    const tourSteps = [
        <TourStepComponent key="1" />,
        <TourQuizWrapperContainer setNextStep={onPressNextStep} key="2" />,
        <TourSocialProofContainer key="3_1" />,
        <PersonalAnimationComponent setNextStep={goNext} key="3" />,
        <TourUpdatePaymentContainer key="5" />,
        <TourUpdatePaymentContainer key="5" isLastStep />,
        <TourRateAppStep key="6" onClose={onClose} />,
    ]

    const isRateApp = step === TourUpdateSteps.LAST_STEP
    const firstStepText =
        step === TourUpdateSteps.FIRST_STEP
            ? translate('native.marketing.tour_update.dive_in')
            : translate('native.screen_new_account.continue')
    return (
        <RootViewScreenComponent>
            {tourSteps[step]}
            {step !== TourUpdateSteps.SECOND_STEP &&
                step !== TourUpdateSteps.FOURTH_STEP &&
                step !== TourUpdateSteps.SIXTH_STEP && (
                    <TourUpdateBottomElement
                        isFirstStep={step === TourUpdateSteps.FIRST_STEP}
                        text={
                            isRateApp
                                ? translate('native.marketing.tour_update.leave_review')
                                : firstStepText
                        }
                        onNextPress={isRateApp ? onRateApp : onPressNextStep}
                        onCloseTour={onClose}
                        isShowCloseTourButton={isRateApp}
                    />
                )}
        </RootViewScreenComponent>
    )
}
