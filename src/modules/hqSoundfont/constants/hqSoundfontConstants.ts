import { Platform } from 'react-native'

import { RNFS } from '@mu-native/common'

export const DEFAULT_SOUNDFONT_FILE = Platform.select({
    ios: 'default.sf3',
    android: 'custom/default.sf3',
    default: 'default.sf3',
})
export const DEFAULT_SOUNDFONT_FILE_PATH = Platform.select({
    ios: `${RNFS.MainBundlePath}/${DEFAULT_SOUNDFONT_FILE}`,
    android: `${RNFS.DocumentDirectoryPath}/${DEFAULT_SOUNDFONT_FILE.split('/').pop()}`,
    default: `${RNFS.DocumentDirectoryPath}/${DEFAULT_SOUNDFONT_FILE}`,
})

export const PRO_SOUNDFONT_FILE = Platform.select({
    ios: 'pro.sf3',
    android: 'custom/pro.sf3',
    default: 'pro.sf3',
})
export const PRO_SOUNDFONT_FILE_PATH = Platform.select({
    ios: `${RNFS.MainBundlePath}/${PRO_SOUNDFONT_FILE}`,
    android: `${RNFS.DocumentDirectoryPath}/${PRO_SOUNDFONT_FILE.split('/').pop()}`,
    default: `${RNFS.DocumentDirectoryPath}/${PRO_SOUNDFONT_FILE}`,
})
