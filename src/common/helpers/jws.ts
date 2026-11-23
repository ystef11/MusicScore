import { Buffer } from 'buffer'

export const decodeJWS = (encoded: string) => {
    const parts = encoded.split('.')
    const jsonStringEncoded = parts[1]
    const jsonStringDecoded = Buffer.from(jsonStringEncoded, 'base64').toString('utf8')
    return JSON.parse(jsonStringDecoded)
}
