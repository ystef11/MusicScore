import React, { useCallback, useEffect } from 'react'
import { useActions, useValues } from '@ug/store'
import { debugStore, debugThunks } from '@mu-native/debug'
import { NavigationService, Screen } from '@mu-native/navigation'
import DebugScreenComponent from './DebugScreenComponent'

const DebugScreenContainer = () => {
    const actions = useActions({
        reset: debugStore.actions.reset,
        setIsEnabled: debugStore.actions.setIsEnabled,
        shareAllEvents: debugThunks.shareAllEvents,
        shareAllRequests: debugThunks.shareAllRequest,
    })

    const [analytics, api] = useValues([debugStore.props.getAnalytics, debugStore.props.getApi])

    useEffect(() => {
        return () => {
            actions.setIsEnabled(true)
        }
    }, [])

    const handleAnalytics = useCallback(() => {
        NavigationService.navigate(Screen.debugAnalytics)
    }, [])

    const handleAnalyticsShare = useCallback(() => {
        actions.shareAllEvents()
    }, [])

    const handleApi = useCallback(() => {
        NavigationService.navigate(Screen.debugApi)
    }, [])

    const handleApiShare = useCallback(() => {
        actions.shareAllRequests()
    }, [])

    const handleReset = useCallback(() => {
        actions.reset()
    }, [])

    return (
        <DebugScreenComponent
            analyticsCount={analytics.length}
            apiCount={api.length}
            onAnalytics={handleAnalytics}
            onAnalyticsShare={handleAnalyticsShare}
            onApi={handleApi}
            onApiShare={handleApiShare}
            onReset={handleReset}
        />
    )
}

export default DebugScreenContainer

export type TDebugScreenContainer = typeof DebugScreenContainer
