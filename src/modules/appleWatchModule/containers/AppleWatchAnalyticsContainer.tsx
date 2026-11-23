import { memo, useEffect } from 'react'
import { useReachability, watchEvents } from 'react-native-watch-connectivity'

import reportEvent from '../../../App/Utils/Analytics'

export const AppleWatchMetronomeContainer = memo(() => {
    const isReachable = useReachability()

    useEffect(() => {
        const unsubscribe = watchEvents.on(
            'message',
            ({
                isInitMainView,
                isInitMetronomeView,
                isInitScoreView,
            }: {
                isInitMainView: boolean
                isInitMetronomeView: boolean
                isInitScoreView: boolean
            }) => {
                if (isInitMainView !== undefined) {
                    reportEvent('Temp Watch Main Show')
                }
                if (isInitMetronomeView !== undefined) {
                    reportEvent('Temp Watch Metronome Settings View')
                }
                if (isInitScoreView !== undefined) {
                    reportEvent('Temp Watch Player Show')
                }
            },
        )

        return () => {
            unsubscribe()
        }
    }, [isReachable])

    return null
})
