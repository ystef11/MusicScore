import { useEffect } from 'react'
import { BackHandler, NativeEventSubscription } from 'react-native'

import { platform } from '@mu-native/common'
import { useActions, useValues } from '@ug/store'

import { tourInstallScreenStoreChunk } from '../store/tourInstallScreenStoreChunk'

export const useHardwareBackPress = () => {
    const actions = useActions({
        setPrevStep: tourInstallScreenStoreChunk.actions.setPrevStep,
    })
    const [routeSource] = useValues([tourInstallScreenStoreChunk.props.getRouteSource])

    // "<-" button
    const onKeyUpAction = () => {
        if (routeSource) return false

        actions.setPrevStep()

        return true
    }

    useEffect(() => {
        if (!platform.isAndroid) return undefined

        const listener: NativeEventSubscription = BackHandler.addEventListener(
            'hardwareBackPress',
            onKeyUpAction,
        )

        return () => listener.remove()
    }, [routeSource])
}
