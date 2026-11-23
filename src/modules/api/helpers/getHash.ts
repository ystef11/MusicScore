import { NativeModules } from 'react-native'

const twoSymbolString = (value: number) => `0${value}`.slice(-2)

export const getHash = async (serverTimestamp: number) => {
    const serverTime = new Date(serverTimestamp)
    const date = serverTime || new Date()
    const year = date.getUTCFullYear()
    const month = twoSymbolString(date.getUTCMonth() + 1)

    const day = twoSymbolString(date.getUTCDate())

    const hours = date.getUTCHours()
    const dateString = `${year}-${month}-${day}:${hours}`

    const hash = await NativeModules?.NativeMD5?.getHash(dateString)

    return hash
}
