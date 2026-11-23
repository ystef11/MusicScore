/* eslint-disable max-len */
const URL_RE = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/gim

/**
 * Функция для определения валидности url.
 */
export const isValidUrl = (str: string): boolean => URL_RE.test(str)

/**
 * Функция для поиска валидного url в строке.
 */
export const matchValidUrl = (str: string) => str.match(URL_RE)
