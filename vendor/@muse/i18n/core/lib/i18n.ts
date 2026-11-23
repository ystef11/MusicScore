import { i18n as linguiI18n } from '@lingui/core'
import { TMuseI18n, TMilliseconds, TDefaultTranslation, TLocale } from '../types/libTypes'

const DURATION_ONE_SECOND = 1000
const DURATION_MONTH = 31 * 24 * 60 * 60 * 1000

const SECONDS_IN_MINUTE = 60
const SECONDS_IN_HOUR = 60 * 60

const isYearsEqual = (timestamp1: TMilliseconds, timestamp2: TMilliseconds) => {
    const aDate = new Date(timestamp1)
    const bDate = new Date(timestamp2)

    return aDate.getFullYear() === bDate.getFullYear()
}

const getFormatedDate = (timestamp: TMilliseconds, options: Intl.DateTimeFormatOptions) => {
    return new Intl.DateTimeFormat(linguiI18n.locale, options).format(timestamp)
}

const getRelativeUnitAndDevisor = (timeDiff: TMilliseconds) => {
    // Array representing one minute, hour, day, in seconds
    const unitsInSec = [
        60 * 60 * 24 * DURATION_ONE_SECOND, // day
        60 * 60 * DURATION_ONE_SECOND, // hour
        60 * DURATION_ONE_SECOND, // minute
        DURATION_ONE_SECOND, // second
    ]
    const unitStrings: Intl.RelativeTimeFormatUnit[] = ['day', 'hour', 'minute', 'second']
    const initIndex = unitsInSec.findIndex(cutoff => Math.abs(timeDiff) >= cutoff)
    return {
        unit: unitStrings[initIndex] || unitStrings[unitStrings.length - 1],
        devisor: unitsInSec[initIndex],
    }
}

const getNumber = (number: number, options?: Intl.NumberFormatOptions) => {
    return new Intl.NumberFormat(linguiI18n.locale, options).format(number)
}

export const i18n: TMuseI18n<TDefaultTranslation, TLocale, string> = {
    load(newMessages) {
        linguiI18n.load(newMessages as never)
    },
    activate(locale) {
        linguiI18n.activate(locale)
    },
    t: linguiI18n.t,
    get locale() {
        return linguiI18n.locale
    },
    get language() {
        return i18n.locale.split('-')[0]
    },
    getDate(timestamp, format = 'default') {
        const getOptions = (): Intl.DateTimeFormatOptions => {
            if (format === 'short') {
                return {
                    month: 'short',
                    year: 'numeric',
                }
            }
            if (format === 'full-no-year') {
                return {
                    month: 'long',
                    day: 'numeric',
                }
            }
            if (format === 'full') {
                return {
                    month: 'long',
                    year: 'numeric',
                    day: 'numeric',
                }
            }
            return {
                month: 'short',
                year: 'numeric',
                day: 'numeric',
            }
        }

        return getFormatedDate(timestamp, getOptions())
    },
    get12hTime(timestamp) {
        return getFormatedDate(timestamp, {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
        })
    },
    getRelativeDate(timestamp, format = 'default') {
        const now = Date.now()
        const timeDiff = now - timestamp
        const absDiff = Math.abs(timeDiff)

        if (absDiff < DURATION_ONE_SECOND) {
            return i18n.t('system.date.now')
        }
        if (absDiff >= DURATION_MONTH) {
            const isSameYearTinyDate = isYearsEqual(now, timestamp) && format === 'tiny'
            return getFormatedDate(timestamp, {
                month: 'short',
                year: isSameYearTinyDate ? undefined : 'numeric',
                day: 'numeric',
            })
        }

        const { unit, devisor } = getRelativeUnitAndDevisor(timeDiff)

        const relativeDate = new Intl.RelativeTimeFormat(linguiI18n.locale, {
            numeric: ['short', 'tiny'].includes(format) ? 'always' : 'auto',
            style: ['short', 'tiny'].includes(format) ? 'narrow' : 'long',
        }).format(-Math.floor(timeDiff / devisor), unit)

        if (format === 'tiny' && linguiI18n.locale.startsWith('en')) {
            return relativeDate.replace(' ago', '')
        }
        return relativeDate
    },
    getTotalTime(seconds) {
        const floorSec = Math.floor(seconds)
        const hours = Math.floor(floorSec / SECONDS_IN_HOUR)
        const mins = Math.floor((floorSec % SECONDS_IN_HOUR) / SECONDS_IN_MINUTE)

        const minsText = getNumber(mins, {
            style: 'unit',
            unit: 'minute',
            unitDisplay: 'narrow',
        }).replace(/\s/g, '')
        if (hours === 0) return minsText

        const hoursText = getNumber(hours, {
            style: 'unit',
            unit: 'hour',
            unitDisplay: 'narrow',
        }).replace(/\s/g, '')
        return `${hoursText} ${minsText}`
    },
    getPrice(price, currency) {
        return getNumber(price, { style: 'currency', currency })
    },
    getCurrencySymbol(currency) {
        return (
            new Intl.NumberFormat(linguiI18n.locale, { style: 'currency', currency })
                .formatToParts(0)
                .find(chunk => chunk.type === 'currency')?.value || ''
        )
    },
    getNumber(number, { format = 'default', precision } = {}) {
        if (format === 'default') {
            const options: Intl.NumberFormatOptions = {}

            if (precision !== undefined) {
                options.minimumFractionDigits = precision
                options.maximumFractionDigits = precision
            }

            return getNumber(number, options)
        }

        const options: Intl.NumberFormatOptions = {
            notation: 'compact',
            compactDisplay: 'short',
            minimumFractionDigits: 0,
            maximumFractionDigits: 1,
        }

        if (precision !== undefined) {
            options.maximumFractionDigits = precision
        }

        return getNumber(number, options)
    },
}
