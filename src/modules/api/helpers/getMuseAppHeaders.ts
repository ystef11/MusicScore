import { NativeModules } from 'react-native'

import { getCountryCode } from '@mu-native/common'
import { getCurrentLocaleCode } from '@mu-native/locale'
import type { THeaderParams } from '@muse-native/api'

import { headerValues } from '../constants/headerValues'

import { getHash } from './getHash'

const getClientId = async () => {
    const clientId: string = await NativeModules?.NativeMD5?.getClientId()

    return clientId
}

export const getMuseAppHeaders = async (
    serverTimestamp: { get(): number },
    headerParams: THeaderParams = [],
) => {
    const hash = await getHash(serverTimestamp.get())
    const headers = await getMinRequiredAPIHeaders()
    headers.set('X-MS-API-KEY', hash)
    headerParams.forEach(item => {
        const value = item.get()

        if (value !== null && value !== undefined) {
            headers.set(item.title, String(value))
        }
    })

    return headers
}

export const getMinRequiredAPIHeaders = async () => {
    const locale = getCurrentLocaleCode()
    const countryCode = getCountryCode()
    let localeHeader = ''
    if (locale) localeHeader += locale
    if (countryCode) localeHeader += `-${countryCode.toUpperCase()}`

    return new Headers({
        accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept-Language': localeHeader,
        'X-MS-CLIENT-ID': await getClientId(),
        'X-MU-PLATFORM': headerValues.platform,
        'X-MS-API-VER': headerValues.apiVersion,
        'User-Agent': headerValues.userAgent,
    })
}
