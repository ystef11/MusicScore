import { parseQueryString, toQueryString } from './queryString'
import type { TGetUrlProps } from './types'

/**
 * Функция для построения url с добавлением query параметров.
 * 
 * ```ts
 * const newsUrl = getUrl({
 *     url: '/news',
 *     params: {
 *         id: 999
 *     },
 * })
 * ```
 */
export const getUrl = ({ url, suffix = '', params = {} }: TGetUrlProps) => {
    const { origin, search, pathname, hash } = new URL(url)
    const computedParams = {
        ...parseQueryString(search),
        ...params,
    }

    return `${origin}${pathname}${suffix}${toQueryString(computedParams)}${hash}`
}

/**
 * Каррированная версия {@link getUrl} для создания фабрики однотипных url с разными параметрами.
 * 
 * ```ts
 * const newsUrl = getUrl({
 *     url: '/news',
 *     params: {
 *         id: 999
 *     }
 * })
 * ```
 */
export const getUrlCurry = <T extends Record<string, unknown>>(
    url: string,
    params: Record<string, unknown> = {},
) => (newParams?: T) => getUrl({ url, params: { ...params, ...newParams } })