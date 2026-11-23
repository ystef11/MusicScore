import React, { useCallback, useEffect } from 'react'
import { View } from 'react-native'
import { useActions, useValues } from '@ug/store'
import { debugStore } from '@mu-native/debug'
import DebugEventScreenComponent from './DebugEventScreenComponent'

const DebugEventScreenContainer = () => {
    const actions = useActions({ setEvent: debugStore.actions.setEvent })

    const [event] = useValues([debugStore.props.getEvent])

    useEffect(() => {
        return () => {
            actions.setEvent(null)
        }
    }, [])

    if (!event) return <View />

    return <DebugEventScreenComponent event={event} />
}

export default DebugEventScreenContainer

export type TDebugEventScreenContainer = typeof DebugEventScreenContainer
