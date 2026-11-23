import { useEffect, useRef, useState } from 'react'

import { NativeBottomSheetRef } from '@mu-native/ds'
import { useAppNavigation } from '@mu-native/navigation'

import { type AppEvents, appEventsEmitter } from './app.events'

export function useSheetPresentable(eventName: keyof AppEvents) {
    let navigation: any | undefined
    try {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        navigation = useAppNavigation()
    } catch {
        navigation = undefined
    }
    const isMounted = useRef(true)
    const sheetRef = useRef<NativeBottomSheetRef>(null)
    const [isPresent, setPresent] = useState(false)

    useEffect(() => {
        const cleaner = appEventsEmitter.on(eventName, () => {
            setPresent(prev => !prev)
        })

        if (isPresent && !isMounted.current) {
            setPresent(false)
            return cleaner
        }
        if (isPresent) sheetRef.current?.present()
        return () => {
            cleaner()
        }
    }, [eventName, isPresent])

    useEffect(() => {
        isMounted.current = true
        const focus = navigation?.addListener('focus', () => {
            isMounted.current = true
        })
        const blur = navigation?.addListener('blur', () => {
            isMounted.current = false
        })

        return () => {
            isMounted.current = false
            focus?.()
            blur?.()
        }
    }, [navigation])

    return { isPresent, setPresent, sheetRef }
}
