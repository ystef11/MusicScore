import { useEffect, useMemo, useState } from 'react'
import { Image, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native'
import { uses24HourClock } from 'react-native-localize'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'

import { tourTestIds } from '@mu/mu-mobile-test-id'
import { appsFlyerEvent } from '@mu-native/analytics'
import { generalModule, platform } from '@mu-native/common'
import {
    AnimationCheckbox,
    AppText,
    brandColors,
    colors,
    globalStyles,
    icons,
    layout,
    layoutHelpers,
    replacerText,
} from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { TourSteps } from '@mu-native/marketing'
import { profileThunks } from '@mu-native/profile'
import { pushNotificationsStoreChunk, pushNotificationsThunks } from '@mu-native/pushNotifications'
import { quizConstants, quizStoreChunk } from '@mu-native/quiz'
import { useActions, useValues } from '@ug/store'

import DateTimePicker from '../../../../../../App/Components/DateTimePicker/DateTimePicker'
import MetricaEvents from '../../../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../../../App/Utils/Analytics'
import formatDate from '../../../../../../App/Utils/Date'
import { useShowBenefitsExperiment } from '../../hooks/useShowBenefitsExperiment.ts'
import { tourInstallScreenStoreChunk } from '../../store/tourInstallScreenStoreChunk'

import TourBottomComponent from './TourBottomComponent'

const { getResponsiveSize } = layoutHelpers

const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
        flex: 1,
        alignItems: 'center',
    },
    notificationStepContainer: {
        flex: 1,
        alignItems: 'center',
        width: '100%',
        justifyContent: 'flex-end',
        maxWidth: layout.maxWidthTabletContainer,
    },
    contentWrapper: {
        width: '100%',
        paddingHorizontal: layout.marginMd,
        maxWidth: layout.maxWidthTabletContainer,
        alignSelf: 'center',
        backgroundColor: colors.white,
        paddingTop: layoutHelpers.getResponsiveSizeExtended(20),
        paddingBottom: layoutHelpers.getResponsiveSizeExtended(140),
    },
    timerIcon: {
        position: 'absolute',
        top: getResponsiveSize(-10),
        right: getResponsiveSize(-10),
        width: getResponsiveSize(26),
        height: getResponsiveSize(26),
    },
    timeForPlayContainer: {
        position: 'absolute',
        top: '11%',
        alignSelf: 'center',
        backgroundColor: brandColors.statusSuccess,
        borderRadius: getResponsiveSize(4),
    },
    timeForPlayContainerBorder: {
        paddingHorizontal: getResponsiveSize(16),
        paddingVertical: getResponsiveSize(2),
        margin: getResponsiveSize(2),
        borderColor: colors.white,
        borderWidth: getResponsiveSize(1),
        borderRadius: getResponsiveSize(4),
    },
    timeForPlayText: {
        fontSize: getResponsiveSize(16),
        lineHeight: getResponsiveSize(19),
        color: colors.white,
    },
    setReminderContainer: {
        flexDirection: 'row',
        marginTop: getResponsiveSize(layout.marginMd),
        alignSelf: 'flex-start',
        alignItems: 'center',
        paddingVertical: layoutHelpers.getResponsiveSizeExtended(layout.marginSm),
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: brandColors.strokeDefault,
        marginBottom: layoutHelpers.getResponsiveSizeExtended(20),
    },
    setReminderTextNewBrand: {
        marginHorizontal: getResponsiveSize(layout.marginMd),
        alignSelf: 'center',
        maxWidth: '80%',
    },
    notificationTimeTextContainer: {
        backgroundColor: brandColors.additionalDefaultSubdued,
        borderRadius: getResponsiveSize(50),
        paddingHorizontal: getResponsiveSize(layout.marginXm),
        paddingVertical: getResponsiveSize(layout.marginXs),
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationImageStyle: {
        width: layoutHelpers.getResponsiveSizeExtended(330),
        height: layoutHelpers.getResponsiveSizeExtended(210),
        alignSelf: 'center',
    },
    checkBoxWrapper: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexDirection: 'row',
    },
    checkBoxStyles: {
        borderColor: brandColors.formDefault,
        marginRight: 0,
    },
})

const defaultAnswer = 517
const recommendedTime = {
    517: 11,
    520: 17,
    523: 23,
    526: 46,
    529: 57,
}
export const TourSetNotificationComponent = () => {
    const [notificationsEnabled, quizAnswersValues] = useValues([
        pushNotificationsStoreChunk.props.getPermissionGranted,
        quizStoreChunk.props.getQuizAnswers,
    ])

    const actions = useActions({
        requestPushPermission: pushNotificationsThunks.requestPushPermissionThunk,
        setDailyReminder: profileThunks.setDailyReminder,
        setStep: tourInstallScreenStoreChunk.actions.setStep,
    })

    const userLevel = useMemo(
        () => quizAnswersValues?.[quizConstants.levelQuestionIndex]?.[0],
        [quizAnswersValues],
    )

    const [isNotificationAllowed, setNotificationAllowed] = useState(platform.isAndroid)
    const [notificationTime, setNotificationTime] = useState(new Date())
    const [showTimePicker, setShowTimePicker] = useState(false)
    const [continuePressed, setContinuePressed] = useState(false)

    const { isShowBenefits } = useShowBenefitsExperiment(continuePressed)
    const nextStepAfterNotification = isShowBenefits
        ? TourSteps.BENEFITS_SCREEN
        : TourSteps.PAYMENT_SCREEN

    if (platform.isIos && generalModule.isiOSAppOnMac) {
        // skip current step for mac app version
        actions.setStep(nextStepAfterNotification)
    }

    const report = () => {
        reportEvent(MetricaEvents.DAILY_REMINDERS, {
            value: 'tour',
            'params.key': ['allowed'],
            'params.str_value': [''],
            'params.value': [isNotificationAllowed ? 1 : 0],
        })
        appsFlyerEvent('pushSubscribe')
    }

    useEffect(() => {
        if (notificationsEnabled === null) return

        if (!notificationsEnabled && continuePressed) {
            actions.setStep(nextStepAfterNotification)
            appsFlyerEvent('pushUnsubscribe')
        }

        if (notificationsEnabled && continuePressed) {
            actions.setDailyReminder(notificationTime)
            actions.setStep(nextStepAfterNotification)
        }
        report()
    }, [notificationsEnabled, continuePressed])

    const onTurnNotifications = () => {
        setNotificationAllowed(prevState => !prevState)
    }

    const onChangeTime = () => {
        if (isNotificationAllowed) {
            setShowTimePicker(true)
        } else {
            setNotificationAllowed(true)
        }
    }

    const onPressContinue = () => {
        setContinuePressed(true)
        if (!notificationsEnabled && isNotificationAllowed) {
            setTimeout(() => {
                actions.requestPushPermission()
            }, 100)
        }

        if (!isNotificationAllowed) {
            actions.setDailyReminder(null)
            actions.setStep(nextStepAfterNotification)
        }
    }

    const onChange = (selectedDate: Date) => {
        const currentDate = selectedDate || notificationTime
        const isTimeChanged =
            currentDate.toTimeString().slice(0, 5) !== notificationTime.toTimeString().slice(0, 5)

        if (isTimeChanged) {
            setNotificationTime(currentDate)
        }
    }

    const onHideTimePicker = () => {
        setShowTimePicker(false)
    }

    const notificationTimeString = formatDate(
        notificationTime,
        uses24HourClock() ? 'HH:mm' : 'h:mm A',
    )

    const timeToPlay = recommendedTime[(userLevel as keyof typeof recommendedTime) || defaultAnswer]

    return (
        <View style={styles.wrapper}>
            <Animated.View
                entering={FadeIn.duration(600).delay(300)}
                exiting={FadeOut.duration(600)}
                style={styles.notificationStepContainer}
            >
                <View style={styles.contentWrapper}>
                    <AppText
                        adaptiveSize
                        font="f44w400Accent"
                        textAlign="center"
                        brandColor="contentPrimary"
                        rawText={translate('native.daily_reminders.tour.almost_there')}
                    />
                    <View>
                        <Image
                            resizeMode="contain"
                            source={icons.setNotificationToPlayImage}
                            style={styles.notificationImageStyle}
                        />
                        <View style={styles.timeForPlayContainer}>
                            <View style={styles.timeForPlayContainerBorder}>
                                <Text style={styles.timeForPlayText}>
                                    {translate('native.marketing.tour.minutes_short', {
                                        count: String(timeToPlay),
                                    })}
                                </Text>
                            </View>
                            <Image source={icons.timerIcon} style={styles.timerIcon} />
                        </View>
                    </View>
                    <AppText
                        adaptiveSize
                        font="f17w400"
                        textAlign="center"
                        lineHeight={24}
                        brandColor="contentPrimary"
                        rawText={replacerText({
                            text: translate('native.daily_reminders.tour.we_recommend_you_to_play'),
                            customNumber: timeToPlay,
                        })}
                        style={globalStyles.mb12}
                    />
                    <TouchableWithoutFeedback onPress={onTurnNotifications}>
                        <View style={styles.setReminderContainer}>
                            <View style={styles.checkBoxWrapper}>
                                <AnimationCheckbox
                                    checked={isNotificationAllowed}
                                    style={styles.checkBoxStyles}
                                />
                                <AppText
                                    style={styles.setReminderTextNewBrand}
                                    font="f17w400"
                                    brandColor="contentPrimary"
                                    numberOfLines={2}
                                    rawText={translate(
                                        'native.daily_reminders.tour.set_reminder_to',
                                    )}
                                />
                            </View>
                            <TouchableWithoutFeedback onPress={onChangeTime}>
                                <View style={styles.notificationTimeTextContainer}>
                                    <AppText
                                        rawText={notificationTimeString}
                                        font="f17w600"
                                        adaptiveSize
                                        brandColor="colorActionPrimaryDefault"
                                    />
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
                <TourBottomComponent
                    textAboveButton={translate('native.daily_reminders.tour.ios_hint')}
                    testID={tourTestIds.buttons.notificationContinue}
                    onPress={onPressContinue}
                />
            </Animated.View>
            {showTimePicker && (
                <DateTimePicker
                    value={notificationTime}
                    onClose={onHideTimePicker}
                    onChange={onChange}
                />
            )}
        </View>
    )
}
