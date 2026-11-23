import { platform } from '@mu-native/common'

export const DefaultNoteSize = platform.isTablet || platform.pixelRatio >= 3 ? 6 : 5
