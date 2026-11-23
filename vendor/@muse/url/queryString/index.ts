import parse from './parse'
import stringify from './stringify'

/**
 * Функция для парсинга query параметров url.
 */
 export const parseQueryString = (string: string) => {
    const str = string[0] === '?' ? string.slice(1) : string
    return parse(str)
}

/**
 * Функция построения строки query параметров.
 */
export const toQueryString = (
    data: Record<string, unknown>,
    needPrefix = true,
    delimiter = '&',
) => {
    if (!data || !Object.keys(data).length) return ''
    return (needPrefix ? '?' : '') + stringify(data, delimiter)
}
