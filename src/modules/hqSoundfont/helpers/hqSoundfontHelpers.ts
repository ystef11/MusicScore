import { soundFont } from '@xtz/muse-rn'

import {
    DEFAULT_SOUNDFONT_FILE_PATH,
    PRO_SOUNDFONT_FILE_PATH,
} from '../constants/hqSoundfontConstants'

export const getProSoundfontConfig = () => ({
    type: soundFont.tabWithEffect,
    uri: PRO_SOUNDFONT_FILE_PATH,
})

export const getDefaultSoundfontConfig = () => ({
    type: soundFont.midi,
    uri: DEFAULT_SOUNDFONT_FILE_PATH,
})
