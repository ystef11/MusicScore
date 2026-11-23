import React from 'react'
import { useValues } from '@ug/store'
import { debugStore } from '@mu-native/debug'
import DebugApiScreenComponent from './DebugApiScreenComponent'

const DebugApiScreenContainer = () => {
    const [api] = useValues([debugStore.props.getApi])

    return <DebugApiScreenComponent data={api} />
}

export default DebugApiScreenContainer

export type TDebugApiScreenContainer = typeof DebugApiScreenContainer
