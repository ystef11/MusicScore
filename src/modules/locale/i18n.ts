import { i18n } from '@muse/i18n'
import { Ti18nTranslation } from '@muse/i18n/generated/types/i18nTypes.ts'

export type LocaleKey = keyof Ti18nTranslation

/** Keys that carry no interpolation params, so `translate(key)` type-checks for a variable key. */
export type PlainLocaleKey = {
    [K in LocaleKey]: Ti18nTranslation[K] extends void ? K : never
}[LocaleKey]

export const getAvailableLocale = (): string => {
    return i18n.language
}

export const translate = i18n.t

export function localizeNumber(number: number, params = {}) {
    return i18n.getNumber(number, params)
}

export function localizeDate(timestamp: number, format: 'default' | 'short' | 'full' = 'full') {
    return i18n.getDate(timestamp, format)
}

/** Backend score totals come as a decimal count of millions ("4.1"); show it with the locale's separator. */
export function localizeMillions(millions: string) {
    const value = Number.parseFloat(millions)
    return Number.isNaN(value) ? millions : localizeNumber(value, { maximumFractionDigits: 1 })
}

export const getCurrentLocale = () => i18n.locale
export const getCurrentLocaleCode = () => i18n.language
