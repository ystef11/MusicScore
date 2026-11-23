import { memo, useEffect, useRef } from 'react'
import { VolumeManager } from 'react-native-volume-manager'
import { useReachability } from 'react-native-watch-connectivity'

import { getMessageFromApp, sendMessageToWatch } from '@mu-native/apple-watch-module'
import debounce from 'lodash.debounce'

import { MSScoreT } from '../types/scoreTypes.ts'

const debounceDisableVolume = debounce(isEditVolume => {
    setTimeout(() => {
        isEditVolume.current = false
    }, 300)
})

export const AppleWatchSendDataContainer = memo(({ score }: { score: MSScoreT | null }) => {
    const isReachable = useReachability()
    const isEditVolume = useRef(false)

    const checkCurrentVolumeValue = async () => {
        isEditVolume.current = true
        const { volume } = await VolumeManager.getVolume()

        sendMessageToWatch({
            key: 'volume',
            value: volume,
        })
        setTimeout(() => {
            isEditVolume.current = false
        }, 1000)
    }

    useEffect(() => {
        if (!isReachable || !score?.title) return undefined

        sendMessageToWatch({
            key: 'songName',
            value: score?.title,
        })
        checkCurrentVolumeValue()

        const unsubscribeCheckSongName = getMessageFromApp({
            value: 'isCheckSongName',
            callback: () => {
                sendMessageToWatch({
                    key: 'songName',
                    value: score?.title || '',
                })
                checkCurrentVolumeValue()
            },
        })

        const unsubscribeVolumeListener = getMessageFromApp({
            value: 'volume',
            callback: volume => {
                isEditVolume.current = true
                VolumeManager.setVolume(volume as number)
                VolumeManager.showNativeVolumeUI({ enabled: true })
                debounceDisableVolume(isEditVolume)
            },
        })

        const volumeListener = VolumeManager.addVolumeListener(result => {
            if (!isEditVolume.current) {
                VolumeManager.showNativeVolumeUI({ enabled: true })
                sendMessageToWatch({
                    key: 'volume',
                    value: result.volume,
                })
            }
        })

        return () => {
            volumeListener.remove()
            unsubscribeCheckSongName()
            unsubscribeVolumeListener()
            sendMessageToWatch({
                key: 'songName',
                value: '',
            })
        }
    }, [score, isReachable])

    return null
})
