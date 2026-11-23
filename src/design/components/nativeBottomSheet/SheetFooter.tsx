import { type ReactElement, useEffect, useRef } from 'react'
import { useWindowDimensions, View } from 'react-native'
import { useSafeAreaFrame } from 'react-native-safe-area-context'
import { FittedSheet, type FittedSheetParams, type FittedSheetRef } from 'react-native-sheet2'

type TProps = {
    children: ReactElement
    fullScreen?: boolean
}

const params: FittedSheetParams = {
    useInlinePresentation: true,
    presentationStyle: 'footer',
    dismissable: false,
    overlayOpacity: 0,
    topLeftRightCornerRadius: 0,
    backgroundColor: 'transparent',
}

export const SheetFooter = (props: TProps) => {
    const sheetRef = useRef<FittedSheetRef>(null)
    const { width, height: frameHeight } = useSafeAreaFrame()
    const { height: windowHeight } = useWindowDimensions()
    // On Android the footer root ends below the status bar, so the frame height overflows it.
    const height = Math.min(frameHeight, windowHeight)

    useEffect(() => {
        requestAnimationFrame(() => {
            sheetRef.current?.show()
        })
    }, [])

    return (
        <FittedSheet ref={sheetRef} params={params}>
            {props.fullScreen ? (
                <View style={{ width, height }}>{props.children}</View>
            ) : (
                props.children
            )}
        </FittedSheet>
    )
}
