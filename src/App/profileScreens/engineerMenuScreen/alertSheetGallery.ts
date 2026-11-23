import { presentAlert, presentBottomSheetAlert } from '@mu-native/ds'
import { authorization } from '@mu-native/icons/authorization'
import { detail } from '@mu-native/icons/detail'
import { trashBin } from '@mu-native/icons/trashBin'

type TAlertSheetCase = {
    label: string
    run: () => Promise<string | undefined>
}

const LONG_TITLE = 'This score is not available in your country and cannot be opened right now'
const LONG_MESSAGE =
    'The copyright holder has not made this arrangement available in your region. ' +
    'You can browse other arrangements of the same piece, or open it later from another country.'

/**
 * Every alert shape the app actually uses, plus the stress cases none of the call sites
 * reach. Each entry names the flow it mirrors so a visual oddity can be traced back.
 */
export const alertSheetGallery: TAlertSheetCase[] = [
    {
        label: 'Notice · title only — blocked score',
        run: () => presentAlert({ rawTitle: 'Score blocked' }),
    },
    {
        label: 'Notice · title + message — download failed',
        run: () => presentAlert({ rawTitle: 'Error', rawMessage: 'Download failed' }),
    },
    {
        label: 'Confirm · destructive — logout',
        run: () =>
            presentAlert({
                cancelable: true,
                rawTitle: 'Are you sure you want to logout?',
                buttons: [{ rawText: 'Logout', style: 'destructive', id: 'logout' }],
            }),
    },
    {
        label: 'Confirm · message + destructive — delete account',
        run: () =>
            presentAlert({
                cancelable: true,
                rawTitle: 'Are you sure you want to delete your account?',
                rawMessage:
                    'Your account will be removed and all account information deleted. ' +
                    'This action cannot be undone.',
                buttons: [{ rawText: 'Delete account', style: 'destructive', id: 'delete' }],
            }),
    },
    {
        label: 'Confirm · explicit default + cancel — mixer long press',
        run: () =>
            presentAlert({
                rawTitle: 'Enable playback of all parts?',
                buttons: [
                    { rawText: 'Submit', style: 'default', id: 'submit' },
                    { rawText: 'Cancel', style: 'cancel', id: 'cancel' },
                ],
            }),
    },
    {
        label: 'Modal · cancelable false — score failed to load',
        run: () =>
            presentAlert({
                rawTitle: 'Error',
                rawMessage: 'Network request failed',
                cancelable: false,
                buttons: [{ rawText: 'Close', style: 'default', id: 'close' }],
            }),
    },
    {
        label: 'Modal · single button — try again',
        run: () =>
            presentAlert({
                rawTitle: 'Oops!',
                rawMessage:
                    'The app seems to be turned off in the background, please try refreshing',
                buttons: [{ rawText: 'Go back', style: 'default', id: 'goBack' }],
            }),
    },
    {
        label: 'Menu · two rows with icons — profile',
        run: () =>
            presentBottomSheetAlert({
                cancelable: true,
                buttons: [
                    { rawText: 'Logout', id: 'logout', icon: authorization, style: 'default' },
                    { rawText: 'More actions', id: 'more', icon: detail, style: 'default' },
                ],
            }),
    },
    {
        label: 'Menu · destructive row with icon — delete account',
        run: () =>
            presentBottomSheetAlert({
                cancelable: true,
                buttons: [
                    {
                        rawText: 'Delete account',
                        style: 'destructive',
                        id: 'delete',
                        icon: trashBin,
                    },
                ],
            }),
    },
    {
        label: 'Sheet confirm · no icons — delete set',
        run: () =>
            presentBottomSheetAlert({
                rawTitle: 'Be careful, this action cannot be undone',
                rawMessage: 'Are you sure you want to delete set My favourites',
                cancelable: true,
                buttons: [{ rawText: 'Delete set', style: 'destructive', id: 'delete' }],
            }),
    },
    {
        label: 'Theme · dark',
        run: () =>
            presentAlert({
                theme: 'dark',
                cancelable: true,
                rawTitle: 'Are you sure you want to logout?',
                buttons: [{ rawText: 'Logout', style: 'destructive', id: 'logout' }],
            }),
    },
    {
        label: 'Stress · long title and message',
        run: () =>
            presentAlert({
                cancelable: true,
                rawTitle: LONG_TITLE,
                rawMessage: LONG_MESSAGE,
                buttons: [{ rawText: 'Browse other arrangements', style: 'default', id: 'browse' }],
            }),
    },
    {
        label: 'Stress · four buttons',
        run: () =>
            presentAlert({
                cancelable: true,
                rawTitle: 'Pick a format',
                buttons: [
                    { rawText: 'PDF', style: 'default', id: 'pdf' },
                    { rawText: 'MIDI', style: 'default', id: 'midi' },
                    { rawText: 'MP3', style: 'default', id: 'mp3' },
                    { rawText: 'Delete the export', style: 'destructive', id: 'delete' },
                ],
            }),
    },
    {
        label: 'Stress · very long button label',
        run: () =>
            presentAlert({
                cancelable: true,
                rawTitle: 'Long button label',
                rawMessage: 'The button below carries far more text than any real call site.',
                buttons: [
                    {
                        rawText:
                            'Remove this score from every set it belongs to and delete the offline copy',
                        style: 'destructive',
                        id: 'delete',
                    },
                ],
            }),
    },
    {
        label: 'Stress · long row labels in a menu',
        run: () =>
            presentBottomSheetAlert({
                cancelable: true,
                buttons: [
                    {
                        rawText:
                            'Remove this score from every set it belongs to and delete every offline copy',
                        style: 'destructive',
                        id: 'delete',
                        icon: trashBin,
                    },
                    {
                        rawText: 'Sign out of this device only',
                        id: 'logout',
                        icon: authorization,
                        style: 'default',
                    },
                ],
            }),
    },
    {
        label: 'Chained · menu then confirmation',
        run: async () => {
            const id = await presentBottomSheetAlert({
                cancelable: true,
                buttons: [
                    { rawText: 'Open a confirmation', id: 'more', icon: detail, style: 'default' },
                ],
            })
            if (id !== 'more') return id
            return presentAlert({
                cancelable: true,
                rawTitle: 'Opened from the previous sheet',
                rawMessage: 'The first sheet must have closed before this one appeared.',
                buttons: [{ rawText: 'Confirm', style: 'destructive', id: 'confirm' }],
            })
        },
    },
]
