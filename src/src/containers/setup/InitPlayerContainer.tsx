import { useEffect } from 'react'
import TrackPlayer, { AppKilledPlaybackBehavior, Capability } from 'react-native-track-player'

export const InitPlayerContainer = () => {
    useEffect(() => {
        ;(async () => {
            try {
                await TrackPlayer.setupPlayer()
                TrackPlayer.setVolume(0)
            } catch (error) {
                // Player is already initialized, which is fine
                // This can happen during app state changes or component remounts
                if (error instanceof Error && !error.message.includes('already been initialized')) {
                    // Only re-throw if it's a different error
                    throw error
                }
            }

            await TrackPlayer.updateOptions({
                // Media controls capabilities
                capabilities: [Capability.Play, Capability.Pause, Capability.SeekTo],
                progressUpdateEventInterval: 1,
                android: {
                    // Stop playback when app is killed to prevent ANR on next launch.
                    // ContinuePlayback leaves the service in a zombie state that conflicts
                    // with React Native reinitialization.
                    appKilledPlaybackBehavior:
                        AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
                },
                notificationCapabilities: [Capability.Play, Capability.Pause, Capability.SeekTo],
            })
        })()
    }, [])

    return null
}
