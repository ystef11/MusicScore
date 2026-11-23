import { useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'

export const useNavigationListeners = (
    onFocus: () => void | undefined,
    onBlur: () => void | undefined,
): void => {
    const navigation = useNavigation()
    useEffect(() => {
        const unsubscribeFocus = navigation.addListener('focus', onFocus)
        const unsubscribeBlur = navigation.addListener('blur', onBlur)

        return () => {
            unsubscribeFocus()
            unsubscribeBlur()
        }
    }, [onFocus, onBlur])
}
