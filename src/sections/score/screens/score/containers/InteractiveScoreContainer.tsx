import React, { useEffect, useState } from 'react'
import { LayoutAnimation, View } from 'react-native'

import { platform } from '@mu-native/common'
import { globalStyles } from '@mu-native/ds'
import { Screen, useNavigation, useRoute } from '@mu-native/navigation'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import {
    convertPageLayoutToScrollMode,
    getCurrentScoreMetaOrDefault,
    getCurrentScoreSettings,
    scoreStoreChunk,
    scoreThunks,
    TScoreSourceFile,
} from '@mu-native/score'
import { useActions, useValues } from '@ug/store'

import { getScoreMetaEvent } from '../../../../../App/constants/scoreAnalytic.ts'
import reportEvent from '../../../../../App/Utils/Analytics.ts'
import { usePedalListener } from '../hooks/usePedalListener.ts'
import useRateScoreFlow from '../hooks/useRateScoreFlow.ts'
import { AppleWatchSendDataContainer } from './AppleWatchSendDataContainer.ts'

import { AppleWatchMetronomeContainer } from './AppleWatchMetronomeContainer.tsx'
import XTZContainer, { TXTZContainer } from './XTZContainer.tsx'

type Props = {
    source: TScoreSourceFile
    /** Snap the camera to the top of the score on load (new Score Play screen). */
    resetCameraOnLoad?: boolean
    onScoreTap?: () => void
    noteHintsEnabled?: boolean
}

export const InteractiveScoreContainer = ({
    source,
    resetCameraOnLoad,
    onScoreTap,
    noteHintsEnabled,
}: Props) => {
    const nav = useNavigation()
    const route = useRoute()
    const ref = React.useRef<TXTZContainer>(null)

    const [score, noteSize, pageLayoutType, settings, meta, isKeyboardVisible] = useValues([
        scoreStoreChunk.props.getCurrentScore,
        scoreStoreChunk.props.getCurrentNoteSize,
        scoreStoreChunk.props.getPageLayoutType,
        getCurrentScoreSettings,
        getCurrentScoreMetaOrDefault,
        scoreStoreChunk.props.getIsKeyboardVisible,
    ])
    const [hideXtz, setHideXtz] = useState(false)

    useEffect(() => {
        return nav.addListener('state', () => {
            /**
             * It's a workaround for a case of multiple score screens opened in a stack.
             * Since XTZ can't render more than one view at the same time we have to unmount
             * all underlying XTZ views in the score screens below the currently open.
             * To do that we listen to navigation state changes and unmount XTZ view
             * when we detect that this view belongs to a screen deep in the stack.
             */
            const { routes } = nav.getState() as any
            const scoreRoutes = routes.filter((route: any) =>
                [Screen.score, Screen.scorePlay, 'AutogradeScreen'].includes(route.name),
            )
            const currentRouteIndex = scoreRoutes.findIndex((r: any) => r.key === route.key)
            setHideXtz(currentRouteIndex < scoreRoutes.length - 1)
        })
    }, [])

    const { visiblePartIds, playablePartIds } = settings
    const allPartIds = meta.parts.map(({ id }) => id)
    const scrollMode = convertPageLayoutToScrollMode(pageLayoutType)

    const actions = useActions({
        setNextPage: scoreThunks.setNextPage,
        setPrevPage: scoreThunks.setPrevPage,
        toggleFullscreen: scoreStoreChunk.actions.toggleFullscreen,
    })

    const { tempo: playbackSpeed, isCountdownEnabled, metronomeVolume } = settings

    usePedalListener(score, ref)
    useRateScoreFlow()

    const onSingleTap = async ({ x, width }: { x: number; y: number; width: number }) => {
        if (onScoreTap) {
            onScoreTap()
            return
        }
        if (x < width / 4) {
            actions.setPrevPage()
        } else if (x > (3 / 4) * width) {
            actions.setNextPage()
        } else {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
            actions.toggleFullscreen()
            reportEvent(RT_EVENTS.SCORE_CENTER_CLICK, getScoreMetaEvent(score))
        }
    }

    if (!score) return null

    return (
        <View style={globalStyles.flex1}>
            {!hideXtz && (
                <XTZContainer
                    source={source}
                    score={score}
                    noteSize={noteSize}
                    scrollMode={scrollMode}
                    visibleParts={visiblePartIds}
                    playableParts={playablePartIds.length ? playablePartIds : allPartIds}
                    playbackSpeed={playbackSpeed}
                    metronomeVolume={metronomeVolume}
                    isCountdownEnabled={isCountdownEnabled}
                    onSingleTap={onSingleTap}
                    isKeyboardVisible={isKeyboardVisible}
                    resetCameraOnLoad={resetCameraOnLoad}
                    noteHintsEnabled={noteHintsEnabled}
                />
            )}

            {platform.isIos && <AppleWatchMetronomeContainer score={score} />}
            {platform.isIos && <AppleWatchSendDataContainer score={score} />}
        </View>
    )
}
