import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
} from 'react'
import { Dimensions, Platform, StatusBar, useWindowDimensions } from 'react-native'
import { useSafeAreaFrame } from 'react-native-safe-area-context'
import {
    dismissFittedPresented,
    dismissFittedSheet,
    FittedSheet,
    FittedSheetParams,
    FittedSheetRef,
    presentFittedSheet,
    viewportSize,
} from 'react-native-sheet2'

import { platform } from '@mu-native/common/constants/platform'
import type { SheetProps } from 'react-native-sheet2/src/FittedSheet.tsx'

import { colors } from '../../constants/colors'
import { useAppSafeArea } from '../../hooks/useAppSafeArea'

import { BottomSheetHeader } from './BottomSheetHeader'
import { SheetDismissContext } from './SheetDismissContext'
import { SheetInsetContext } from './SheetInsetContext'

export { BottomSheetHeader }

export type Presentable = { present: (data?: any) => void }

export type NativeBottomSheetName =
    | 'metronomeSheet'
    | 'tempoSheet'
    | 'scoreSettingsSheet'
    | 'transposeSheet'
    | 'mixerSheet'
    | 'zoomSheet'
    | 'downloadScoreSheet'
    | 'ratingSheetView'
    | 'autogradeZoomSheet'
    | 'autogradePartSheet'

export function nativeDismissFittedSheet(name: NativeBottomSheetName) {
    dismissFittedSheet(name)
}

export function nativeDismissPresentedFittedSheet() {
    dismissFittedPresented()
}

export function nativePresentFittedSheet(name: NativeBottomSheetName, data?: any) {
    presentFittedSheet(name, data)
}

type TProps = {
    title?: string
    titleAlign?: 'center' | 'left'
    hideHandle?: boolean
    onDismiss?: (isPresent: boolean) => void
    backgroundColor?: string
    radius?: number
    enablePanDownToClose?: boolean
    children: ((data?: any) => React.ReactNode) | React.ReactNode
    maxHeight?: number
    minHeight?: number
    isDark?: boolean
    applyMaxHeightToMinHeight?: boolean
    name?: NativeBottomSheetName
    rootViewStyle?: SheetProps['rootViewStyle']
    /**
     * Cap the sheet width (points). In landscape (any device) and in portrait on
     * tablets the sheet is limited to this width and centered. When omitted the
     * sheet keeps the default full-width behaviour.
     */
    maxWidth?: number
    /**
     * On tablets, present the sheet as a floating card in the vertical centre of
     * the screen (with a full-screen dim) instead of anchored to the bottom.
     * No effect on phones. Pair with `maxWidth` so the card has a sensible width.
     */
    centerOnTablet?: boolean
    presentOnMount?: boolean
    inline?: boolean
    dismissOnOverlayTap?: boolean
    overlayOpacity?: number
    collapsedHeight?: number
    handleTestID?: string
}

export interface NativeBottomSheetRef extends Presentable {
    dismiss: () => void
    present: (data?: any) => void
}

/**
 * Top margin reserved above a bottom-anchored sheet in landscape. There is no
 * OS status bar in landscape, so without this the sheet can grow to the very
 * top edge of the screen; keep it clear of the notch / top edge.
 */
const LANDSCAPE_TOP_MARGIN = 24

export function useMaxSheetHeight() {
    const inset = useAppSafeArea({ top: StatusBar.currentHeight ?? 0 })
    if (Platform.OS === 'ios') {
        return viewportSize().height - inset.top
    }
    const { height } = Dimensions.get('screen')
    return height - inset.top
}

export const NativeBottomSheet = forwardRef<NativeBottomSheetRef, TProps>(
    (
        {
            backgroundColor,
            children,
            enablePanDownToClose,
            hideHandle,
            isDark,
            maxHeight,
            minHeight,
            onDismiss,
            radius,
            title,
            titleAlign,
            name,
            applyMaxHeightToMinHeight,
            rootViewStyle,
            maxWidth,
            centerOnTablet,
            presentOnMount,
            inline,
            dismissOnOverlayTap,
            overlayOpacity,
            collapsedHeight,
            handleTestID,
        },
        ref,
    ) => {
        const sheetRef = useRef<FittedSheetRef>(null)
        const preferredMaxHeight = useMaxSheetHeight()
        const inset = useAppSafeArea()
        const { width: windowWidth, height: windowHeight } = useWindowDimensions()
        // `useWindowDimensions` reports the display size on Android, not the app
        // window: in landscape the system lays the window out beside a display
        // cutout, so the display is wider than the window by the cutout inset
        // (which safe-area then reports as 0, there being no inset inside the
        // window). Sizing the sheet from it makes the card overflow the window
        // and clips its right edge. The safe-area frame is the real window.
        const frame = useSafeAreaFrame()

        useImperativeHandle(
            ref,
            () => ({
                present: (data?: any) => {
                    requestAnimationFrame(() => {
                        sheetRef.current?.show(data)
                    })
                },

                dismiss: (data?: any) => {
                    sheetRef.current?.hide(data)
                },
            }),
            [],
        )

        const dismiss = useCallback(() => {
            sheetRef.current?.hide()
        }, [])

        useEffect(() => {
            if (!presentOnMount) return
            requestAnimationFrame(() => {
                sheetRef.current?.show()
            })
        }, [presentOnMount])

        const isLandscape = windowWidth > windowHeight
        const isCentered = centerOnTablet && platform.isTablet
        // Reserve a top margin in landscape for bottom-anchored sheets so they
        // don't reach the top edge (no status bar exists to offset them there).
        const topMargin = isLandscape && !isCentered ? LANDSCAPE_TOP_MARGIN : 0
        const _maxHeight = (maxHeight ?? preferredMaxHeight) - topMargin
        const availableWidth = Math.max(frame.width, frame.height) - inset.left - inset.right
        // Default: full width. When `maxWidth` is set, cap in landscape (any
        // device) and in portrait on tablets, keeping phones full-width in portrait.
        const cappedWidth = maxWidth ? Math.min(maxWidth, availableWidth) : undefined
        const params = useMemo<FittedSheetParams>(() => {
            return {
                dismissable: enablePanDownToClose !== false,
                topLeftRightCornerRadius: radius ?? 1,
                maxHeight: _maxHeight,
                maxLandscapeWidth: cappedWidth ?? availableWidth,
                maxPortraitWidth: cappedWidth && platform.isTablet ? cappedWidth : undefined,
                minHeight,
                applyMaxHeightToMinHeight,
                backgroundColor: backgroundColor ?? colors.white,
                isDark,
                // On tablets show the sheet centred as a floating dialog card.
                presentationStyle: centerOnTablet && platform.isTablet ? 'center' : 'bottom',
                useInlinePresentation: inline,
                dismissOnOverlayTap,
                overlayOpacity,
                collapsedHeight,
            }
        }, [
            _maxHeight,
            applyMaxHeightToMinHeight,
            availableWidth,
            backgroundColor,
            cappedWidth,
            centerOnTablet,
            collapsedHeight,
            dismissOnOverlayTap,
            enablePanDownToClose,
            inline,
            isDark,
            minHeight,
            overlayOpacity,
            radius,
        ])

        const _onDismiss = () => {
            onDismiss?.(false)
        }

        return (
            <FittedSheet
                rootViewStyle={rootViewStyle}
                name={name}
                ref={sheetRef}
                onSheetDismiss={_onDismiss}
                params={params}
            >
                {data => {
                    return (
                        <SheetDismissContext.Provider value={dismiss}>
                            <SheetInsetContext.Provider value={maxWidth ? 20 : undefined}>
                                {!hideHandle && (
                                    <BottomSheetHeader
                                        title={title}
                                        align={titleAlign}
                                        testID={handleTestID}
                                    />
                                )}
                                {typeof children === 'function' ? children(data) : children}
                            </SheetInsetContext.Provider>
                        </SheetDismissContext.Provider>
                    )
                }}
            </FittedSheet>
        )
    },
)
