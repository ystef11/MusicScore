import {
    COLOR_BLACK,
    COLOR_BLACKa200,
    COLOR_CYAN100,
    COLOR_CYAN150,
    COLOR_CYAN200,
    COLOR_CYAN350,
    COLOR_CYAN400,
    COLOR_CYAN700,
    COLOR_CYAN750,
    COLOR_CYAN900,
    COLOR_DARK_FORM_DEFAULT,
    COLOR_LIGHT_ACCENT_PRIMARY,
    COLOR_LIGHT_ACCENT_SECONDARY,
    COLOR_LIGHT_ACTION_CONTROLS,
    COLOR_LIGHT_ACTION_FLOAT,
    COLOR_LIGHT_ACTION_PRIMARY,
    COLOR_LIGHT_ACTION_SECONDARY,
    COLOR_LIGHT_ADDITIONAL_ATTENTION,
    COLOR_LIGHT_ADDITIONAL_DEFAULT_SUBDUED,
    COLOR_LIGHT_ADDITIONAL_DEFAULT,
    COLOR_LIGHT_ADDITIONAL_LEVEL_ADVANCED_SUBDUED,
    COLOR_LIGHT_ADDITIONAL_LEVEL_ADVANCED,
    COLOR_LIGHT_ADDITIONAL_LEVEL_BEGINNER_SUBDUED,
    COLOR_LIGHT_ADDITIONAL_LEVEL_BEGINNER,
    COLOR_LIGHT_ADDITIONAL_LEVEL_INTERMEDIATE_SUBDUED,
    COLOR_LIGHT_ADDITIONAL_LEVEL_INTERMEDIATE,
    COLOR_LIGHT_ADDITIONAL_PROMO_SMP,
    COLOR_LIGHT_ADDITIONAL_RATING,
    COLOR_LIGHT_ADDITIONAL_STAFF,
    COLOR_LIGHT_BACKGROUND_DEFAULT,
    COLOR_LIGHT_BACKGROUND_DISABLED,
    COLOR_LIGHT_BACKGROUND_HIGHLIGHT,
    COLOR_LIGHT_BACKGROUND_INACTIVE,
    COLOR_LIGHT_CONTENT_INACTIVE,
    COLOR_LIGHT_CONTENT_PRIMARY,
    COLOR_LIGHT_CONTENT_SECONDARY,
    COLOR_LIGHT_CONTENT_TERTIARY,
    COLOR_LIGHT_EXCEPTION_INVERSE_DARK,
    COLOR_LIGHT_EXCEPTION_INVERSE_LIGHT,
    COLOR_LIGHT_FORM_ACTIVE,
    COLOR_LIGHT_FORM_DEFAULT,
    COLOR_LIGHT_FORM_DISABLED,
    COLOR_LIGHT_OVERLAY_IMAGE,
    COLOR_LIGHT_OVERLAY_MODAL,
    COLOR_LIGHT_STATUS_DEFAULT_SUBDUED,
    COLOR_LIGHT_STATUS_DEFAULT,
    COLOR_LIGHT_STATUS_ERROR_SUBDUED,
    COLOR_LIGHT_STATUS_ERROR,
    COLOR_LIGHT_STATUS_SUCCESS_SUBDUED,
    COLOR_LIGHT_STATUS_SUCCESS,
    COLOR_LIGHT_STATUS_WARNING_SUBDUED,
    COLOR_LIGHT_STATUS_WARNING,
    COLOR_LIGHT_STROKE_DEFAULT,
    COLOR_MALACHITE350,
    COLOR_PINK350,
    COLOR_PURPLE350,
    COLOR_SAPPHIRE350,
    COLOR_SMOKEA150,
    COLOR_VIOLET350,
    COLOR_VIOLET600,
    COLOR_VIOLET650,
    COLOR_VIOLET700,
    COLOR_VIOLET750,
    COLOR_VIOLET800,
    COLOR_VIOLET850,
    COLOR_WHITE,
    COLOR_LIGHT_EXCEPTION_CONSTANT_LIGHT,
} from './library_colors.ts'

export const brandLightColors = {
    backgroundDisabledTransparent: 'rgba(229, 231, 235, 0.25)',

    strokeDefault: COLOR_LIGHT_STROKE_DEFAULT,
    overlyImage: COLOR_LIGHT_OVERLAY_IMAGE,
    overlyModal: COLOR_LIGHT_OVERLAY_MODAL,

    actionSecondaryDefault: COLOR_LIGHT_ACTION_SECONDARY,

    backgroundInverse: COLOR_LIGHT_EXCEPTION_INVERSE_LIGHT,
    colorBlack: COLOR_BLACK,

    contentPrimary: COLOR_LIGHT_CONTENT_PRIMARY,
    contentSecondary: COLOR_LIGHT_CONTENT_SECONDARY,
    contentTertiary: COLOR_LIGHT_CONTENT_TERTIARY,
    contentInactive: COLOR_LIGHT_CONTENT_INACTIVE,
    backgroundDefault: COLOR_LIGHT_BACKGROUND_DEFAULT,

    backgroundHighlight: COLOR_LIGHT_BACKGROUND_HIGHLIGHT,
    backgroundInactive: COLOR_LIGHT_BACKGROUND_INACTIVE,
    colorActionPrimaryDefault: COLOR_LIGHT_ACTION_PRIMARY,
    colorActionFloatDefault: COLOR_LIGHT_ACTION_FLOAT,
    colorActionSecondaryPressed: COLOR_SMOKEA150, // @deprecated — Use opacity token for a pressed state
    colorBackgroundDisabled: COLOR_LIGHT_BACKGROUND_DISABLED,

    accentPrimary: COLOR_LIGHT_ACCENT_PRIMARY,
    accentSecondary: COLOR_LIGHT_ACCENT_SECONDARY,
    actionSecondary: COLOR_LIGHT_ACTION_SECONDARY,

    formDefault: COLOR_LIGHT_FORM_DEFAULT,
    formActive: COLOR_LIGHT_FORM_ACTIVE,
    formDisabled: COLOR_LIGHT_FORM_DISABLED,

    statusDefault: COLOR_LIGHT_STATUS_DEFAULT,
    statusDefaultSubdued: COLOR_LIGHT_STATUS_DEFAULT_SUBDUED,
    statusSuccess: COLOR_LIGHT_STATUS_SUCCESS,
    statusSuccessSubdued: COLOR_LIGHT_STATUS_SUCCESS_SUBDUED,
    statusWarning: COLOR_LIGHT_STATUS_WARNING,
    statusWarningSubdued: COLOR_LIGHT_STATUS_WARNING_SUBDUED,
    statusError: COLOR_LIGHT_STATUS_ERROR,
    statusErrorSubdued: COLOR_LIGHT_STATUS_ERROR_SUBDUED,

    additionalDefault: COLOR_LIGHT_ADDITIONAL_DEFAULT,
    additionalDefaultSubdued: COLOR_LIGHT_ADDITIONAL_DEFAULT_SUBDUED,
    additionalBeginner: COLOR_LIGHT_ADDITIONAL_LEVEL_BEGINNER,
    additionalBeginnerSubdued: COLOR_LIGHT_ADDITIONAL_LEVEL_BEGINNER_SUBDUED,
    additionalIntermediate: COLOR_LIGHT_ADDITIONAL_LEVEL_INTERMEDIATE,
    additionalIntermediateSubdued: COLOR_LIGHT_ADDITIONAL_LEVEL_INTERMEDIATE_SUBDUED,
    additionalAdvanced: COLOR_LIGHT_ADDITIONAL_LEVEL_ADVANCED,
    additionalAdvancedSubdued: COLOR_LIGHT_ADDITIONAL_LEVEL_ADVANCED_SUBDUED,
    additionalStaff: COLOR_LIGHT_ADDITIONAL_STAFF,
    additionalRating: COLOR_LIGHT_ADDITIONAL_RATING,
    additionalPromoSmp: COLOR_LIGHT_ADDITIONAL_PROMO_SMP,
    additionalAttention: COLOR_LIGHT_ADDITIONAL_ATTENTION,
    additionalDarkImageOverlay: COLOR_BLACKa200,
    actionsControlDefault: COLOR_LIGHT_ACTION_CONTROLS,

    splash: '#180036',

    transparent: 'transparent',
    exceptionConstantLight: COLOR_LIGHT_EXCEPTION_CONSTANT_LIGHT,
    exceptionInverseDark: COLOR_LIGHT_EXCEPTION_INVERSE_DARK,
    exceptionInverseLight: COLOR_LIGHT_EXCEPTION_INVERSE_LIGHT,
    exceptionConstantWhite: COLOR_WHITE,
    exceptionMultilayer: 'rgba(0, 0, 0, 0.2)',
    exceptionMultilayerLight: 'rgba(255, 255, 255, 0.15)',
    exceptionScrim: 'rgba(0, 0, 0, 0.3)',
    exceptionFrost: 'rgba(255, 255, 255, 0.6)',

    // DEV PURPOSES
    devIconBackground: 'rgba(0, 0, 0, 0.03)',

    playlistBackground0: COLOR_WHITE,
    playlistBackground1: COLOR_CYAN350,
    playlistBackground2: COLOR_VIOLET350,
    playlistBackground3: COLOR_PURPLE350,
    playlistBackground4: COLOR_PINK350,
    playlistBackground5: COLOR_SAPPHIRE350,
    playlistBackground6: COLOR_MALACHITE350,

    colorViolet600: COLOR_VIOLET600,
    colorViolet650: COLOR_VIOLET650,
    colorViolet700: COLOR_VIOLET700,
    colorViolet750: COLOR_VIOLET750,
    colorViolet800: COLOR_VIOLET800,
    colorViolet850: COLOR_VIOLET850,
    colorCyan100: COLOR_CYAN100,
    colorCyan150: COLOR_CYAN150,
    colorCyan200: COLOR_CYAN200,
    colorCyan400: COLOR_CYAN400,
    colorCyan700: COLOR_CYAN700,
    colorCyan750: COLOR_CYAN750,
    colorCyan900: COLOR_CYAN900,

    colorDarkFormDefault: COLOR_DARK_FORM_DEFAULT,
}

export function randomBrandColor(params?: { opacity?: number; base?: string }) {
    if (!__DEV__) return params?.base
    const randomBetween = (min: number, max: number) =>
        min + Math.floor(Math.random() * (max - min + 1))
    const r = randomBetween(0, 255)
    const g = randomBetween(0, 255)
    const b = randomBetween(0, 255)
    return `rgba(${r},${g},${b}, ${params?.opacity ?? 0.1})`
}

export type BrandThemeColors = typeof brandLightColors
export type BrandThemeColorKey = keyof BrandThemeColors
export const brandColors = brandLightColors
