import '@mu-native/performance/appStartMark'
import { AppRegistry, I18nManager, LogBox } from 'react-native'

import { pushNotificationService } from '@mu-native/pushNotifications'
import notifee, { EventType } from '@notifee/react-native'

import HeadlessCheck from './src/src/App'

if (__DEV__) {
    const { withOnBootNetworkActivityRecording } = require('@rozenite/network-activity-plugin')
    withOnBootNetworkActivityRecording()
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Custom property used in legacy React Native; ignore type error
console.reportErrorsAsExceptions = false
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Custom property used in legacy React Native; ignore type error
console.disableYellowBox = true

// Use LogBox for warning suppression (supported in current RN versions)
LogBox.ignoreAllLogs(true)
LogBox.ignoreLogs([
    "ViewPropTypes will be removed from React Native. Migrate to ViewPropTypes exported from 'deprecated-react-native-prop-types'.",
    'NativeBase: The contrast ratio of',
    "[react-native-gesture-handler] Seems like you're using an old API with gesture components, check out new Gestures system!",
])

I18nManager.allowRTL(false)
I18nManager.forceRTL(false)

pushNotificationService.setupBackgroundPushDelivery()
pushNotificationService.createChannels()

// Register Notifee background event handler for local notifications
// This must be called at the module level (outside of React components)
notifee.onBackgroundEvent(async ({ type, detail }) => {
    // Handle notification press events in background
    // The actual navigation/deeplink handling happens when the app becomes active
    // via onForegroundEvent() PRESS event
    if (type === EventType.PRESS || type === EventType.ACTION_PRESS) {
        console.log('[Notifee] Background notification pressed:', detail.notification?.id)
    }
})

AppRegistry.registerComponent('MuseScoreMobile', () => HeadlessCheck)
