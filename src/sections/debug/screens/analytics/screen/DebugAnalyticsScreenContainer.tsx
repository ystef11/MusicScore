import React from 'react'
import { useValues } from '@ug/store'
import { debugStore } from '@mu-native/debug'
import DebugAnalyticsScreenComponent from './DebugAnalyticsScreenComponent'

const DebugAnalyticsScreenContainer = () => {
    const [analytics] = useValues([debugStore.props.getAnalytics])

    return <DebugAnalyticsScreenComponent data={analytics} />
}

export default DebugAnalyticsScreenContainer

export type TDebugAnalyticsScreenContainer = typeof DebugAnalyticsScreenContainer
