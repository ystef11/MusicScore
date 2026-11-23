import { platform } from '@mu-native/common/constants/platform'

const shadowElevation = (value: number) => ({
    elevation: value,
    shadowOffset: {
        width: 0,
        height: 1,
    },
    shadowColor: 'black',
    shadowOpacity: value / 10,
})

const fontWeight600Android = {
    fontFamily: 'sans-serif-medium',
    fontWeight: 'normal',
}
const fontWeight600 = platform.isIos ? { fontWeight: '600' } : fontWeight600Android

export const design = {
    shadowElevation,
    fontWeight600,
    fontFamilyMuseHarmony: 'Harmony', // оригинальное название MuseDisplay-Harmony, пришлось переимновать сам font family тк вместе с симфони они не жили и рендерился только симфони на любое название начинаюшихся на "MuseDisplay" шрифтов
    fontFamilyMuseSymphony: 'MuseDisplay-Symphony',
    fontFamilyMuseSansBold: 'MuseSans-Bold',
    fontFamilyMuseSansSemibold: 'MuseSans-Semibold',
    fontFamilyMuseSansMedium: 'MuseSans-Medium',
    fontFamilyMuseSansRegular: 'MuseSans-Regular',
    fontFamilyMuseSansMonoVF: 'MuseSansMonoVF',
}
