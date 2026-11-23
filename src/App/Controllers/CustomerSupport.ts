import { NativeModules } from 'react-native'

import { authStoreChunk, getIsAuthorized } from '@mu-native/auth'
import { store } from '@mu-native/common'

import { deviceModel, deviceId, systemName, systemVersion, appRelease } from '../Utils/Platform'
import { TCommonState } from '@ug/store'

const { CustomerSupportModule } = NativeModules

function getCustomFields(state: TCommonState) {
    const user = authStoreChunk.props.getUser(state)
    const fields: Record<string, string | undefined> = {
        Email: `${user?.email || 'Unknown'}`,
        App: appRelease,
        Device: deviceId,
        Platform: `${deviceModel || 'Unknown'} / ${systemName} ${systemVersion}`,
    }
    if (getIsAuthorized(state)) {
        fields.User = user?.id?.toString() || undefined
        fields.username = user?.name || undefined
    }
    return fields
}

let didLoginUser = false
let didLoginUnidentified = false
export function logout() {
    didLoginUser = false
    CustomerSupportModule?.logout?.()
}
export async function setupIdentity() {
    if (didLoginUser) return
    const state = store.getState()
    const email = authStoreChunk.props.getUser(state)?.email
    const customFields = getCustomFields(state)
    const conversationsEnabled = getIsAuthorized(state)

    didLoginUser = true
    if (didLoginUnidentified) {
        await CustomerSupportModule?.logout?.()
        didLoginUnidentified = true
    }

    await CustomerSupportModule.setupIdentity({
        email: email ?? undefined,
        conversationsEnabled,
        customFields,
    })
}
export async function showHelpCenter() {
    if (!didLoginUnidentified && !didLoginUser) {
        await CustomerSupportModule.loginUnidentified()
        didLoginUnidentified = true
    }
    CustomerSupportModule.showHelpCenter()
}

export async function showConversations() {
    await setupIdentity()
    CustomerSupportModule.showConversations()
}
export async function resetIdentity() {
    didLoginUser = false
    didLoginUnidentified = false
    await CustomerSupportModule?.logout?.()
}
