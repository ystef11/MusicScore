import { getLocales } from 'react-native-localize'

import format from 'date-fns/format'

const locales = {
    en: require('date-fns/locale/en'),
    ru: require('date-fns/locale/ru'),
    de: require('date-fns/locale/de'),
    ja: require('date-fns/locale/ja'),
    nl: require('date-fns/locale/nl'),
    it: require('date-fns/locale/it'),
    fr: require('date-fns/locale/fr'),
}
const { languageTag, languageCode } = getLocales()[0]

// eslint-disable-next-line no-unused-expressions
locales[languageCode as keyof typeof locales] || locales.en

const deviceLocale = languageTag.slice(0, 2)
export default function formatDate(date: Date | string | number, formatStr?: string) {
    let processedDate = date
    if (typeof date === 'number') {
        processedDate = date / 1_000_000_000_000 > 1 ? date : date * 1000
    }
    const d = format(processedDate, formatStr, {
        locale: locales[deviceLocale as keyof typeof locales],
    })
    return `${d[0].toUpperCase()}${d.slice(1)}`
}

const getTimestampDays = (timeStamp: number = Date.now()): number =>
    Math.floor(timeStamp / (1000 * 60 * 60 * 24))

export const getDaysGoneBy = (timeStamp: number): number =>
    getTimestampDays() - getTimestampDays(timeStamp)
