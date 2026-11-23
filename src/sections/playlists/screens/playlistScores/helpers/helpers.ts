import { COLORS } from '../constants/playlistCardBgColorConstants'
import {
    PLAYLIST_CARD_IMAGE_TYPE_FIT_FULL_WIDTH,
    PLAYLIST_CARD_IMAGE_TYPE_FIT_RIGHT,
    PLAYLIST_CARD_IMAGE_TYPE_FULL_SIZE_BG,
    PLAYLIST_CARD_IMAGE_TYPE_NONE,
} from '../constants/playlistCardImageTypeConstants'

export const getImageType = (typeNumber: 0 | 1 | 2 | 3) => {
    const colors: Record<number, 'none' | 'fullSizeBg' | 'fitRight' | 'fitFullWidth'> = {
        0: PLAYLIST_CARD_IMAGE_TYPE_NONE,
        1: PLAYLIST_CARD_IMAGE_TYPE_FULL_SIZE_BG,
        2: PLAYLIST_CARD_IMAGE_TYPE_FIT_RIGHT,
        3: PLAYLIST_CARD_IMAGE_TYPE_FIT_FULL_WIDTH,
    }
    return colors[typeNumber]
}

export const getColor = (colorNumber: 0 | 1 | 2 | 3 | 4 | 5 | 6 | null) => {
    if (!colorNumber) return null
    return COLORS[colorNumber]
}
