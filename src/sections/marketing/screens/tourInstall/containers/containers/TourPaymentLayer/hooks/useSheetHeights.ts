import { useWindowDimensions } from 'react-native'

import { platform } from '@mu-native/common'

export const useSheetHeights = () => {
    const { height } = useWindowDimensions()

    const sheetHeight = Math.min(
        platform.isTablet ? height * 0.64 : height * (platform.isAndroid ? 0.66 : 0.8),
        height,
    )
    const collapsedHeight = platform.isTablet ? undefined : Math.min(height * 0.66, 560, sheetHeight)

    return { sheetHeight, collapsedHeight }
}
