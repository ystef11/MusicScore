import { useState, useEffect } from 'react'
import { Keyboard } from 'react-native'

export const useKeyboardListener = (actions?: () => void) => {
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)

    useEffect(() => {
        const keyboardDidShow = () => setIsKeyboardVisible(true)
        const keyboardDidHide = () => setIsKeyboardVisible(false)

        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', keyboardDidShow)
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', keyboardDidHide)

        return () => {
            keyboardDidShowListener?.remove()
            keyboardDidHideListener?.remove()
            // eslint-disable-next-line no-unused-expressions
            actions && actions()
        }
    }, [])

    return { isKeyboardVisible, setIsKeyboardVisible }
}
