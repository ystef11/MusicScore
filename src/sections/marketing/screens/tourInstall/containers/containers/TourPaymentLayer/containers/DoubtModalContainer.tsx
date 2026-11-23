import React, { memo, useCallback, useEffect, useState } from 'react'
import { StyleSheet } from 'react-native'
import Animated, {
    FadeIn,
    FadeInLeft,
    FadeOut,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'

import { platform } from '@mu-native/common'
import {
    AppText,
    brandColors,
    colors,
    layoutHelpers,
    OnboardingTitleComponent,
    replacerText,
    SvgAsset,
} from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { useWindowDimensions } from '@mu-native/system'
import { useActions, useValues } from '@ug/store'

import reportEvent from '../../../../../../../../App/Utils/Analytics'
import { tourInstallScreenStoreChunk } from '../../../../store/tourInstallScreenStoreChunk'

import { PinataView } from './components/PinataView'

const styles = StyleSheet.create({
    doubtModalContainer: {
        flex: 1,
        zIndex: 3000,
        position: 'absolute',
        alignSelf: 'center',
        height: '100%',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.tourBgTrialContainer,
    },
    titleStyle: {
        fontSize: layoutHelpers.getResponsiveSizeExtended(102),
        lineHeight: layoutHelpers.getResponsiveSizeExtended(100),
        textAlign: 'center',
    },
    subTitleStyle: {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: layoutHelpers.getResponsiveSizeExtended(24),
        paddingTop: 4,
    },
    mb40: {
        marginBottom: layoutHelpers.getResponsiveSizeExtended(40),
    },
    waveRightStyle: {
        right: 0,
        zIndex: 10,
        bottom: '10%',
        position: 'absolute',
    },
    waveLeftStyle: {
        left: 0,
        top: '0%',
        zIndex: 10,
        position: 'absolute',
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        width: '100%',
    },
    waveTourIconStyle: { position: 'absolute', alignSelf: 'center' },
    waveTourContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        width: '100%',
    },
})

const FirstStep = () => {
    const { width } = useWindowDimensions()

    return (
        <Animated.View
            style={styles.waveTourContainer}
            entering={FadeInLeft.duration(1000).delay(600)}
            exiting={FadeOut.duration(600)}
        >
            <SvgAsset style={styles.waveTourIconStyle} type="waves_tour" width={width} />
            <AppText
                rawText={translate('native.marketing.doubt_title')}
                font="f32w600"
                brandColor="backgroundDefault"
            />
        </Animated.View>
    )
}

const ThirdStep = () => {
    return (
        <Animated.View entering={FadeIn.duration(600)} style={styles.centerContent}>
            <SvgAsset
                type="wawe_left"
                style={styles.waveLeftStyle}
                height={layoutHelpers.getResponsiveSizeExtended(640)}
            />
            <SvgAsset
                type="wawe_right"
                style={styles.waveRightStyle}
                height={layoutHelpers.getResponsiveSizeExtended(300)}
            />
            <OnboardingTitleComponent
                title={replacerText({
                    text: `${platform.isIos ? '77' : '66.6'}% [mSymphony]o[/mSymphony]ff`,
                })}
                titleStyle={styles.titleStyle}
                color={brandColors.backgroundDefault}
                contentStyle={styles.mb40}
                subTitle={translate('native.marketing.doubt_offer')}
                subTitleStyle={styles.subTitleStyle}
            />
        </Animated.View>
    )
}

const SecondStep = ({ onOpened }: { onOpened: () => void }) => {
    useEffect(() => {
        reportEvent(RT_EVENTS.TAP_BOX_CLICK)
    }, [])

    return (
        <Animated.View
            entering={FadeIn.duration(600)}
            exiting={FadeOut.duration(600)}
            style={styles.centerContent}
        >
            <PinataView onOpened={onOpened} />
        </Animated.View>
    )
}

export const DoubtModalContainer = memo(
    ({
        isPaymentInProgress,
        setIsNeedToShowTimer,
        onSetSubscriptionGroupCallback,
    }: {
        isPaymentInProgress: boolean
        setIsNeedToShowTimer: React.Dispatch<React.SetStateAction<boolean>>
        onSetSubscriptionGroupCallback: () => void
    }) => {
        const opacityView = useSharedValue(0)
        const [isShowDoubtModal] = useValues([
            tourInstallScreenStoreChunk.props.getIsShowDoubtModal,
        ])
        const actions = useActions({
            setIsShowDoubtModal: tourInstallScreenStoreChunk.actions.setIsShowDoubtModal,
        })
        const [currentStep, setCurrentStep] = useState(0)

        const hideModal = () => {
            actions.setIsShowDoubtModal(false)
        }

        const onHideModal = () => {
            onSetSubscriptionGroupCallback()
            setIsNeedToShowTimer(true)

            opacityView.value = withTiming(0, { duration: 500 }, isFinished => {
                if (isFinished) {
                    scheduleOnRN(hideModal)
                }
            })
        }

        useEffect(() => {
            if (isShowDoubtModal && !isPaymentInProgress) {
                opacityView.value = withTiming(1, { duration: 600 })

                setTimeout(() => {
                    setCurrentStep(1)
                }, 600 + 3000)
            }
        }, [isShowDoubtModal])

        const onShowLastStep = useCallback(() => {
            setCurrentStep(2)
            setTimeout(onHideModal, 5000)
        }, [])

        const opacityViewStyle = useAnimatedStyle(() => ({
            opacity: opacityView.value,
        }))

        if (!isShowDoubtModal || isPaymentInProgress) return null

        const steps = [
            <FirstStep key="1" />,
            <SecondStep onOpened={onShowLastStep} key="2" />,
            <ThirdStep key="3" />,
        ]

        return (
            <Animated.View style={[styles.doubtModalContainer, opacityViewStyle]}>
                {steps[currentStep]}
            </Animated.View>
        )
    },
)
