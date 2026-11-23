import { useMemo } from 'react'
import { StyleSheet } from 'react-native'

import { platform } from '@mu-native/common'
import { colors, layoutHelpers } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

import type { TPlanTypeSplash } from '../../../types/marketingTypes'

const { getResponsiveSizeExtended } = layoutHelpers

export const styles = StyleSheet.create({
    bgStock: {
        flex: 1,
        width: '100%',
        backgroundColor: colors.winterColor,
        flexDirection: platform.isTablet ? 'row' : 'column',
    },
    bgStockHoliday: {
        backgroundColor: colors.nyFirstColor,
    },
    bgStockSecondHoliday: {
        backgroundColor: colors.white,
    },
    buttonContainer: {
        backgroundColor: colors.winterColor,
    },
    buyButton: {
        backgroundColor: colors.nySecondColor,
        borderWidth: 0,
    },
    buyButtonHolidayBg: {
        backgroundColor: colors.nySecondColor,
    },
    bgButtonContainerHoliday: {
        backgroundColor: colors.nyFirstColor,
    },
    bgButtonContainerSecondHoliday: {
        backgroundColor: colors.white,
    },
    bgButtonSecondHoliday: {
        backgroundColor: colors.christmasFifthColor,
    },
    textWhiteColor: { color: colors.white },
    textColorSecondHoliday: {
        color: colors.white,
    },
    textDontShowSecondHolidayColor: {
        color: colors.gray500,
    },
    textHolidayColor: { color: colors.text900 },
    stockLandingImage: {
        width: '100%',
        height: getResponsiveSizeExtended(330),
    },
    stockLandingLandscapeImage: {
        transform: [{ scale: 1 }],
        marginTop: getResponsiveSizeExtended(-50),
    },
    stockLandingHolidayImage: {
        width: layoutHelpers.getResponsiveSizeExtended(300),
        marginTop: layoutHelpers.getResponsiveSizeExtended(40),
        marginBottom: layoutHelpers.getResponsiveSizeExtended(30),
        height: getResponsiveSizeExtended(300),
    },
    stockLandingHolidaySecondImage: {
        width: getResponsiveSizeExtended(330),
        height: getResponsiveSizeExtended(300),
        marginTop:
            platform.isTablet || platform.isAndroid
                ? -getResponsiveSizeExtended(30)
                : getResponsiveSizeExtended(10),
    },
    stockLandingHolidayLandscapeImage: {
        height: '100%',
    },
    stockLandingSecondHolidayLandscapeImage: {
        maxHeight: 340,
        marginTop: -getResponsiveSizeExtended(40),
    },
    stockLandingTitle: {
        color: colors.text900,
        fontSize: layoutHelpers.getResponsiveSizeExtended(32),
        textAlign: 'left',
    },
    stockLandingOne: {
        marginBottom: '2%',
    },
    stockLandingSecondHolidayTitle: {
        fontSize: getResponsiveSizeExtended(32),
        marginTop: '4%',
    },
    closeIconHoliday: {
        tintColor: colors.gray300,
    },
    closeIconSecondHoliday: {
        tintColor: colors.gray300,
    },
    closeIconBg: {
        backgroundColor: colors.transparent,
    },
    closeIconBgHoliday: {
        backgroundColor: colors.transparent,
    },
    textSemiBold: {
        color: colors.text900,
        fontWeight: '700',
    },
    textColorSale: {
        color: colors.nySecondColor,
    },
    textButtonHolidayColor: { color: colors.white },
    stockLandingTitleImageStyleHoliday: { width: 300, height: 40 },
    stockLandingTitleImageSaleStyleHoliday: { width: 154, height: 40 },
})

const getSaleValues = (planName: TPlanTypeSplash) => {
    const discount = {
        pro: platform.isIos ? '77%' : '66.6%',
        offScores: platform.isIos ? '77%' : '66.6%',
        learning: '50%',
        one: platform.isIos ? '58%' : '58.3%',
        learningBundle: '',
    }[planName]

    return discount ? ` ${translate('native.marketing.discount_off', { discount })}` : ''
}

export const useHolidayDecor = (isLandscape: boolean, planName: TPlanTypeSplash) => {
    return useMemo(
        () => ({
            mainContainerStyle: styles.bgStock,
            buttonStockContainerStyle: styles.buttonContainer,
            buttonStockStyle: styles.buyButton,
            buttonContainerTextStyle: null,
            secondTitleButtonStyle: styles.textHolidayColor,
            mainImageStyle: StyleSheet.flatten([
                styles.stockLandingImage,
                isLandscape && styles.stockLandingHolidayLandscapeImage,
            ]),
            stockLandingSale: getSaleValues(planName),
            stockLandingTitleStyle: styles.stockLandingTitle,
            activeSwitcherColor: colors.nySecondColor,
            customBgImageCloseStyle: styles.closeIconBg,
            stockLandingTitleColorSale: [styles.textSemiBold, styles.textColorSale],
            stockLandingTitleImage: null,
            stockLandingTitleImageSale: null,
            stockLandingTitleImageStyle: null,
            stockLandingTitleImageSaleStyle: null,
            colorTextSwitcher: colors.text900,
        }),
        [isLandscape, planName],
    )
}
