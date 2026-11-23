import { createContext, useContext } from 'react'

import { layout } from '../../constants/layout'

/**
 * Horizontal inset (points) to use for content inside a bottom sheet. Compact
 * (width-capped) sheets provide a small inset; elsewhere consumers fall back to
 * the default screen-edge margin, so list cells / sections used outside sheets
 * are unaffected.
 */
export const SheetInsetContext = createContext<number | undefined>(undefined)

export const useSheetHorizontalInset = () =>
    useContext(SheetInsetContext) ?? layout.baseMarginFromEdges
