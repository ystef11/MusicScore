import { Dimensions, StyleSheet } from 'react-native'
import { initialWindowMetrics } from 'react-native-safe-area-context'

import { platform } from '@mu-native/common/constants/platform'

import { getResponsiveSizeExtended, layoutHelpers } from '../helpers/layout'

import { colors } from './colors'

const fullScreenWidth = Dimensions.get('window').width
const fullScreenHeight = Dimensions.get('window').height

const shadowElevation = (value: number) => ({
    elevation: value,
    shadowOffset: {
        width: 0,
        height: 1,
    },
    shadowColor: 'black',
    shadowOpacity: value / 10,
})

const imageMaxHeight = fullScreenWidth * (platform.isTablet ? 1 : 1648 / 1338)

type SafeAreaRect = {
    bottom: number
    left: number
    right: number
    top: number
    bottomWithAndroid: number
}
let _safeArea!: SafeAreaRect

export function staticSafeArea(): SafeAreaRect {
    if (_safeArea) return _safeArea
    const data = initialWindowMetrics
    if (!data?.insets) return { bottom: 0, left: 0, right: 0, top: 0, bottomWithAndroid: 16 }
    _safeArea = {
        ...data.insets,
        bottomWithAndroid: data.insets.bottom === 0 ? 16 : data.insets.bottom,
    }
    return _safeArea
}

export const layout = {
    fullScreenWidth,
    fullScreenHeight,
    maxWidthTabletContainer: 560,
    maxTabletWidth: 848,
    // Cap width for bottom sheets on tablets / in landscape so they don't stretch full-width.
    maxSheetWidthCompact: 375,
    margin3Xs: 2,
    marginXs: 4,
    marginSm: 8,
    marginXm: 12,
    marginMd: 16,
    marginLg: 24,
    marginXl: 32,
    marginXxl: 42,
    baseMarginFromEdges: platform.isTablet ? 64 : 20,
    baseMaxWidth: Dimensions.get('window').width - (platform.isTablet ? 64 : 20) * 2,
    shadowElevation,
    imageMaxHeight,
} as const

// Fraction of an extra item kept visible at the trailing edge so a horizontal
// carousel reads as scrollable.
const CAROUSEL_PEEK = 0.12

// Single source of truth for horizontal-carousel item sizing. Returns the width
// for one item so that ~targetWidth-sized items fit across the content area with
// a peek of the next, keeping every carousel (songbooks, score grids, ...) on
// the same module scale instead of independent phone-fixed widths.
export const getCarouselItemWidth = (
    screenWidth: number,
    targetWidth: number,
    gap: number = layout.marginMd,
): number => {
    const available = screenWidth - layout.baseMarginFromEdges * 2
    const count = Math.max(1, Math.round(available / targetWidth))
    return (available - gap * count) / (count + CAROUSEL_PEEK)
}

export const globalStyles = StyleSheet.create({
    flex1: { flex: 1 },
    flex1FullWidth: { flex: 1, width: '100%' },
    fullWidth: { width: '100%' },
    flex1FullWidthCenterPadding: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        padding: getResponsiveSizeExtended(20),
    },
    flex1FullWidthRow: { flex: 1, width: '100%', flexDirection: 'row' },
    flex1FullWidthWhite: { flex: 1, width: '100%', backgroundColor: colors.white },
    zeroOpacity: { opacity: 0 },
    flexShrink: { flexShrink: 1 },
    brandStyleBorderRadius: { borderRadius: 2 },
    zeroHorizontalPadding: { paddingHorizontal: 0 },
    paddingVertical12: { paddingVertical: getResponsiveSizeExtended(12) },
    horizontalPadding20: { paddingHorizontal: getResponsiveSizeExtended(20) },
    padding20: { padding: getResponsiveSizeExtended(20) },
    paddingBottom20: { paddingBottom: getResponsiveSizeExtended(20) },
    paddingBottom40: { paddingBottom: getResponsiveSizeExtended(40) },
    paddingTop20: { paddingTop: getResponsiveSizeExtended(20) },
    paddingTop4: { paddingTop: getResponsiveSizeExtended(4) },
    paddingVertical20: { paddingVertical: getResponsiveSizeExtended(20) },
    paddingTop0: { paddingTop: 0 },
    flexDirectionRow: { flexDirection: 'row' },
    alignItemsCenter: { alignItems: 'center' },
    justifyContentCenter: { justifyContent: 'center' },
    alignSelfCenter: { alignSelf: 'center' },
    mr0: { marginRight: 0 },
    mb0: { marginBottom: getResponsiveSizeExtended(0) },
    mb2: { marginBottom: getResponsiveSizeExtended(2) },
    mb4: { marginBottom: getResponsiveSizeExtended(4) },
    mt4: { marginTop: getResponsiveSizeExtended(4) },
    mt2: { marginTop: getResponsiveSizeExtended(2) },
    mt20: { marginTop: getResponsiveSizeExtended(20) },
    mt16: { marginTop: getResponsiveSizeExtended(16) },
    mb8: { marginBottom: getResponsiveSizeExtended(8) },
    mb12: { marginBottom: getResponsiveSizeExtended(12) },
    pb12: { paddingBottom: getResponsiveSizeExtended(12) },
    pt12: { paddingTop: getResponsiveSizeExtended(12) },
    pt8: { paddingTop: getResponsiveSizeExtended(8) },
    mb16: { marginBottom: getResponsiveSizeExtended(16) },
    mb24: { marginBottom: getResponsiveSizeExtended(24) },
    mh16: { marginHorizontal: getResponsiveSizeExtended(16) },
    mb32: { marginBottom: getResponsiveSizeExtended(32) },
    ml12: { marginLeft: getResponsiveSizeExtended(12) },
    ml4: { marginLeft: getResponsiveSizeExtended(4) },
    ml8: { marginLeft: getResponsiveSizeExtended(8) },
    mv0: { marginVertical: getResponsiveSizeExtended(0) },
    mv8: { marginVertical: getResponsiveSizeExtended(8) },
    lineHeight20: { lineHeight: layoutHelpers.getResponsiveSizeExtended(20) },
    textAlignCenter: { textAlign: 'center' },
    relative: { position: 'relative' },
    absolute: { position: 'absolute' },
})

export const ebooksLayout = {
    listSectionHeight: 212 + 8 + 40,
    listItemWidth: 160,
    categoryItemHeight: 176,
    twoColumnItemWidth:
        (Dimensions.get('window').width - layout.baseMarginFromEdges * 2) / 2 - 40 / 2,
}
