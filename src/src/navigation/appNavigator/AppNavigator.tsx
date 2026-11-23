import { memo } from 'react'

import { RootNavigator } from '@mu-native/navigation'
import { performanceLogService } from '@mu-native/performance'

import { appStack } from './appStack'

const handleReady = () => {
    requestAnimationFrame(performanceLogService.handleAppStart)
}

export const AppNavigator = memo(() => (
    <RootNavigator screenOptions={{ headerShown: false }} stack={appStack} onReady={handleReady} />
))
