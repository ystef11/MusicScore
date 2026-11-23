import { memo, useCallback, useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import { useSharedValue } from 'react-native-reanimated'

import { useAppSafeArea, BrandAppLoader } from '@mu-native/ds'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { scoreStoreChunk } from '@mu-native/score'
import { useIsLandscape } from '@mu-native/system'
import { useActions, useValues } from '@ug/store'

import reportEvent from '../../../../../App/Utils/Analytics.ts'
import PianoKeyboard from '../components/piano/PianoKeyboard.tsx'
import { ScoreControls } from '../components/scoreDetails/ScoreControls.tsx'
import ScoreDetailsContent from '../components/scoreDetails/ScoreDetailsContent.tsx'
import { useScoreExperiment } from '../components/scoreDetails/useScoreExperiment.ts'
import { DraggableScoreInfoInitialHeight } from '../constants/scoreViewerConstants.ts'
import DraggableBottomSheet from '../Elements/DraggableBottomSheet.tsx'
import { getScoreMetaEvent } from '../helpers/scoreHelpers.ts'
import { useIsPDFScoreDisplayed } from '../hooks/useIsPDFScoreDisplayed.ts'

const styles = StyleSheet.create({
    loader: {
        height: DraggableScoreInfoInitialHeight,
        alignItems: 'center',
    },
})

const Loader = () => (
    <View style={styles.loader}>
        <BrandAppLoader />
    </View>
)

export const ScoreDetailsContainer = memo(() => {
    const isLandscape = useIsLandscape()
    const { keyboard, isSheetVisible, sheetDefaultHeight: defaultHeight } = useScoreExperiment()

    const [score] = useValues([scoreStoreChunk.props.getCurrentScore])
    const actions = useActions({
        toggleFullscreen: scoreStoreChunk.actions.toggleFullscreen,
    })
    const { bottom } = useAppSafeArea({ bottom: 8 })
    const visibleHeight = useSharedValue(0)

    const snapPoints = useMemo(() => {
        if (!isSheetVisible || !score) {
            return [0]
        }
        return [0, defaultHeight]
    }, [isSheetVisible, score, defaultHeight])

    const onSwitchToSnapPoint = useCallback(
        (index: number) => {
            if (index === 0) {
                setTimeout(() => {
                    actions.toggleFullscreen()
                }, 0)
                reportEvent(RT_EVENTS.SCORE_DETAILS_MODAL_DRAG_DOWN, getScoreMetaEvent(score))

                return
            }
            if (index === snapPoints.length) {
                reportEvent(RT_EVENTS.SCORE_DETAILS_MODAL_DRAG_UP, getScoreMetaEvent(score))
            }
        },
        [snapPoints.length, score, actions, isLandscape],
    )

    const isPdf = useIsPDFScoreDisplayed()

    return (
        <>
            <ScoreControls
                defaultOffset={defaultHeight}
                dynamicOffset={visibleHeight}
                bottom={bottom}
            />
            {!isPdf && keyboard.place === 'out' && <PianoKeyboard place="outOfSheet" />}
            <DraggableBottomSheet
                snapPoints={snapPoints}
                initialSnapIndex={snapPoints.length - 1}
                visibleHeight={visibleHeight}
                onSwitchToSnapPoint={onSwitchToSnapPoint}
            >
                {!!score && <ScoreDetailsContent score={score} />}
            </DraggableBottomSheet>
        </>
    )
})
