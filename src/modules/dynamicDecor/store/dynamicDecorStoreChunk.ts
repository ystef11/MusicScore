import { platform } from '@mu-native/common'
import { createExtendedStoreChunk } from '@ug/store'
import { createSelector } from 'reselect'

import { TActiveDecor, TDecorItem } from '../types/dynamicDecorTypes'

type TDynamicDecorState = {
    activeDecorData: TActiveDecor
    decors: TDecorItem[]
}

export const dynamicDecorStoreChunk = createExtendedStoreChunk<TDynamicDecorState>({
    treeKey: 'modules',
    storeKey: 'dynamicDecor',
})({
    persist: ['activeDecorData'],
    initialState: {
        activeDecorData: {
            stockName: 'winter_sale',
            gradientTourColors: null,
            planOfferName: 'Winter Offer',
            planOfferNameNew: '',
            tourSaleText: 'Freezed Prices for You:',
            closeTourIconBgColor: 'rgba(255,255,255,0.4)',
            profileIconStyle: {},
            stockLandingImageStyleIpad: {},
            closeIconStockLandingStyle: {},
            stockLandingDynamicTitleStyle: {},
            titleProfileOnboardingStyle: {},
            profileOnboardingButtonTextStyle: {},
            colorRestoreStockLandingButton: 'contentSecondary',
            stockLandingTextContainerStyle: {},
            tourSaleTextStyle: { color: '#EC2F2F' },
            stockLandingSwitcherColor: '#EC2F2F',
            floatingIconStyle: {},
            tourImageStyle: {},
            buyButtonStockLandingStyle: {
                backgroundColor: '#EC2F2F',
                borderWidth: 0,
            },
            sftIconStyle: {},
            stockLandingImageStyle: {},
            stockLandingBgStyle: {},
            closeIconProfileStyle: {},
            closeIconBgProfileStyle: {},
            profileCancelTextStyle: {},
            planNameSpecialOffer: '',
            stockLandingCloseIconBgStyle: {
                backgroundColor: 'transparent',
            },
            sft_icon:
                'https://musescore.com/static/musescore/sale_offer/image_dynamic_7/e/8/5/28.png',
            floating_icon:
                'https://musescore.com/static/musescore/sale_offer/image_dynamic_8/e/8/5/28.png',
            tour_image_sale:
                'https://musescore.com/static/musescore/sale_offer/image_dynamic_10/e/8/5/28.png',
            onboarding_bg_phone:
                'https://musescore.com/static/musescore/sale_offer/image_dynamic_5/e/8/5/28.png',
            onboarding_bg_tablet:
                'https://musescore.com/static/musescore/sale_offer/image_dynamic_6/e/8/5/28.png',
            onboarding_icon:
                'https://musescore.com/static/musescore/sale_offer/image_dynamic_4/e/8/5/28.png',
            profile_icon:
                'https://musescore.com/static/musescore/sale_offer/image_dynamic_1/e/8/5/28.png',
            card: 'https://musescore.com/static/musescore/sale_offer/image_dynamic_3/e/8/5/28.png',
            floating_image_sale:
                'https://musescore.com/static/musescore/sale_offer/image_dynamic_9/e/8/5/28.png',
            tour_image_bg_phone:
                'https://musescore.com/static/musescore/sale_offer/image_dynamic_11/e/8/5/28.png',
            tour_image_bg_tablet:
                'https://musescore.com/static/musescore/sale_offer/image_dynamic_12/e/8/5/28.png',
            profileSaleButton: {
                backgroundColor: '#EC2F2F',
            },
            profileTextSaleStyle: {
                color: '#1A202E',
            },
            tourBuyButtonStyle: {
                backgroundColor: '#EC2F2F',
            },
            tourBuyButtonTextStyle: {
                color: 'white',
            },
            tourCloseIconStyle: {
                tintColor: 'white',
            },
            buyButtonContainerStockLandingStyle: {
                backgroundColor: '#DADFE9',
            },
            stockLandingSaleText: 'Winter Sale\n',
            stockLandingSaleTextStyle: {
                color: '#EC2F2F',
            },
            switcherTourActiveColor: '#EC2F2F',
            subscriptionsTheme: {
                GAME_SCREEN: {
                    textColor: '#1A202E',
                    borderColorActive: '#EC2F2F',
                    disabledBorderColor: '#D2D6DC',
                    disabledBackground: 'rgba(255, 255, 255, 0.75)',
                    activeBackground: 'white',
                    badgeText: 'white',
                    textLine2Color: '#607087',
                },
                TOUR_INSTALL: {
                    textColor: '#1A202E',
                    borderColorActive: '#EC2F2F',
                    disabledBorderColor: '#D2D6DC',
                    disabledBackground: '#F4F5F7',
                    activeBackground: '#F4F5F7',
                    badgeText: 'white',
                    textLine2Color: '#607087',
                    featureColorText: 'white',
                },
                LONG_LANDING: {
                    textColor: '#1A202E',
                    borderColorActive: '#EC2F2F',
                    disabledBorderColor: '#D2D6DC',
                    disabledBackground: '#F4F5F7',
                    activeBackground: '#F4F5F7',
                    badgeText: 'white',
                    textLine2Color: '#607087',
                    featureColorText: 'white',
                },
                FLOATING: {
                    textColor: '#1A202E',
                    textColorActiveByIndex: {
                        '0': '#EC2F2F',
                    },
                    borderColorActive: '#EC2F2F',
                    disabledBorderColor: 'transparent',
                    disabledBackground: 'white',
                    activeBackground: 'white',
                    badgeText: 'white',
                    textLine2Color: '#607087',
                    featureColorText: '#1A202E',
                },
                LANDING: {
                    textColor: '#37474f',
                    borderColorActive: '#2E68C0',
                    textColorActiveByIndex: {
                        '1': '#2E68C0',
                    },
                    disabledBorderColor: '#D2D6DC',
                    disabledBackground: '#F9FAFB',
                    activeBackground: '#EBF5FF',
                    badgeText: 'white',
                    textLine2Color: '#607087',
                },
                ANNIVERSARY_SCREEN: {
                    textColorActiveByIndex: {
                        '0': '#2E68C0',
                    },
                    textColor: '#607087',
                    borderColorActive: '#2E68C0',
                    disabledBorderColor: '#F4F5F7',
                    disabledBackground: '#F4F5F7',
                    activeBackground: '#EBF5FF',
                    badgeText: 'white',
                    textLine2Color: '#607087',
                },
                PROFILE: {
                    textColor: '',
                    borderColorActive: '#D2D6DC',
                    disabledBorderColor: '#D2D6DC',
                    disabledBackground: '#F9FAFB',
                    activeBackground: '#F9FAFB',
                    badgeText: 'white',
                    textLine2Color: '#607087',
                    featureColorText: '#1A202E',
                },
                LAST_CHANCE: {
                    textColor: '#1A202E',
                    borderColorActive: '#21B275',
                    disabledBorderColor: '#D2D6DC',
                    disabledBackground: '#F9FAFB',
                    activeBackground: '#F9FAFB',
                    badgeText: 'white',
                    textLine2Color: '#607087',
                    featureColorText: '#1A202E',
                },
                STUDENTS: {
                    textColor: '#1A202E',
                    borderColorActive: '#21B275',
                    disabledBorderColor: '#D2D6DC',
                    disabledBackground: '#F9FAFB',
                    activeBackground: '#F9FAFB',
                    badgeText: 'white',
                    textLine2Color: '#607087',
                    featureColorText: '#1A202E',
                },
                TOUR_UPDATE: {
                    textColor: '#1A202E',
                    borderColorActive: '#EC2F2F',
                    disabledBorderColor: '#D2D6DC',
                    disabledBackground: '#F4F5F7',
                    activeBackground: '#F4F5F7',
                    badgeText: 'white',
                    textLine2Color: '#607087',
                    featureColorText: 'white',
                },
                EXPIRE_SPLASH: {
                    textColor: '#1A202E',
                    borderColorActive: '#EC2F2F',
                    disabledBorderColor: '#D2D6DC',
                    disabledBackground: '#F4F5F7',
                    activeBackground: '#F4F5F7',
                    badgeText: 'white',
                    textLine2Color: '#607087',
                    featureColorText: 'white',
                },
                TOUR_MORE_PLANS: {
                    textColor: '',
                    borderColorActive: '#D2D6DC',
                    disabledBorderColor: '#D2D6DC',
                    disabledBackground: '#F9FAFB',
                    activeBackground: '#F9FAFB',
                    badgeText: 'white',
                    textLine2Color: '#607087',
                    featureColorText: '#1A202E',
                },
            },
        },
        decors: [],
    },
})

export const getAssetsForPreloadReselect = createSelector(
    dynamicDecorStoreChunk.props.getActiveDecorData,
    ({
        profile_icon: profileIcon,
        tour_image_bg_phone: tourImageBgPhone,
        tour_image_sale: tourImageSale,
        tour_image_bg_tablet: tourImageBgTablet,
        card,
        floating_image_sale: floatingImageSale,
        floating_icon: floatingIcon,
        onboarding_bg_phone: onboardingBgPhone,
        onboarding_bg_tablet: onboardingBgTablet,
    }) =>
        [
            profileIcon,
            platform.isTablet ? tourImageBgTablet : tourImageBgPhone,
            tourImageSale,
            card,
            floatingImageSale,
            floatingIcon,
            platform.isTablet ? onboardingBgTablet : onboardingBgPhone,
        ].filter(Boolean),
)
