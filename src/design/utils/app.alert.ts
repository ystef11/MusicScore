import { translate } from '@mu-native/locale/i18n'

import type { IconSource } from '../components/Icon/Icon'
import { showAlertSheet, type TAlertSheetButton } from '../components/sheets/alertSheetHost.ts'

type AlertButton = {
    id: string
    rawText?: string
    style: 'default' | 'destructive' | 'cancel'
}

type AlertParams = {
    cancelable?: boolean
    rawTitle?: string
    rawMessage?: string
    theme?: 'light' | 'dark'
    buttons?: AlertButton[]
}

type SheetAlertButton = AlertButton & { icon?: IconSource }

type SheetAlertParams = Omit<AlertParams, 'buttons'> & { buttons?: SheetAlertButton[] }

function withCancel(buttons: SheetAlertButton[], cancelable?: boolean): SheetAlertButton[] {
    const shouldAddCancel = cancelable || buttons.length === 0
    if (!shouldAddCancel || buttons.some(button => button.style === 'cancel')) return buttons
    return [
        ...buttons,
        {
            id: 'cancel',
            style: 'cancel',
            rawText: translate('native.score_action_sheet.cancel_button'),
        },
    ]
}

const toSheetButton = (button: SheetAlertButton): TAlertSheetButton => ({
    id: button.id,
    text: button.rawText ?? 'unset',
    style: button.style,
    icon: button.icon,
})

export async function presentAlert(params: AlertParams) {
    return showAlertSheet({
        kind: 'alert',
        title: params.rawTitle,
        message: params.rawMessage,
        isDark: params.theme === 'dark',
        buttons: withCancel(params.buttons ?? [], params.cancelable).map(toSheetButton),
    })
}

export async function presentBottomSheetAlert(params: SheetAlertParams) {
    const buttons = withCancel(params.buttons ?? [], params.cancelable)
    return showAlertSheet({
        // Rows exist to carry icons. A call without any is a confirmation rather than a menu,
        // so it gets the button stack — otherwise its action renders as left-aligned text.
        kind: buttons.some(button => button.icon) ? 'actions' : 'alert',
        title: params.rawTitle,
        message: params.rawMessage,
        isDark: params.theme === 'dark',
        buttons: buttons.map(toSheetButton),
    })
}
