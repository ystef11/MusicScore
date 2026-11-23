import { memo, useEffect, useRef } from 'react'

import { getIsAuthorized } from '@mu-native/auth'
import { billingThunks, marketingStoreChunk } from '@mu-native/marketing'
import { systemStoreChunk } from '@mu-native/system'
import { useActions, useValues } from '@ug/store'

export const UpdateRightsContainer = memo(() => {
    const [network, isAuthorized] = useValues([systemStoreChunk.props.getNetwork, getIsAuthorized])
    const prevAuth = useRef(isAuthorized)
    const { getAllAccessRightsThunk, setResetMarketingStore } = useActions({
        getAllAccessRightsThunk: billingThunks.getAllAccessRightsThunk,
        setResetMarketingStore: marketingStoreChunk.actions.setResetMarketingStore,
    })

    useEffect(() => {
        if (network?.isConnected) {
            getAllAccessRightsThunk()
        }
    }, [network?.isConnected, isAuthorized])

    useEffect(() => {
        if (!isAuthorized && prevAuth.current) setResetMarketingStore()
    }, [isAuthorized])

    return null
})
