import { presentAlert } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

import { bugReportAction } from '../../../App/actions/bugReportActionsAsync'

export const reportError = async (
    error: any,
    from: 'Apple' | 'Google' | 'Facebook',
    code?: string,
) => {
    let message = error ? error.message : ''
    if (code) message = `${message}\ncode: ${code}`
    if (error.status) message = `${message} status: ${error.status}`
    if (error.code) message = `${message} code: ${error.code}`
    if (error.cause) message = `${message} cause: ${error.cause}`
    if (error.message) message = `${message} message: ${error.message}`
    const id = await presentAlert({
        rawTitle: translate('native.alerts.error_login_facebook.title'),
        rawMessage: message,
        cancelable: true,
        buttons: [{ rawText: translate('native.reportIssueButton'), id: 'report', style: 'default' }],
    })
    if (id === 'report') {
        bugReportAction({}, from, error)
    }
}
