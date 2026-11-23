import { memo, useCallback, useEffect, useState } from 'react'
import { StyleSheet } from 'react-native'

import { autogradeService } from '@mu-native/autograde-screen'
import {
    CommonTouchable,
    Icon,
    Loader,
    RootViewScreenComponent,
    useAppSafeArea,
} from '@mu-native/ds'
import { close as closeIcon } from '@mu-native/icons/close'
import { marketingStoreChunk } from '@mu-native/marketing'
import { useAppNavigation, useAppRoute } from '@mu-native/navigation'
import { Orientation } from '@mu-native/system'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../../../../App/constants/MetricaEvents.ts'
import { MSScoreT } from '../../../../../App/Model/MSScore'
import reportEvent from '../../../../../App/Utils/Analytics.ts'
import { rtConfigSteps, stepsConfig } from '../constants/autoGradeContants.ts'
import { autoGradeOnboardingScreenStoreChunk } from '../store/autoGradeOnboardingScreenStoreChunk'
import { OnboardingSteps } from '../types/autoGradeOnboardingScreenAppTypes'

const ClosePracticeModeButton = memo((props: { onPress: () => void }) => {
    const insets = useAppSafeArea()
    return (
        <CommonTouchable
            onPress={props.onPress}
            style={[styles.closeButton, { top: insets.top + 16 }]}
        >
            <Icon source={closeIcon} tint="white" />
        </CommonTouchable>
    )
})

export const AutoGradeOnboardingContainer = memo(() => {
    const [step, completed, isAutoGradeRights] = useValues([
        autoGradeOnboardingScreenStoreChunk.props.getStep,
        autoGradeOnboardingScreenStoreChunk.props.getCompleted,
        marketingStoreChunk.props.getIsAutoGradeRights,
    ])
    const actions = useActions({
        setStep: autoGradeOnboardingScreenStoreChunk.actions.setStep,
        setCompleted: autoGradeOnboardingScreenStoreChunk.actions.setCompleted,
    })
    const [loading, setLoading] = useState(true)

    const navigation = useAppNavigation()
    const routeParams = useAppRoute<{ uri: string; score: MSScoreT }>()

    const goToAutograde = useCallback(() => {
        actions.setCompleted(true)
        navigation.goBack()
        navigation.navigate('AutogradeScreen', routeParams)
    }, [actions, navigation, routeParams])

    useEffect(() => {
        if (completed && isAutoGradeRights) {
            goToAutograde()
        }
        if (isAutoGradeRights && !completed) {
            actions.setStep(OnboardingSteps.SixthStep)
        }
    }, [actions, completed, goToAutograde, isAutoGradeRights])

    useEffect(() => {
        const timer = setTimeout(() => {
            Orientation.unlockAllOrientations()
            Orientation.lockToLandscape()
        }, 1400)
        setTimeout(() => {
            setLoading(false)
        }, 1500)

        return () => {
            if (timer) clearTimeout(timer)
        }
    }, [])

    useEffect(() => {
        reportEvent(MetricaEvents.AUTOGRADE_SHOW, {
            value: rtConfigSteps[step],
        })
        ;(async () => {
            if (step === OnboardingSteps.SixthStep) {
                const micGranted = await autogradeService.checkMicrophonePermission()

                if (micGranted) actions.setStep(OnboardingSteps.SeventhStep)
            }
        })()
    }, [step])

    const onNext = async (step: OnboardingSteps) => {
        if (step === OnboardingSteps.SixthStep) {
            const granted = await autogradeService.requestMicrophonePermission()
            if (granted) {
                actions.setStep(OnboardingSteps.SecondStep)
            }
            return
        }
        const isLast = step === Object.keys(stepsConfig).length - 1

        if (isAutoGradeRights && step === OnboardingSteps.FourthStep) {
            actions.setCompleted(true)
            return
        }

        if (isLast) {
            goToAutograde()
            return
        }
        actions.setStep(step + 1)
    }

    const {
        component: Component,
        title,
        subtitle,
        stepLabel,
        buttonTitle,
        image,
    } = stepsConfig[step]

    return (
        <RootViewScreenComponent>
            {loading && <Loader />}
            {!loading && (
                <Component
                    key={step}
                    title={title}
                    subtitle={subtitle}
                    image={image}
                    buttonTitle={buttonTitle}
                    stepLabel={stepLabel}
                    totalStepsLabel={4}
                    onNext={onNext}
                    step={step}
                />
            )}
            {step !== OnboardingSteps.FifthStep && (
                <ClosePracticeModeButton onPress={navigation.goBack} />
            )}
        </RootViewScreenComponent>
    )
})

const styles = StyleSheet.create({
    closeButton: {
        position: 'absolute',
        left: 16,
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
})
