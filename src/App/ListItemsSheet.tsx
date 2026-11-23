import { memo, useEffect, useRef, useState } from 'react'

import { NativeBottomSheet, NativeBottomSheetRef } from '@mu-native/ds'
import { appEventsEmitter } from '@mu-native/system'

import { ActionSheetItemsView } from './Components/ActionSheetModal/ActionSheetItems.tsx'

export const ListItemsSheet = memo(() => {
    const [items, setItems] = useState<
        { text: string; selected: boolean; onPress: () => void }[] | undefined
    >(undefined)
    const sheetRef = useRef<NativeBottomSheetRef>(null)
    useEffect(() => {
        if (items) sheetRef.current?.present()
        return appEventsEmitter.on('presentListItemsSheet', newItems => {
            setItems(
                newItems.map((i: any) => ({
                    ...i,
                    onPress: () => {
                        i.onPress()
                        sheetRef?.current?.dismiss()
                    },
                })),
            )
        })
    }, [items])

    if (!items) return null

    const onDismiss = () => setItems(undefined)

    return (
        <NativeBottomSheet ref={sheetRef} onDismiss={onDismiss} minHeight={300}>
            <ActionSheetItemsView items={items} />
        </NativeBottomSheet>
    )
})
