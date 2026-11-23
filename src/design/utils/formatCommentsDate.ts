import { translate } from '@mu-native/locale/i18n'
import {
    differenceInDays,
    differenceInHours,
    differenceInMinutes,
    format,
    isThisMonth,
    isThisYear,
    isToday,
    isYesterday,
} from 'date-fns'

export function formatCommentsDate(date: number) {
    const curDate = Date.now()
    const d = date * 1000

    if (isToday(d)) {
        const diffInMinutes = differenceInMinutes(curDate, d)

        if (diffInMinutes < 59) {
            if (diffInMinutes > 1) {
                return translate('native.date.minutes_ago', { minutes: diffInMinutes.toString() })
            }

            return translate('native.date.just_now')
        }

        const hours = differenceInHours(curDate, d)
        if (hours < 23) {
            return translate('native.date.hours_ago', { hours: hours.toString() })
        }
        return translate('native.date.today_in', { time: format(d, 'H:mm') })
    }

    if (isYesterday(d)) {
        return translate('native.date.yesterday_in', { time: format(d, 'H:mm') })
    }

    if (isThisMonth(d)) {
        const diffInDays = differenceInDays(curDate, d)
        return translate('native.date.days_ago', { days: diffInDays.toString() })
    }

    if (isThisYear(d)) {
        return format(d, 'MMMM D')
    }

    return format(d, 'MMMM D, YYYY')
}
