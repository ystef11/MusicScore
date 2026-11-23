import { useEffect } from 'react'
import NetInfo, { NetInfoState } from '@react-native-community/netinfo'
import { useActions } from '@ug/store'

import { systemStoreChunk } from '../store/systemStoreChunk'

export const useNetInfo = (isAuthorized: boolean) => {
    const actions = useActions({
        setNetwork: systemStoreChunk.actions.setNetwork,
    })

    useEffect(() => {
        NetInfo.fetch().then(state => {
            actions.setNetwork(state)
        })
        const handleChangeState = (state: NetInfoState) => {
            actions.setNetwork(state)
        }

        const unsubscribe = NetInfo.addEventListener(handleChangeState)

        return () => unsubscribe()
    }, [isAuthorized])
}
