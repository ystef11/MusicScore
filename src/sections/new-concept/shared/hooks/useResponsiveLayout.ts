import { useWindowDimensions } from 'react-native'

import { getCarouselItemWidth } from '@mu-native/ds'

// Width at/above which the canvas is treated as "wide" (regular size class):
// iPads and large phones in landscape. Below this we fall back to a single
// phone-width column. Reactive via useWindowDimensions, so it follows rotation
// and iPad split-view/slide-over resizes.
export const WIDE_LAYOUT_BREAKPOINT = 700

// Cap content width on wide canvases so rows/forms don't stretch edge-to-edge
// across a 13" iPad. Mirrors layout.maxTabletWidth.
export const WIDE_CONTENT_MAX_WIDTH = 848

export type TResponsiveLayout = {
    width: number
    isWide: boolean
    /** Column count for score/result grids. */
    scoreColumns: number
    /**
     * Width for one item in a horizontal carousel, sized so ~targetWidth items
     * fit across the canvas with a peek of the next. Backed by the shared
     * getCarouselItemWidth so every carousel stays on the same module scale.
     */
    carouselItemWidth: (targetWidth: number, gap?: number) => number
}

export const useResponsiveLayout = (): TResponsiveLayout => {
    const { width } = useWindowDimensions()
    const isWide = width >= WIDE_LAYOUT_BREAKPOINT

    return {
        width,
        isWide,
        scoreColumns: isWide ? 2 : 1,
        carouselItemWidth: (targetWidth: number, gap?: number) =>
            getCarouselItemWidth(width, targetWidth, gap),
    }
}
