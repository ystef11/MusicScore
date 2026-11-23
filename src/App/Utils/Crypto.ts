import { device } from '@mu-native/common'
import map from 'lodash.map'

export const KEY = device.uniqueId + device.appName
export const b64Table = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='

const xorDecrypt = (key: string, data: string) => {
    return map(data, (c, i) =>
        // @ts-ignore
        String.fromCharCode(c ^ key.charCodeAt(Math.floor(i % key.length))),
    ).join('')
}

const b64Decode = (data: string) => {
    let o1
    let o2
    let o3
    let h1
    let h2
    let h3
    let h4
    let bits
    let i = 0
    const result = []

    if (!data) {
        return data
    }

    const copyData = String(data)

    do {
        h1 = b64Table.indexOf(copyData.charAt(i++))
        h2 = b64Table.indexOf(copyData.charAt(i++))
        h3 = b64Table.indexOf(copyData.charAt(i++))
        h4 = b64Table.indexOf(copyData.charAt(i++))
        // eslint-disable-next-line no-bitwise
        bits = (h1 << 18) | (h2 << 12) | (h3 << 6) | h4
        // eslint-disable-next-line no-bitwise
        o1 = (bits >> 16) & 0xff
        // eslint-disable-next-line no-bitwise
        o2 = (bits >> 8) & 0xff
        // eslint-disable-next-line no-bitwise
        o3 = bits & 0xff
        result.push(o1)

        if (h3 !== 64) {
            result.push(o2)

            if (h4 !== 64) {
                result.push(o3)
            }
        }
    } while (i < copyData?.length)

    return result
}

export function decrypt(key: string, data: string) {
    const decodedData = b64Decode(data)
    // @ts-ignore
    return xorDecrypt(key, decodedData)
}
