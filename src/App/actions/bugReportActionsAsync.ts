import { Linking } from 'react-native'

import { device } from '@mu-native/common'

import MetricaEvents from '../constants/MetricaEvents'
import reportEvent from '../Utils/Analytics'
import Utils from '../Utils/Utils'

import { describeError } from './describeError'

export async function bugReportAction(
    state: any,
    screenName?: string,
    // A rejected request reaches here as a Response, not an Error.
    error?: unknown,
    email?: string,
) {
    reportEvent(MetricaEvents.LOGIN_BUG_REPORT)
    const supportMail = 'support@musescore.com'
    const messageSubject = 'MuseScore Mobile App: Bug report'
    const { ownName, isLifetime, isPro } = state

    /* --- Device Info --- */
    const APPLICATION_NAME = device.appName
    const BUNDLE_ID = device.bundleId
    const VERSION = device.appVersion
    const BUILD_NUMBER = device.buildNumber
    const SYSTEM_NAME = device.systemName
    const SYSTEM_VERSION = device.systemVersion
    const DEVICE_BRAND = device.brand
    const DEVICE_MODEL = device.model
    const FIRST_INSTALL_TIME = await device.getFirstInstallTime()

    /* --------- --------- */
    const firstInstallTime = FIRST_INSTALL_TIME ? Utils.formatDate(FIRST_INSTALL_TIME) : null
    let messageBodyTemplate = 'Hello!\n'
    messageBodyTemplate += '\n\n Please type your text here \n\n'
    messageBodyTemplate += `I have found an error in ${APPLICATION_NAME}.\n`
    messageBodyTemplate += `App Info: ${BUNDLE_ID} ${VERSION} (${BUILD_NUMBER})\n`
    messageBodyTemplate += `Device Info: ${SYSTEM_NAME}, ${SYSTEM_VERSION}, ${DEVICE_BRAND}, ${DEVICE_MODEL})\n`

    if (isLifetime) {
        messageBodyTemplate += `Lifetime user: ${String(isLifetime)}\n`
    }

    if (isPro) {
        messageBodyTemplate += `Pro User: ${String(isPro)}\n`
    }

    if (ownName) {
        messageBodyTemplate += `Username: ${ownName}\n`
    }

    if (firstInstallTime) {
        messageBodyTemplate += `First time install: ${firstInstallTime}`
    }

    if (screenName) messageBodyTemplate += `Place: ${screenName}\n`
    if (error) messageBodyTemplate += `Error: ${await describeError(error)}\n`
    if (email) messageBodyTemplate += `Email: ${email}\n`
    const mailToUrlString = `mailto:${supportMail}?subject=${encodeURIComponent(
        messageSubject,
    )}&body=${encodeURIComponent(messageBodyTemplate)}`
    const canOpenUrl = await Linking.canOpenURL(mailToUrlString)

    if (canOpenUrl) {
        Linking.openURL(mailToUrlString)
    }
}
