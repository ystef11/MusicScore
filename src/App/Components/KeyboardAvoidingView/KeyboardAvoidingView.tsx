import { useState, useEffect } from 'react'
import {
    Keyboard,
    KeyboardAvoidingView as OriginalKeyboardAvoidingView,
    type KeyboardEvent,
} from 'react-native'

import { device } from '@mu-native/common'

import { isIOS } from '../../Utils/Platform'

const useIsFloatingKeyboard = () => {
    const [isFloating, setFloating] = useState(false)
    const windowWidth = device.screenData.width

    const onKeyboardWillChangeFrame = (event: KeyboardEvent) => {
        setFloating(event.endCoordinates.width !== windowWidth)
    }

    useEffect(() => {
        const keyboardListener = Keyboard.addListener(
            'keyboardWillChangeFrame',
            onKeyboardWillChangeFrame,
        )
        return () => {
            keyboardListener?.remove()
        }
    }, [])
    return isFloating
}

const KeyboardAvoidingViewIos = ({ children, ...props }: any) => {
    const isFloatingKeyboard = useIsFloatingKeyboard()
    return (
        <OriginalKeyboardAvoidingView behavior="padding" enabled={!isFloatingKeyboard} {...props}>
            {children}
        </OriginalKeyboardAvoidingView>
    )
}

const KeyboardAvoidingViewAndroid = ({ children, ...props }: any) => {
    return (
        <OriginalKeyboardAvoidingView behavior="height" {...props}>
            {children}
        </OriginalKeyboardAvoidingView>
    )
}

const KeyboardAvoidingView = isIOS ? KeyboardAvoidingViewIos : KeyboardAvoidingViewAndroid
export default KeyboardAvoidingView
