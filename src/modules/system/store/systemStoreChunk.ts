import { JSX } from 'react'
import { AppStateStatus } from 'react-native'
import { OrientationType } from 'react-native-orientation-locker'

import type { NetInfoState } from '@react-native-community/netinfo'
import { createExtendedStoreChunk } from '@ug/store'

import { getCurrentAppState } from '../helpers/getCurrentAppState'

type TSystemState = {
    appState: AppStateStatus
    deviceOrientation: string | null
    isPlainModalVisible: boolean
    keepAwake: boolean
    locale: string
    lockOrientation: string | null
    orientation: OrientationType | null
    network: NetInfoState | null
    plainModalComponent: (() => JSX.Element) | null
}

export const systemStoreChunk = createExtendedStoreChunk<TSystemState>({
    treeKey: 'modules',
    storeKey: 'settings',
})({
    initialState: {
        appState: getCurrentAppState(),
        deviceOrientation: null,
        isPlainModalVisible: false,
        keepAwake: true,
        locale: 'en',
        lockOrientation: null,
        orientation: null,
        network: null,
        plainModalComponent: null,
    },
    actions: {},
})
