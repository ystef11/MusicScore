import { TextStyle } from 'react-native'

import { design } from '../design'

// Mirrors the font family dictionary from Figma.
export const brandFonts = {
    // Default — Muse Sans VF. The variable file is not in assets, only static cuts are.
    regular: design.fontFamilyMuseSansRegular,
    medium: design.fontFamilyMuseSansMedium,
    semibold: design.fontFamilyMuseSansSemibold,
    bold: design.fontFamilyMuseSansBold,
    // Mono — Muse Sans Mono VF. No token references it yet.
    mono: design.fontFamilyMuseSansMonoVF,
    // Accent — Muse Display. See design.ts on why the family string is 'Harmony'.
    accent: design.fontFamilyMuseHarmony,
}

// Default weights. 400/500/600 are the Figma dictionary; 700 is not in it and only covers
// the places that already rendered Bold, until design confirms what they should be.
const fontWeights = {
    default: {
        400: brandFonts.regular,
        500: brandFonts.medium,
        600: brandFonts.semibold,
        700: brandFonts.bold,
    },
}

export const brandFontsStyles = {
    f88w400Accent: {
        fontSize: 88,
        fontFamily: brandFonts.accent,
    } as TextStyle,

    f64w400Accent: {
        fontSize: 64,
        fontFamily: brandFonts.accent,
    } as TextStyle,

    f56w400Accent: {
        fontSize: 56,
        fontFamily: brandFonts.accent,
    } as TextStyle,

    f48w400Accent: {
        fontSize: 48,
        fontFamily: brandFonts.accent,
    } as TextStyle,

    f44w400Accent: {
        fontSize: 44,
        fontFamily: brandFonts.accent,
    } as TextStyle,

    f32w400Accent: {
        fontSize: 32,
        fontFamily: brandFonts.accent,
    } as TextStyle,

    f28w400Accent: {
        fontSize: 28,
        fontFamily: brandFonts.accent,
    } as TextStyle,

    f26w400Accent: {
        fontSize: 26,
        fontFamily: brandFonts.accent,
    } as TextStyle,

    f32w600: {
        fontSize: 32,
        fontFamily: fontWeights.default[600],
    } as TextStyle,

    f24w600: {
        fontSize: 24,
        fontFamily: fontWeights.default[600],
    } as TextStyle,

    f20w400: {
        fontSize: 20,
        fontFamily: fontWeights.default[400],
    } as TextStyle,

    f20w500: {
        fontSize: 20,
        fontFamily: fontWeights.default[500],
    } as TextStyle,

    f20w600: {
        fontSize: 20,
        fontFamily: fontWeights.default[600],
    } as TextStyle,

    f18w400: {
        fontSize: 18,
        fontFamily: fontWeights.default[400],
    } as TextStyle,

    f18w500: {
        fontSize: 18,
        fontFamily: fontWeights.default[500],
    } as TextStyle,

    f18w600: {
        fontSize: 18,
        fontFamily: fontWeights.default[600],
    } as TextStyle,

    f17w400: {
        fontSize: 17,
        fontFamily: fontWeights.default[400],
    } as TextStyle,

    f17w500: {
        fontSize: 17,
        fontFamily: fontWeights.default[500],
    } as TextStyle,

    f17w600: {
        fontSize: 17,
        fontFamily: fontWeights.default[600],
    } as TextStyle,

    f16w400: {
        fontSize: 16,
        fontFamily: fontWeights.default[400],
    } as TextStyle,

    f16w500: {
        fontSize: 16,
        fontFamily: fontWeights.default[500],
    } as TextStyle,

    f16w600: {
        fontSize: 16,
        fontFamily: fontWeights.default[600],
    } as TextStyle,

    f16w700: {
        fontSize: 16,
        fontFamily: fontWeights.default[700],
    } as TextStyle,

    f15w400: {
        fontSize: 15,
        fontFamily: fontWeights.default[400],
    } as TextStyle,

    f15w500: {
        fontSize: 15,
        fontFamily: fontWeights.default[500],
    } as TextStyle,

    f15w600: {
        fontSize: 15,
        fontFamily: fontWeights.default[600],
    } as TextStyle,

    f14w400: {
        fontSize: 14,
        fontFamily: fontWeights.default[400],
    } as TextStyle,

    f14w500: {
        fontSize: 14,
        fontFamily: fontWeights.default[500],
    } as TextStyle,

    f13w400: {
        fontSize: 13,
        fontFamily: fontWeights.default[400],
    } as TextStyle,

    f13w500: {
        fontSize: 13,
        fontFamily: fontWeights.default[500],
    } as TextStyle,

    f13w600: {
        fontSize: 13,
        fontFamily: fontWeights.default[600],
    } as TextStyle,

    f13w700: {
        fontSize: 13,
        fontFamily: fontWeights.default[700],
    } as TextStyle,

    f12w400: {
        fontSize: 12,
        fontFamily: fontWeights.default[400],
    } as TextStyle,

    f12w500: {
        fontSize: 12,
        fontFamily: fontWeights.default[500],
    } as TextStyle,

    f12w600: {
        fontSize: 12,
        fontFamily: fontWeights.default[600],
    } as TextStyle,

    f11w400: {
        fontSize: 11,
        fontFamily: fontWeights.default[400],
    } as TextStyle,

    f11w500: {
        fontSize: 11,
        fontFamily: fontWeights.default[500],
    } as TextStyle,

    f10w500: {
        fontSize: 10,
        fontFamily: fontWeights.default[500],
    } as TextStyle,

    f10w600: {
        fontSize: 10,
        fontFamily: fontWeights.default[600],
    } as TextStyle,
}

export type BrandThemeFonts = typeof brandFontsStyles
export type BrandsThemeFontKey = keyof typeof brandFontsStyles
