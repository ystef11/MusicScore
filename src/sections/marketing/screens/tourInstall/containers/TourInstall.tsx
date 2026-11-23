import { memo, useEffect, useMemo } from 'react'
import { StatusBar, View } from 'react-native'

import { authStoreChunk } from '@mu-native/auth'
import { globalStorage, platform } from '@mu-native/common'
import { globalStyles } from '@mu-native/ds'
import {
    marketingConstants,
    marketingStorage,
    marketingStoreChunk,
    useLongLandingTourExperiment,
} from '@mu-native/marketing'
import { getTourQuizDataThunk, quizStoreChunk } from '@mu-native/quiz'
import { useActions, useValues } from '@ug/store'

import { validateButtonTour } from '../helpers/tourInstallHelpers'
import { useHardwareBackPress } from '../hooks/useHardwareBackPress.ts'
import { useQuizLogic } from '../hooks/useQuizLogic.tsx'
import { tourInstallScreenStoreChunk } from '../store/tourInstallScreenStoreChunk'
import { TourSteps } from '../types/tourTypes'

import BackgroundAnimationComponent from './containers/BackgroundComponent'
import { DeepLinkAuthLoaderContainer } from './containers/DeepLinkAuthLoaderContainer.tsx'
import { PersonalAnimationComponent } from './containers/PersonalAnimationComponent.tsx'
import { TourAfterSellContainer } from './containers/TourAfterSellContainer.tsx'
import TourAnalytics from './containers/TourAnalytics'
import { TourBenefitsComponent } from './containers/TourBenefitsComponent.tsx'
import TourBottomComponent from './containers/TourBottomComponent'
import TourCurrentAnswersComponent from './containers/TourCurrentAnswers/TourCurrentAnswersComponent.tsx'
import { TourGreetings } from './containers/TourGreetings.tsx'
import TourInputName from './containers/TourInputName.tsx'
import TourPaymentLayerLastChanceComponent
    from './containers/TourPaymentLayer/containers/TourPaymentLayerLastChanceContainer.tsx'
import { TourLongPaymentLayerContainer } from './containers/TourPaymentLayer/TourLongPaymentLayerContainer.tsx'
import { TourPurchaseSuccessContainer } from './containers/TourPurchaseSuccessContainer.tsx'
import { TourQuizWrapperContainer } from './containers/TourQuizWrapper.tsx'
import { TourSetNotificationComponent } from './containers/TourSetNotificationComponent.tsx'
import TourStartComponent from './containers/TourStartComponent.tsx'
import { TourPaymentLayerComponentOld } from './containers/TourPaymentLayer/TourPaymentLayerComponentOld.tsx'

const TourInstallFunctional = memo(() => {
    const actions = useActions({
        setNextStep: tourInstallScreenStoreChunk.actions.setNextStep,
        setUserName: quizStoreChunk.actions.setUserName,
        setPartialFieldsCustom: tourInstallScreenStoreChunk.actions.setPartialFieldsCustom,
        getTourQuizDataThunk,
        setIsModalInTour: authStoreChunk.actions.setIsModalInTour,
        setIsNeedToUpdateAnswers: quizStoreChunk.actions.setIsNeedToUpdateAnswers,
        setTourUpdateId: marketingStoreChunk.actions.setTourUpdateId,
    })

    const [step, user, userName] = useValues([
        tourInstallScreenStoreChunk.props.getStep,
        authStoreChunk.props.getUser,
        quizStoreChunk.props.getUserName,
    ])

    useEffect(() => {
        if (user?.name) actions.setUserName(user.name)
    }, [user])

    useQuizLogic(step)
    useHardwareBackPress()

    useEffect(() => {
        if (__DEV__) marketingStorage.set('tourInstallshown', false)
        globalStorage.set('isDeepLinkEnabled', false)
        actions.setIsNeedToUpdateAnswers(true)

        if (!marketingStorage.get('tourInstallshown'))
            actions.setTourUpdateId(marketingConstants.tourId)

        const statusBarStackEntry = StatusBar.pushStackEntry({ barStyle: 'dark-content' })
        actions.setIsModalInTour(true)

        return () => {
            StatusBar.popStackEntry(statusBarStackEntry)
        }
    }, [])

    const isPersonalAnimationScreen = step === TourSteps.PERSONAL_ANIMATION_SCREEN
    const isPaymentScreen = step === TourSteps.PAYMENT_SCREEN
    const isSetNotificationScreen = step === TourSteps.SET_NOTIFICATION_SCREEN
    const tourVariantsValidation = validateButtonTour(step, userName)
    const { isLongLandingTour } = useLongLandingTourExperiment(isPaymentScreen)

    const isButtonNextShowing =
        (step < TourSteps.PERSONAL_ANIMATION_SCREEN &&
            step !== TourSteps.QUIZ_STEP &&
            step === TourSteps.GREETINGS_SCREEN) ||
        (step === TourSteps.NAME_INPUT_SCREEN && platform.isIos)

    const tourSteps = useMemo(
        () => [
            <TourStartComponent key="1" />,
            <TourInputName key="2" />,
            <TourGreetings key="3" />,
            <TourQuizWrapperContainer key="4" />,
            <PersonalAnimationComponent key="7" />,
            <TourSetNotificationComponent key="8" />,
            platform.isIos && !isLongLandingTour ? (
                <TourPaymentLayerComponentOld key="9" />
            ) : (
                <TourLongPaymentLayerContainer key="9" />
            ),
            <TourCurrentAnswersComponent key="10" />,
            <TourPaymentLayerLastChanceComponent key="11" />,
            <TourAfterSellContainer key="13" />,
            <TourBenefitsComponent key="14" />,
            <TourPurchaseSuccessContainer key="15" />,
        ],
        [isLongLandingTour],
    )

    return (
        <View style={globalStyles.flex1FullWidth}>
            {(isPaymentScreen || isSetNotificationScreen || isPersonalAnimationScreen) && (
                <BackgroundAnimationComponent />
            )}
            {tourSteps[step]}
            {isButtonNextShowing && (
                <TourBottomComponent
                    testID="Tour install continue"
                    onPress={actions.setNextStep}
                    disabled={!tourVariantsValidation}
                />
            )}
            <TourAnalytics />
            <DeepLinkAuthLoaderContainer />
        </View>
    )
})

export default TourInstallFunctional
