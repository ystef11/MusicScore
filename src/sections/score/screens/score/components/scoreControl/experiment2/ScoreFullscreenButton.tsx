import React, { useCallback } from 'react'
import { LayoutAnimation } from 'react-native'

import { scoreTestIds } from '@mu/mu-mobile-test-id'
import { brandColors } from '@mu-native/ds'
import { expand } from '@mu-native/icons/expand'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { scoreStoreChunk } from '@mu-native/score'
import { useActions, useValues } from '@ug/store'

import { getScoreMetaEvent } from '../../../../../../../App/constants/scoreAnalytic'
import reportEvent from '../../../../../../../App/Utils/Analytics'
import { useCurrentScore } from '../../../hooks/useCurrentScore'

import { ScoreControlButton } from './ScoreControlButton'

type TProps = {
    readonly isEnabled: boolean
}

function useScoreFullscreen() {
    const score = useCurrentScore()
    const actions = useActions({ toggleFullscreen: scoreStoreChunk.actions.toggleFullscreen })
    const [isFullScreen] = useValues([scoreStoreChunk.props.getIsFullScreen])

    const onPress = useCallback(() => {
        actions.toggleFullscreen()
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
        reportEvent(RT_EVENTS.SCORE_FULLSCREEN_BUTTON_CLICK, getScoreMetaEvent(score))
    }, [actions, score])
    return { onPress, isFullScreen }
}

export const ScoreFullscreenButton = React.memo((props: TProps) => {
    const { onPress, isFullScreen } = useScoreFullscreen()

    return (
        <ScoreControlButton
            testID={scoreTestIds.scoreFullscreen}
            icon={expand}
            selected={isFullScreen}
            isEnabled={props.isEnabled}
            onPress={onPress}
            tint={brandColors.exceptionConstantWhite}
        />
    )
})
