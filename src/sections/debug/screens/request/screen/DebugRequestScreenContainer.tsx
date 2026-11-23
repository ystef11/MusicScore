import React, { useCallback, useEffect } from 'react'
import { View } from 'react-native'
import { useActions, useValues } from '@ug/store'
import { debugStore } from '@mu-native/debug'
import DebugRequestScreenComponent from './DebugRequestScreenComponent'

const DebugRequestScreenContainer = () => {
    const actions = useActions({ setRequest: debugStore.actions.setRequest })

    const [request] = useValues([debugStore.props.getRequest])

    useEffect(() => {
        return () => {
            actions.setRequest(null)
        }
    }, [])

    if (!request) return <View />

    return <DebugRequestScreenComponent request={request} />
}

export default DebugRequestScreenContainer

export type TDebugRequestScreenContainer = typeof DebugRequestScreenContainer
