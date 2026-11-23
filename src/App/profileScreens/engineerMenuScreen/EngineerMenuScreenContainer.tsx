import React, { useEffect, useLayoutEffect, useState } from 'react'
import { Alert, Clipboard, DevSettings, ScrollView, StyleSheet, Text, View } from 'react-native'
import { PlayInstallReferrer, PlayInstallReferrerInfo } from 'react-native-play-install-referrer'

import { abStoreChunk } from '@mu-native/ab'
import { analyticsStoreChunk } from '@mu-native/analytics'
import { apiStoreChunk, getServerTimestamp } from '@mu-native/api'
import { autoGradeOnboardingScreenStoreChunk } from '@mu-native/auto-grade-onboarding-screen'
import { device, globalStorage, platform } from '@mu-native/common'
import { debugStore } from '@mu-native/debug'
import { colors, layoutHelpers, showAlertNotification } from '@mu-native/ds'
import { checkmarkCircle } from '@mu-native/icons/checkmarkCircle'
import { giftChecklistStoreChunk } from '@mu-native/gift-checklist'
import { translate } from '@mu-native/locale'
import {
    billingThunks,
    clearTransactionIOS,
    devSubscriptionThunks,
    getAvailablePurchases,
    marketingConstants,
    marketingStorage,
    marketingStoreChunk,
    marketingThunks,
    type TDevSubscriptionPlan,
    TourSteps,
    withIapConnection,
} from '@mu-native/marketing'
import { Screen, useAppNavigation, useNavigation } from '@mu-native/navigation'
import { resetNpsThunk, showNpsNowThunk } from '@mu-native/nps'
import {
    NotificationIds,
    pushNotificationService,
    pushNotificationsStorage,
    pushNotificationsThunks,
} from '@mu-native/pushNotifications'
import { reviewAppStoreChunk } from '@mu-native/reviewApp'
import { scoreStoreChunk } from '@mu-native/score'
import { xtz } from '@mu-native/xtz'
import { mmkvStorageEngine } from '@muse-native/persist-engines'
import messaging from '@react-native-firebase/messaging'
import * as Sentry from '../../Utils/Sentry'
import { useActions, useValues } from '@ug/store'

import { NavHeader } from '../../Components/NavHeader/NavHeader'
import { COLOR_TEXT, FONT_SIZE_REGULAR, MARGIN_LG, MARGIN_MD } from '../../constants/styles'
import type { State } from '../../Reducers/Types'
import BaseApiProvider from '../../Services/BaseApiProvider'

import { alertSheetGallery } from './alertSheetGallery.ts'
import { useEngineerMobWebAuth } from './useEngineerMobWebAuth.ts'
import { SheetsQaSection } from './SheetsQaSection'

const EngineerMenuScreen = () => {
    const navigation = useAppNavigation()
    const { setOptions } = useNavigation()

    const [
        isPro,
        isTrial,
        isOffScores,
        isPremiumRights,
        hadProAccess,
        didUserPlayClassic,
        serverTimestamp,
        lastShownAnniversaryDays,
        isCourses,
        currentSubscriptionProId,
        currentSubscriptionOffScoresId,
        currentSubscriptionLearnId,
        isHadProAccessCourses,
        isHadProAccessOffScores,
        paymentAccountId,
        paymentAccountDeviceId,
        isDebugEnabled,
        accessRights,
        isLearnLite,
        creditBalance,
        coursesBalance,
        totalOpenScoreCount,
        sessionOpenScoreCount,
        rateAppCoolDownDate,
        rateAppRequestedAt,
        isEbookRights,
        isHadProAccessEbook,
        isAutoGradeRights,
        ebookCreditBalance,
        appsflyerConversionData,
        subscriptionsLearnIntroductory,
        subscriptionProIntroductory,
        subscriptionOffScoresIntroductory,
        isUsaStore,
    ] = useValues([
        marketingStoreChunk.props.getIsPro,
        marketingStoreChunk.props.getIsTrial,
        marketingStoreChunk.props.getIsOffScores,
        marketingStoreChunk.props.getIsPremiumRights,
        marketingStoreChunk.props.getIsHadProAccess,
        marketingStoreChunk.props.getDidUserPlayClassic,
        getServerTimestamp,
        marketingStoreChunk.props.getLastShownDaysAnniversarySplash,
        marketingStoreChunk.props.getIsCourses,
        (state: State) => marketingStoreChunk.props.getCurrentSubscriptionProInfo(state)?.productId,
        (state: State) =>
            marketingStoreChunk.props.getCurrentSubscriptionOffScoresInfo(state)?.productId,
        (state: State) =>
            marketingStoreChunk.props.getCurrentSubscriptionLearnInfo(state)?.productId,
        marketingStoreChunk.props.getIsHadProAccessCourses,
        marketingStoreChunk.props.getIsHadProAccessOffScores,
        marketingStoreChunk.props.getPaymentAccountId,
        marketingStoreChunk.props.getPaymentAccountDeviceId,
        debugStore.props.getIsEnabled,
        marketingStoreChunk.props.getRights,
        marketingStoreChunk.props.getIsLearningLite,
        marketingStoreChunk.props.getCreditBalance,
        marketingStoreChunk.props.getCourseBalance,
        scoreStoreChunk.props.getOpenScoreCount,
        scoreStoreChunk.props.getOpenScorePerSessionCount,
        reviewAppStoreChunk.props.getDontShowTillDate,
        reviewAppStoreChunk.props.getRequestedReviewAt,
        marketingStoreChunk.props.getIsEbookRights,
        marketingStoreChunk.props.getIsHadProAccessEbook,
        marketingStoreChunk.props.getIsAutoGradeRights,
        marketingStoreChunk.props.getEbookBalance,
        analyticsStoreChunk.props.getConversionData,
        (state: State) =>
            marketingStoreChunk.props
                .getSubscriptions(state)
                .find(subs => subs.productId === marketingConstants.yearLearn2025ProductId),
        (state: State) =>
            marketingStoreChunk.props
                .getSubscriptions(state)
                .find(subs => subs.productId === marketingConstants.proYearIntroductory),
        (state: State) =>
            marketingStoreChunk.props
                .getSubscriptions(state)
                .find(subs => subs.productId === marketingConstants.offScoresYearIntroductory),
        marketingStoreChunk.props.getIsUsaStore,
    ])
    const [abSession] = useValues([abStoreChunk.props.getSession])

    const actions = useActions({
        setIsPremiumRights: marketingStoreChunk.actions.setIsPremiumRights,
        setIsPro: marketingStoreChunk.actions.setIsPro,
        setIsLifetime: marketingStoreChunk.actions.setIsLifetime,
        setIsTrial: marketingStoreChunk.actions.setIsTrial,
        setIsHadProAccess: marketingStoreChunk.actions.setIsHadProAccess,
        setIsHadProAccessCourses: marketingStoreChunk.actions.setIsHadProAccessCourses,
        setIsHadProAccessEbook: marketingStoreChunk.actions.setIsHadProAccessEbook,
        setIsHadProAccessOffScores: marketingStoreChunk.actions.setIsHadProAccessOffScores,
        setDidUserPlayClassic: marketingStoreChunk.actions.setDidUserPlayClassic,
        setIsNeedToShowFloatingButton: marketingStoreChunk.actions.setIsNeedToShowFloatingButton,
        setLastShownDaysAnniversarySplash:
            marketingStoreChunk.actions.setLastShownDaysAnniversarySplash,
        setIsOffScores: marketingStoreChunk.actions.setIsOffScores,
        setIsCourses: marketingStoreChunk.actions.setIsCourses,
        setIsEbookRights: marketingStoreChunk.actions.setIsEbookRights,
        setIsAutoGradeRights: marketingStoreChunk.actions.setIsAutoGradeRights,
        setIsUsaStore: marketingStoreChunk.actions.setIsUsaStore,
        setMarketingPartialFieldsCustom: marketingStoreChunk.actions.setPartialFieldsCustom,
        setIsLearningLite: marketingStoreChunk.actions.setIsLearningLite,
        setTourUpdateId: marketingStoreChunk.actions.setTourUpdateId,
        setServerTimestamp: apiStoreChunk.actions.setServerTimestamp,
        nullifyReviewApp: reviewAppStoreChunk.actions.nullify,
        setDebugEnabled: debugStore.actions.setIsEnabled,
        resetDebug: debugStore.actions.reset,
        setAutoGradeStep: autoGradeOnboardingScreenStoreChunk.actions.setStep,
        setAutoGradeCompleted: autoGradeOnboardingScreenStoreChunk.actions.setCompleted,
        resetGiftState: giftChecklistStoreChunk.actions.resetState,
        setScoreOnboarded: scoreStoreChunk.actions.setOnboarded,
        setVisibleOnboardingStep: scoreStoreChunk.actions.setVisibleOnboardingStep,
        setPracticeModeTooltipShown: scoreStoreChunk.actions.setPracticeModeTooltipShown,
        getAllAccessRightsThunk: billingThunks.getAllAccessRightsThunk,
        setLocalPushNotifications: pushNotificationsThunks.setLocalPushNotifications,
        openSplashSaleThunk: marketingThunks.openSplashSaleThunk,
        openSplashSaleOffScoresThunk: marketingThunks.openSplashSaleOffScoresThunk,
        grantDevSubscription: devSubscriptionThunks.grantDevSubscriptionThunk,
        resetDevSubscriptions: devSubscriptionThunks.resetDevSubscriptionsThunk,
        resetNps: resetNpsThunk,
        showNpsNow: showNpsNowThunk,
    })

    const [deviceId, setDeviceId] = useState<string | null>(device.uniqueId)
    const [clientId, setClientId] = useState<string | null>(null)
    const [fcmToken, setFcmToken] = useState<string | null>(null)
    const [apnsToken, setApnsToken] = useState<string | null>(null)
    const [availablePurchases, setAvailablePurchases] = useState<string | null>(null)
    const [isShowAccessRights, setIsShowAccessRights] = useState(false)
    const [isShowAnalyticsParams, setIsShowAnalyticsParams] = useState(
        !!globalStorage.get('isShowAnalyticsParams'),
    )
    const [isHideResponseLogs, setIsHideResponseLogs] = useState(
        !!globalStorage.get('isHideResponseLogs'),
    )
    const [isShowSubscriptionData, setIsShowSubscriptionData] = useState(false)
    const [referrerData, setReferrerData] = useState<PlayInstallReferrerInfo | null>(null)
    const [isMobWebAuthEnabled, setIsMobWebAuthEnabled] = useState(false)

    useEngineerMobWebAuth(isMobWebAuthEnabled)

    const getClientId = async () => {
        const id = await BaseApiProvider.getClientId()
        setClientId(id)
    }

    const getReferrerDataAndroid = () => {
        if (!platform.isAndroid) return

        PlayInstallReferrer.getInstallReferrerInfo((installReferrerInfo, error) => {
            if (!error) {
                setReferrerData(installReferrerInfo)
            }
        })
    }

    useLayoutEffect(() => {
        setOptions({
            headerShown: true,
            // eslint-disable-next-line react/no-unstable-nested-components
            header: () => <NavHeader headerTitle="Engineer menu" noNotifications />,
        })
    }, [])

    useEffect(() => {
        getReferrerDataAndroid()
        setDeviceId(device.uniqueId)
        getClientId()
    }, [])

    const getAvailablePurchase = async () => {
        const rawPurchases = await withIapConnection(() => getAvailablePurchases())

        if (rawPurchases?.length) {
            setAvailablePurchases(JSON.stringify(rawPurchases))
        }
    }

    const getAccessRights = () => {
        actions.getAllAccessRightsThunk()
        setIsShowAccessRights(true)
    }

    const openTourInstall = () => {
        navigation.replace(Screen.tourInstall, {
            screen: Screen.tourInstall,
            params: { step: TourSteps.FIRST_TOUR_SCREEN },
        })
    }

    const openTourInstallEight = () => {
        navigation.replace(Screen.tourInstall, {
            screen: Screen.tourInstall,
            params: { step: TourSteps.SET_NOTIFICATION_SCREEN },
        })
    }

    const openTourUpdate = () => navigation.navigate(Screen.tourUpdate)
    const openReturnSplash = () => navigation.navigate(Screen.returnSplash)
    const openRestoreSplash = () => navigation.navigate(Screen.restoreOfferScreen)
    const openAnniversarySplash = () => navigation.navigate(Screen.anniversarySplash)
    const openABExperiments = () => navigation.navigate(Screen.ab)

    const changeProStatus = () => {
        actions.setIsPro(!isPro)
        actions.setIsLifetime(!isPro)
    }
    const changeTrialStatus = () => actions.setIsTrial(!isTrial)
    const changeOffScoresStatus = () => actions.setIsOffScores(!isOffScores)
    const changeLearnStatus = () => actions.setIsCourses(!isCourses)
    const changeEbooksStatus = () => actions.setIsEbookRights(!isEbookRights)
    const changeAutoGradeStatus = () => actions.setIsAutoGradeRights(!isAutoGradeRights)
    const changeLearnLiteStatus = () => actions.setIsLearningLite(!isLearnLite)
    const changePremiumStatus = () => actions.setIsPremiumRights(!isPremiumRights)
    const changeHadProAccessStatus = () => actions.setIsHadProAccess(!hadProAccess)
    const changeHadCoursesAccessStatus = () =>
        actions.setIsHadProAccessCourses(!isHadProAccessCourses)
    const changeHadEbookAccessStatus = () => actions.setIsHadProAccessEbook(!isHadProAccessEbook)
    const changeOffScoresAccessStatus = () =>
        actions.setIsHadProAccessOffScores(!isHadProAccessOffScores)
    const changeDidUserPlayClassicStatus = () => actions.setDidUserPlayClassic(!didUserPlayClassic)
    const changeIsUsaStore = () => actions.setIsUsaStore(!isUsaStore)

    const grantSubscription = (plan: TDevSubscriptionPlan) => () =>
        actions.grantDevSubscription({ plan })

    const changeToShowTourInstall = () => {
        marketingStorage.set('tourInstallshown', !marketingStorage.get('tourInstallshown'))
    }

    const copyDeviceIds = async () => {
        await Clipboard.setString(`Device ID: ${deviceId}\nClient ID: ${clientId}`)
        Alert.alert('Device ID and Client ID were copied to Clipboard!')
    }

    const copyPaymentAccountId = async () => {
        await Clipboard.setString(`Payment Account Id: ${paymentAccountId}`)
        Alert.alert('Payment Account Id were copied to Clipboard!')
    }

    const copyPaymentAccountDeviceId = async () => {
        Clipboard.setString(`Payment Account device id: ${paymentAccountDeviceId}`)
        Alert.alert('Payment Account device id were copied to Clipboard!')
    }

    const copyFcmToken = async () => {
        const token = await messaging().getToken()
        await Clipboard.setString(`${token}`)
        console.warn(token)
        setFcmToken(token)
        Alert.alert('FCM token was copied to Clipboard!')
    }

    const copyAPNSToken = async () => {
        const token = (await messaging().getAPNSToken())?.toLocaleLowerCase()
        await Clipboard.setString(`${token}`)
        console.warn(token)
        setApnsToken(token || null)
        Alert.alert('APNS token was copied to Clipboard!')
    }

    const setIsShowFloatingButton = () => actions.setIsNeedToShowFloatingButton(true)
    const nullifyFloatingButton = () => actions.setIsNeedToShowFloatingButton(true)

    const nullifyServerTime = () => {
        actions.setServerTimestamp(Date.now())
        Alert.alert('Server time nullified')
    }

    const resetSplashSale = () =>
        actions.setMarketingPartialFieldsCustom({
            timerSaleDate: null,
            timerSaleStart: null,
            timerSaleDateOffScores: null,
            timerSaleStartOffScores: null,
        })

    const resetLastShownAnniversaryDays = () => {
        actions.setLastShownDaysAnniversarySplash(0)
        Alert.alert('Anniversary days nullified')
    }

    const nullifyReviewApp = () => {
        actions.nullifyReviewApp()
        Alert.alert('Review App nullified')
    }

    const turnDemoNotifications = (toState: boolean) => () => {
        actions.setLocalPushNotifications({
            id: NotificationIds.Demo,
            // @ts-ignore
            notificationTime: toState ? new Date(Date.now() + 15_000) : null,
            title: translate('native.daily_reminders.title'),
            message: translate('native.daily_reminders.message'),
            repeatType: 'minute',
            ignoreInForeground: false,
        })
    }

    const showSheduledLocalNotifications = async () => {
        const res = await pushNotificationService.getScheduledLocalNotifications()
        Alert.alert('', JSON.stringify(res))
    }

    const clearGlobalStorage = () => globalStorage.clear()

    const toggleDebug = () => {
        const nextEnabled = !isDebugEnabled
        actions.setDebugEnabled(nextEnabled)
        if (!nextEnabled) {
            actions.resetDebug()
        }
    }

    const onClearTransactionIOS = () => {
        clearTransactionIOS()
            .then(() => {
                Alert.alert('Success clear')
            })
            .catch(() => {
                Alert.alert('Error clear')
            })
    }

    const handleSwitchAnalyticsParams = () => {
        const value = !globalStorage.get('isShowAnalyticsParams')
        globalStorage.set('isShowAnalyticsParams', value)
        setIsShowAnalyticsParams(value)
    }

    const handleSwitchResponseLogs = () => {
        const value = !globalStorage.get('isHideResponseLogs')
        globalStorage.set('isHideResponseLogs', value)
        setIsHideResponseLogs(value)
    }

    const resetTourUpdateId = () => actions.setTourUpdateId(20240101)

    const resetAppState = () => {
        mmkvStorageEngine?.clearStorage?.()
        DevSettings.reload()
    }

    const resetAutoGradeOnboarding = () => {
        actions.setAutoGradeStep(0)
        actions.setAutoGradeCompleted(false)
    }

    const openFlashSale = (isLearn: boolean) => {
        if (isLearn) {
            actions.openSplashSaleThunk()
        } else {
            actions.openSplashSaleOffScoresThunk()
        }
    }

    const resetGiftState = () => actions.resetGiftState()

    const resetScoreOnboarding = () => {
        actions.setScoreOnboarded(false)
        actions.setVisibleOnboardingStep(0)
        actions.setPracticeModeTooltipShown(false)
        Alert.alert('Score onboarding tooltips reset')
    }

    return (
        <ScrollView testID="Engineer menu scroll view">
            <View style={styles.container}>
                <Text style={styles.body}>XTZ: {xtz.version}</Text>
                <Text style={styles.generalText} onPress={openABExperiments}>
                    A/B Experiments
                </Text>

                <Text style={styles.body}>Alert sheets</Text>
                {alertSheetGallery.map(item => (
                    <Text
                        key={item.label}
                        style={styles.generalText}
                        onPress={() =>
                            item
                                .run()
                                .then(id =>
                                    showAlertNotification({ text: `resolved: ${String(id)}` }),
                                )
                        }
                    >
                        {item.label}
                    </Text>
                ))}
                <Text style={styles.generalText} onPress={() => setIsMobWebAuthEnabled(true)}>
                    Get data for mob web auth
                </Text>
                <Text
                    style={styles.generalText}
                    onPress={() =>
                        showAlertNotification({ text: 'Score was successfully added to set.' })
                    }
                >
                    Toast: text only
                </Text>
                <Text
                    style={styles.generalText}
                    onPress={() =>
                        showAlertNotification({
                            text: 'Score was successfully added to set.',
                            icon: checkmarkCircle,
                        })
                    }
                >
                    Toast: text + icon
                </Text>
                <Text
                    style={styles.generalText}
                    onPress={() =>
                        showAlertNotification({
                            text: 'Score was successfully added to set.',
                            image: 'https://musescore.com/static/musescore/scoredata/g/placeholder.png',
                        })
                    }
                >
                    Toast: text + image
                </Text>
                <Text
                    style={styles.generalText}
                    onPress={() =>
                        showAlertNotification({
                            text: 'Score was successfully added to set.',
                            actionTitle: 'Undo',
                            action: () => undefined,
                        })
                    }
                >
                    Toast: text + button
                </Text>
                <Text
                    style={styles.generalText}
                    onPress={() =>
                        showAlertNotification({
                            text: 'Score was successfully added to set.',
                            icon: checkmarkCircle,
                            actionTitle: 'Undo',
                            action: () => undefined,
                        })
                    }
                >
                    Toast: icon + text + button
                </Text>
                <Text style={styles.generalText} onPress={toggleDebug}>
                    Debug enabled: {`${isDebugEnabled}`}
                </Text>
                <Text style={styles.generalText} onPress={resetAppState}>
                    Reset app state and reload app
                </Text>
                <Text style={styles.generalText} onPress={turnDemoNotifications(true)}>
                    Turn ON Demo Push Notifications
                </Text>
                <Text style={styles.generalText} onPress={turnDemoNotifications(false)}>
                    Turn OFF Demo Push Notifications
                </Text>
                <Text style={styles.generalText} onPress={showSheduledLocalNotifications}>
                    Show Scheduled Local Push Notifications
                </Text>
                <Text style={styles.generalText} onPress={openTourInstall}>
                    Show tour install
                </Text>
                <Text style={styles.generalText} onPress={openTourInstallEight}>
                    Show tour install (Notification step)
                </Text>
                <Text style={styles.generalText} onPress={changeToShowTourInstall}>
                    Change to show tourinstall
                </Text>
                <Text style={styles.generalText} onPress={resetSplashSale}>
                    Reset splash sale date
                </Text>
                <Text
                    testID="Engineer menu show flash sale"
                    style={styles.generalText}
                    onPress={() => openFlashSale(true)}
                >
                    Show flash sale learn
                </Text>
                <Text
                    testID="Engineer menu show flash sale"
                    style={styles.generalText}
                    onPress={() => openFlashSale(false)}
                >
                    Show flash sale offscores
                </Text>
                <Text style={styles.generalText} onPress={resetTourUpdateId}>
                    Reset tour update id
                </Text>
                <Text style={styles.generalText} onPress={resetAutoGradeOnboarding}>
                    Reset AutoGrade Onboarding
                </Text>
                <Text style={styles.generalText} onPress={resetGiftState}>
                    Reset gift state
                </Text>
                <Text style={styles.generalText} onPress={resetScoreOnboarding}>
                    Reset score onboarding tooltips
                </Text>
                <View style={styles.billingContainer}>
                    <Text style={styles.titleBilling}>Billing info</Text>
                    <Text style={styles.generalText} onPress={changeIsUsaStore}>
                        {`isUsaStore - ${isUsaStore}`}
                    </Text>
                    <Text style={styles.generalText}>
                        {`currentSubscriptionProId - ${currentSubscriptionProId}`}
                    </Text>
                    <Text style={styles.generalText}>
                        {`currentSubscriptionOffScoresId - ${currentSubscriptionOffScoresId}`}
                    </Text>
                    <Text style={styles.generalText}>
                        {`currentSubscriptionLearnId - ${currentSubscriptionLearnId}`}
                    </Text>
                    <Text style={styles.generalText} onPress={changeHadProAccessStatus}>
                        {`hadProAccess: ${hadProAccess}`}
                    </Text>
                    <Text style={styles.generalText} onPress={changeOffScoresAccessStatus}>
                        {`hadOffScoresAccess: ${isHadProAccessOffScores}`}
                    </Text>
                    <Text style={styles.generalText} onPress={changeHadCoursesAccessStatus}>
                        {`hadCoursesAccess: ${isHadProAccessCourses}`}
                    </Text>
                    <Text style={styles.generalText} onPress={changeHadEbookAccessStatus}>
                        {`hadEbookAccess: ${isHadProAccessEbook}`}
                    </Text>
                    <Text style={styles.generalText} onPress={changeOffScoresStatus}>
                        {`Off Scores status: ${isOffScores}`}
                    </Text>
                    <Text style={styles.generalText} onPress={changeProStatus}>
                        {`Pro status: ${isPro}`}
                    </Text>
                    <Text style={styles.generalText} onPress={changeLearnStatus}>
                        {`Learn status: ${isCourses}`}
                    </Text>
                    <Text style={styles.generalText} onPress={changeEbooksStatus}>
                        {`Ebooks status: ${isEbookRights}`}
                    </Text>
                    <Text style={styles.generalText} onPress={changeAutoGradeStatus}>
                        {`Autograde status: ${isAutoGradeRights}`}
                    </Text>
                    <Text style={styles.generalText} onPress={changeLearnLiteStatus}>
                        {`Learn lite status: ${isLearnLite}`}
                    </Text>
                    <Text style={styles.generalText} onPress={changePremiumStatus}>
                        {`Premium status: ${isPremiumRights}`}
                    </Text>
                    <Text style={styles.generalText} onPress={changeTrialStatus}>
                        {`isTrial: ${isTrial}`}
                    </Text>
                    <Text style={styles.generalText}>{`Scores balance: ${creditBalance}`}</Text>
                    <Text style={styles.generalText}>{`Courses balance: ${coursesBalance}`}</Text>
                    <Text style={styles.generalText}>{`Ebook balance: ${ebookCreditBalance}`}</Text>
                    <Text style={styles.titleBilling}>Grant subscription (store only)</Text>
                    <Text style={styles.generalText} onPress={grantSubscription('pro')}>
                        Grant Pro
                    </Text>
                    <Text style={styles.generalText} onPress={grantSubscription('offScores')}>
                        Grant Pro+
                    </Text>
                    <Text style={styles.generalText} onPress={grantSubscription('learn')}>
                        Grant Learn
                    </Text>
                    <Text style={styles.generalText} onPress={grantSubscription('learnOffScores')}>
                        Grant Learn &amp; Pro+
                    </Text>
                    <Text
                        style={styles.generalText}
                        onPress={() => actions.resetDevSubscriptions()}
                    >
                        Clear granted subscriptions
                    </Text>
                    <SheetsQaSection
                        titleStyle={styles.titleBilling}
                        itemStyle={styles.generalText}
                    />
                    {platform.isIos && (
                        <Text style={styles.generalText} onPress={onClearTransactionIOS}>
                            Clear transaction IOS
                        </Text>
                    )}
                </View>
                <Text
                    testID="Engineer menu show tour update"
                    style={styles.generalText}
                    onPress={openTourUpdate}
                >
                    Show tour update
                </Text>
                <Text style={styles.generalText} onPress={openReturnSplash}>
                    Show return splash
                </Text>
                <Text style={styles.generalText} onPress={openRestoreSplash}>
                    Show restore splash
                </Text>
                <Text style={styles.generalText} onPress={openAnniversarySplash}>
                    Show anniversary splash
                </Text>
                <Text style={styles.generalText} onPress={nullifyServerTime}>
                    Server time: {new Date(serverTimestamp).toUTCString()}
                    {'\n'}
                    Device time: {new Date().toUTCString()}
                </Text>
                <Text style={styles.generalText} onPress={resetLastShownAnniversaryDays}>
                    Last shown anniversary days: {lastShownAnniversaryDays}
                </Text>
                <Text style={styles.generalText} onPress={setIsShowFloatingButton}>
                    Set Show Floating Button
                </Text>
                <Text style={styles.generalText} onPress={nullifyFloatingButton}>
                    Nullify Floating Button
                </Text>
                <Text style={styles.generalText} onPress={nullifyReviewApp}>
                    Nullify Review App
                </Text>
                <Text style={styles.generalText}>{`NPS session: ${abSession.number ?? 0}`}</Text>
                <Text
                    style={styles.generalText}
                    onPress={() => {
                        actions.resetNps()
                        Alert.alert('NPS reset')
                    }}
                >
                    Reset NPS
                </Text>
                <Text
                    testID="Engineer menu show NPS"
                    style={styles.generalText}
                    onPress={() => actions.showNpsNow()}
                >
                    Show NPS now
                </Text>
                <Text style={styles.generalText} onPress={getAccessRights}>
                    {isShowAccessRights ? JSON.stringify(accessRights) : 'Get all access rights'}
                </Text>
                <Text style={styles.generalText} onPress={copyFcmToken}>
                    {fcmToken || 'Get FCM token'}
                </Text>

                <Text style={styles.generalText} onPress={copyAPNSToken}>
                    {apnsToken || 'Get APNS token'}
                </Text>
                <Text style={styles.generalText} onPress={changeDidUserPlayClassicStatus}>
                    {`didUserPlayClassic: ${didUserPlayClassic}`}
                </Text>
                <Text style={[styles.generalText, styles.smallText]} onPress={copyDeviceIds}>
                    {`Device ID: ${deviceId}\nClient ID: ${clientId}`}
                </Text>
                <Text style={[styles.generalText, styles.smallText]} onPress={copyPaymentAccountId}>
                    {`Payment Account Id: ${paymentAccountId}`}
                </Text>
                <Text
                    style={[styles.generalText, styles.smallText]}
                    onPress={copyPaymentAccountDeviceId}
                >
                    {`Payment Account device id: ${paymentAccountDeviceId}`}
                </Text>
                <Text style={styles.generalText} onPress={handleSwitchAnalyticsParams}>
                    {`Is show analytics params: ${isShowAnalyticsParams}`}
                </Text>
                <Text style={styles.generalText} onPress={handleSwitchResponseLogs}>
                    {`Is hide response logs: ${isHideResponseLogs}`}
                </Text>
                <Text style={styles.generalText}>memory - {platform.memory}</Text>
                <Text style={styles.generalText} onPress={clearGlobalStorage}>
                    Clear Global storage
                </Text>
                <Text style={styles.generalText} selectable>
                    Push token:{'\n'}
                    {pushNotificationsStorage.get('sentToken')}
                </Text>
                <Text style={styles.generalText} onPress={getAvailablePurchase}>
                    {availablePurchases
                        ? JSON.stringify(availablePurchases)
                        : 'Get available purchases'}
                </Text>
                <Text style={[styles.generalText, styles.smallText]}>
                    {`Rate App don't show until: ${new Date(rateAppCoolDownDate)}`}
                </Text>
                {typeof rateAppRequestedAt === 'number' && (
                    <Text style={[styles.generalText, styles.smallText]}>
                        {`Rate App requested at: ${new Date(rateAppRequestedAt)}`}
                    </Text>
                )}
                <Text style={[styles.generalText, styles.smallText]}>
                    {`Opened scores in session: ${sessionOpenScoreCount}, total: ${totalOpenScoreCount}`}
                </Text>
                <Text style={styles.generalText} onPress={() => {}}>
                    Crash App
                </Text>
                <Text style={styles.generalText}>
                    {`Appsflyer Conversion Data${
                        appsflyerConversionData
                            ? JSON.stringify(appsflyerConversionData, null, 2)
                            : null
                    }`}
                    {`Deeplink data${
                        appsflyerConversionData
                            ? JSON.stringify(globalStorage.get('deeplinkData'), null, 2)
                            : null
                    }`}
                </Text>
                <Text style={styles.generalText}>
                    {`referrerData${referrerData ? JSON.stringify(referrerData, null, 2) : null}`}
                </Text>

                <Text
                    style={styles.generalText}
                    onPress={() => globalStorage.set('deeplinkData', '')}
                >
                    Clear deeplink data
                </Text>
                <Text
                    onPress={() => Sentry.captureException('test exception')}
                    style={styles.generalText}
                >
                    Sentry.captureException
                </Text>

                <Text style={styles.generalText}>Ram - {platform.memory.toFixed(0)} gb</Text>
                <Text style={styles.generalText} onPress={() => setIsShowSubscriptionData(true)}>
                    {isShowSubscriptionData
                        ? JSON.stringify(subscriptionsLearnIntroductory, null, 2)
                        : 'Show subscription data'}
                    {isShowSubscriptionData
                        ? JSON.stringify(subscriptionProIntroductory, null, 2)
                        : 'Show subscription data'}
                    {isShowSubscriptionData
                        ? JSON.stringify(subscriptionOffScoresIntroductory, null, 2)
                        : 'Show subscription data'}
                </Text>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        padding: MARGIN_MD,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    generalText: {
        color: COLOR_TEXT,
        fontSize: FONT_SIZE_REGULAR,
        lineHeight: MARGIN_LG,
        textAlign: 'center',
        paddingVertical: MARGIN_MD,
    },

    body: {
        color: '#000',
        fontSize: FONT_SIZE_REGULAR,
        lineHeight: MARGIN_LG,
        textAlign: 'center',
        paddingVertical: MARGIN_MD,
    },
    smallText: {
        fontSize: 10,
    },
    billingContainer: {
        backgroundColor: colors.winterColor,
        borderRadius: 20,
        padding: 8,
    },
    titleBilling: {
        fontSize: layoutHelpers.getResponsiveSizeExtended(20),
        textAlign: 'center',
    },
})

export default EngineerMenuScreen
