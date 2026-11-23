import { useCallback, useEffect } from 'react'
import { useReachability } from 'react-native-watch-connectivity'

import { useFocusEffect } from '@mu-native/navigation'

import reportEvent from '../../../App/Utils/Analytics.ts'
import { getMessageFromApp, sendMessageToWatch } from '../helpers/appleWatchHelpers'

export const useAppleWatchScorePlayLogic = ({
    isPlaying,
    onPress,
}: {
    isPlaying: boolean
    onPress: () => void
}) => {
    const isReachable = useReachability()

    useFocusEffect(
        useCallback(() => {
            const unsubscribe = isReachable
                ? getMessageFromApp({
                      value: 'isPlayScore',
                      callback: () => {
                          onPress()
                          reportEvent('Temp Watch Player Click', {
                              value: isPlaying ? 'pause' : 'play',
                          })
                      },
                  })
                : null

            return () => {
                if (isReachable) unsubscribe?.()
            }
        }, [isReachable]),
    )

    useEffect(() => {
        if (isReachable) {
            sendMessageToWatch({
                key: 'isPlayScore',
                value: isPlaying,
            })
        }
    }, [isReachable, isPlaying])

    useEffect(() => {
        const unsubscribe = isReachable
            ? getMessageFromApp({
                  value: 'isCheckScorePlay',
                  callback: () => {
                      sendMessageToWatch({
                          key: 'isPlayScore',
                          value: isPlaying,
                      })
                  },
              })
            : null

        return () => {
            if (isReachable) unsubscribe?.()
        }
    }, [isReachable])
}
