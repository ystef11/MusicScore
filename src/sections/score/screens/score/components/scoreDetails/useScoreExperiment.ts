import { platform, store } from '@mu-native/common'
import { useAppSafeArea } from '@mu-native/ds'
import { useRoute } from '@mu-native/navigation'
import { scoreStoreChunk } from '@mu-native/score'
import { systemStoreChunk, useIsLandscape } from '@mu-native/system'
import { useValues } from '@ug/store'

import { isScoreFromCatalog } from '../../../../../../App/Model/MSScore.ts'
import { DraggableScoreInfoInitialHeight } from '../../constants/scoreViewerConstants'
import { MSScoreT } from '../../types/scoreTypes.ts'

export function getScoreFullScreenAnalytics(): {
    value: 'default' | 'half_fullscreen' | 'fullscreen' | 'sheet'
} {
    const state = store.getState()
    const { props } = scoreStoreChunk
    const isLandscape =
        (systemStoreChunk.props.getOrientation(state)?.indexOf('LANDSCAPE') ?? -1) > -1
    const isFullscreen = props.getIsFullScreen(state)

    if (platform.isTablet || isLandscape) {
        return { value: isFullscreen ? 'fullscreen' : 'half_fullscreen' }
    }
    return { value: isFullscreen ? 'fullscreen' : 'default' }
}

function getKeyboardState(
    isKeyboardVisible: boolean,
) {
    if (!isKeyboardVisible) return { place: 'none' }
    return { place: 'onTopOfSheet' }
}

const sheetVisibleArray = ['sheet', ...(platform.isTablet ? ['half_fullscreen'] : ['default'])]

export const useScoreExperiment = () => {
    const params = useRoute().params as { score: MSScoreT }
    const { bottom } = useAppSafeArea({ bottom: 8 })
    const isLandscape = useIsLandscape()
    const { score } = params
    const [isFullScreen, isKeyboardVisible] = useValues([
        scoreStoreChunk.props.getIsFullScreen,
        scoreStoreChunk.props.getIsKeyboardVisible,
    ])

    const state = getScoreFullScreenAnalytics()

    return {
        sheetDefaultHeight: isScoreFromCatalog(score)
            ? DraggableScoreInfoInitialHeight + bottom
            : 156 + bottom,
        headerType: {
            visible: ['default', 'half_fullscreen'].includes(state.value),
        },
        isSheetVisible:
            !(isLandscape && !platform.isTablet) && sheetVisibleArray.includes(state.value),
        controlsType: {
            onTopOfBottomSheet: {
                visible: ['default', 'half_fullscreen', 'fullscreen']
                    .filter(Boolean)
                    .includes(state.value),
            },
        },
        keyboard: getKeyboardState(isKeyboardVisible),
        isFullScreen,
    }
}
