import { memo, useCallback, useEffect, useRef, useState } from 'react'

import {
    NativeBottomSheet,
    type NativeBottomSheetRef,
} from '../nativeBottomSheet/NativeBottomSheet.tsx'

import { ActionSheetContent } from './ActionSheetContent.tsx'
import { AlertSheetContent } from './AlertSheetContent.tsx'
import {
    registerAlertSheetHost,
    resolveAlertSheet,
    settleAlertSheet,
    type TAlertSheetRequest,
} from './alertSheetHost.ts'

export const AppAlertHost = memo(() => {
    const [request, setRequest] = useState<TAlertSheetRequest | undefined>(undefined)
    const sheetRef = useRef<NativeBottomSheetRef>(null)
    // A request that arrives while a sheet is still on screen waits for the native dismiss to
    // land: presenting during the dismiss animation gets swallowed, and the dismiss callback
    // would otherwise wipe the request that just arrived.
    // Known limitation: react-native-sheet2 renders a single global sheet, so if present() is
    // ever swallowed because another native sheet is already showing, this host gets stuck
    // and later alerts queue without ever appearing. No current call site can reach that state.
    const queued = useRef<TAlertSheetRequest | undefined>(undefined)
    const isShown = useRef(false)
    const isDismissing = useRef(false)

    useEffect(
        () =>
            registerAlertSheetHost(next => {
                if (isShown.current) {
                    queued.current = next
                    sheetRef.current?.dismiss()
                    return
                }
                setRequest(next)
            }),
        [],
    )

    useEffect(() => {
        if (!request) return
        isShown.current = true
        sheetRef.current?.present()
    }, [request])

    const onPress = useCallback(
        (id: string) => {
            if (isDismissing.current || !request) return
            isDismissing.current = true
            resolveAlertSheet(request.token, id)
            sheetRef.current?.dismiss()
        },
        [request],
    )

    // Свайп вниз и тап по затемнению тоже должны резолвить промис, иначе он повиснет.
    const onDismiss = useCallback(() => {
        isDismissing.current = false
        const next = queued.current
        queued.current = undefined
        isShown.current = false
        if (next) {
            setRequest(next)
            return
        }
        settleAlertSheet()
        setRequest(undefined)
    }, [])

    if (!request) return null

    // No cancel-styled button means this alert stands in for a modal the user had to answer —
    // block swipe/backdrop dismissal so it behaves like the old native alert.
    const isDismissable = request.buttons.some(button => button.style === 'cancel')

    return (
        <NativeBottomSheet
            ref={sheetRef}
            onDismiss={onDismiss}
            isDark={request.isDark}
            enablePanDownToClose={isDismissable}
        >
            {request.kind === 'actions' ? (
                <ActionSheetContent request={request} onPress={onPress} />
            ) : (
                <AlertSheetContent request={request} onPress={onPress} />
            )}
        </NativeBottomSheet>
    )
})
AppAlertHost.displayName = 'AppAlertHost'
