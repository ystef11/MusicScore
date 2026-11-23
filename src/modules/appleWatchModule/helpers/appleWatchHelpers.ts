import { sendMessage, watchEvents } from 'react-native-watch-connectivity'

import { platform } from '@mu-native/common'

import { TMessageKeys, TMessageKeysFromWatch, TMessagesValues } from '../types/appleWatchTypes'

export const sendMessageToWatch = ({
    key,
    value,
}: {
    key: TMessageKeys
    value: boolean | string | number
}) => {
    if (!platform.isIos) return
    sendMessage(
        { [key]: value },
        reply => {
            console.log(reply)
        },
        error => {
            if (error) {
                console.log(
                    'The message cant be sent! The watchOS application is probably not running in the foreground! 🤔',
                )
            }
        },
    )
}

export const getMessageFromApp = ({
    value,
    callback,
}: {
    value: TMessageKeysFromWatch
    callback: (message?: boolean | number) => void
}) => {
    if (!platform.isIos) return () => null

    return watchEvents.on('message', (message: TMessagesValues) => {
        // @ts-ignore
        if (message[value] !== undefined) {
            console.log('RN - Received message from Watch', message)
            callback(message[value])
        }
    })
}
