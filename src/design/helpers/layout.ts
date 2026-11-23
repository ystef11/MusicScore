import { Dimensions, PixelRatio } from 'react-native'

import { platform } from '@mu-native/common/constants/platform'

const { isTablet, deviceModelId, pixelRatio, deviceModel } = platform

const smallScreenIOSDevicesModels = ['iPhone 5', 'iPhone 5s', 'iPhone 5c', 'iPhone SE']
const smallScreenIOSDevicesIds = [
    'iPhone8,4', // iPhone SE (1st)
]
export const isSmallScreenAndroid =
    platform.isAndroid && pixelRatio <= 2.5 && Dimensions.get('window').height < 750
export const isSmallScreenIos =
    smallScreenIOSDevicesModels.includes(deviceModel) ||
    smallScreenIOSDevicesIds.includes(deviceModelId)
export const isSmallScreenDevice = isSmallScreenAndroid || isSmallScreenIos
export const isSmallScreenIOSTablet: boolean =
    deviceModel.startsWith('iPad Mini') || deviceModel.endsWith('9.7-inch')

export const getResponsiveSize = (size: number): number => (isTablet ? size * 1.5 : size)

export const getResponsiveSizeExtended = (size: number): number => {
    if (isSmallScreenIOSTablet) return size * 1.2
    if (platform.isTablet) return size * 1.4
    if (isSmallScreenIos || isSmallScreenAndroid) return size * 0.8
    return size
}

const fontWeight600Android = {
    fontFamily: 'sans-serif-medium',
    fontWeight: 'normal',
} as const
const fontWeight500Android = {
    fontFamily: 'sans-serif-medium',
    fontWeight: '500',
} as const
export const fontWeight600 = platform.isIos
    ? ({ fontWeight: '600' } as const)
    : fontWeight600Android
export const fontWeight500 = platform.isIos
    ? ({ fontWeight: '500' } as const)
    : fontWeight500Android

const { width, height } = Dimensions.get('window')

const normalizeSize = (size: number) => {
    const { width, height } = Dimensions.get('window')

    const scale = (width / height) * 2
    const newSize = size * scale

    return Math.round(PixelRatio.roundToNearestPixel(newSize))
}

const responsiveSize = (value: 'string' | number, valueDirection: 'width' | 'height' = 'width') => {
    // Parse string percentage input and convert it to number.
    const elemSize = typeof value === 'number' ? value : parseFloat(value)

    const screenSize = valueDirection === 'width' ? width : height
    return PixelRatio.roundToNearestPixel((screenSize * elemSize) / 100)
}

const getUriSourceByImageUrl = (uri: string) => ({
    uri,
})

const capitalizeFirstLetter = (string: string): string =>
    string.charAt(0).toUpperCase() + string.slice(1)

export const layoutHelpers = {
    getResponsiveSizeExtended,
    getResponsiveSize,
    normalizeSize,
    responsiveSize,
    fontWeight600,
    fontWeight500,
    fontWeight600Android,
    isSmallScreenIos,
    isSmallScreenAndroid,
    isSmallScreenIOSTablet,
    isSmallScreenDevice,
    getUriSourceByImageUrl,
    capitalizeFirstLetter,
}
