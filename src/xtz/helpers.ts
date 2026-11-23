import RNFetchBlob from 'react-native-blob-util'

import { platform, RNFS } from '../common'

export const getDefaultStyle = async (): Promise<string | undefined> => {
    const assetName = 'notation_style.mss'

    if (platform.isIos) return `${RNFS.MainBundlePath}/${assetName}`
    const savePath = `${RNFetchBlob.fs.dirs.CacheDir}/${assetName}`

    try {
        const exists = await RNFetchBlob.fs.exists(savePath)
        if (!exists) {
            const success = await RNFetchBlob.fs.cp(RNFetchBlob.fs.asset(assetName), savePath)
            if (success) {
                return savePath
            }
        }

        return savePath
    } catch (e) {
        console.error('Error copy notation_style in assets:', e)
        return ''
    }
}
