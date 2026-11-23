import { platform } from '@mu-native/common'
import { ScorePageLayoutOptionKey, TScrollMode } from '@mu-native/score'

export const convertPageLayoutToScrollMode = (pageLayoutType: ScorePageLayoutOptionKey) => {
    const pageLayoutToScrollMode: Record<ScorePageLayoutOptionKey, TScrollMode> = {
        'single-line': TScrollMode.HORIZONTAL,
        horizontal: platform.isAndroid ? TScrollMode.VERTICAL : TScrollMode.PAGE,
        vertical: TScrollMode.VERTICAL,
    }
    return pageLayoutToScrollMode[pageLayoutType]
}
