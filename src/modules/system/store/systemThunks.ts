import { presentAlert } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

const showConfirmDeleteAccount = async (action: () => void) => {
    const id = await presentAlert({
        cancelable: true,
        rawTitle: translate('native.screen_profile.want_to_delete_account'),
        rawMessage: translate('native.screen_profile.account_will_be_removed'),
        buttons: [
            {
                rawText: translate('native.screen_profile.delete_account'),
                style: 'destructive',
                id: 'delete',
            },
        ],
    })
    if (id === 'delete') action()
}

const showConfirmLogout = async (action: () => void) => {
    const id = await presentAlert({
        cancelable: true,
        rawTitle: translate('native.screen_profile.want_to_logout'),
        buttons: [
            {
                rawText: translate('native.screen_profile.logout'),
                style: 'destructive',
                id: 'delete',
            },
        ],
    })
    if (id === 'delete') action()
}

const showNewConfirmDeleteAccount = async (action: () => void) => {
    const id = await presentAlert({
        cancelable: true,
        rawTitle: translate('native.screen_profile.be_careful'),
        rawMessage: translate('native.screen_profile.be_careful_delete_account'),
        buttons: [
            {
                rawText: translate('native.screen_profile.logout'),
                style: 'destructive',
                id: 'delete',
            },
        ],
    })
    if (id === 'delete') action()
}

export const systemThunks = {
    showConfirmDeleteAccount,
    showConfirmLogout,
    showNewConfirmDeleteAccount,
}
