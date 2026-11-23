import { Alert } from 'react-native'
import { store } from '@mu-native/common'

import { translate } from '@mu-native/locale'
import { systemStoreChunk } from '../store/systemStoreChunk'

let alertVisible = false

class NoConnectionError extends Error {
    constructor() {
        super('No connection')
    }
}

const alertNoNetworkConnection = (): Promise<any> => {
    return new Promise(resolve => {
        Alert.alert(
            translate('native.alerts.connection_error.title'),
            translate('native.alerts.connection_error.message'),
            [{ text: translate('native.actions.okay'), onPress: resolve }],
        )
    })
}

export const ensureNetwork = async (presentAlert = true) => {
    let network = systemStoreChunk.props.getNetwork(store.getState())
    if (!presentAlert) {
        if (!network || !network.isConnected) throw new NoConnectionError()
        return
    }
    let iterations = 0
    while (!network || !network.isConnected) {
        // eslint-disable-next-line no-await-in-loop
        await alertNoNetworkConnection()
        network = systemStoreChunk.props.getNetwork(store.getState())
        iterations++
        if (iterations >= 10) throw new NoConnectionError()
    }
}

export const checkConnection = (presentAlert = true) => {
    const network = systemStoreChunk.props.getNetwork(store.getState())
    if (network && !network?.isConnected && !alertVisible) {
        if (presentAlert) {
            alertVisible = true
            requestIdleCallback(() => {
                Alert.alert(
                    translate('native.alerts.connection_error.title'),
                    translate('native.alerts.connection_error.message'),
                    [
                        {
                            text: translate('native.actions.okay'),
                            onPress: () => {
                                alertVisible = false
                            },
                        },
                    ],
                )
            })
        }

        throw new NoConnectionError()
    }
}

export const checkConnectionSafely = () => {
    try {
        checkConnection()
        return true
    } catch (e) {
        if (e instanceof NoConnectionError) {
            return false
        }
        throw e
    }
}
