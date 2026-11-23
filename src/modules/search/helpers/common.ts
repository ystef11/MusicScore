import { localizeNumber } from '@mu-native/locale'

export const camelToSnake = (str: string) =>
    str.replace(/^[A-Z]|(?<=[a-z])[A-Z]/g, (letter, index) => {
        return (index === 0 ? '' : '_') + letter.toLowerCase()
    })

const numberSuffixes = [
    {
        suffix: 'M',
        limit: 1e6,
    },
    {
        suffix: 'K',
        limit: 1e3,
    },
]

export const formatShortNumber = (value: number, precision = 1) => {
    const suffixItem = numberSuffixes.find(item => value >= item.limit)
    if (suffixItem) {
        return `${localizeNumber(value / suffixItem.limit, {
            precision,
            strip_insignificant_zeros: true,
        })}${suffixItem.suffix}`
    }

    return String(value)
}
