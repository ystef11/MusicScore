import React, { useCallback } from 'react'

import { scoreTestIds } from '@mu/mu-mobile-test-id'
import { brandColors } from '@mu-native/ds'
import { loop } from '@mu-native/icons/loop'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { scoreStoreChunk, scoreThunks } from '@mu-native/score'
import { useActions, useValues } from '@ug/store'

import { getScoreMetaEvent } from '../../../../../../../App/constants/scoreAnalytic'
import reportEvent from '../../../../../../../App/Utils/Analytics'
import { useCurrentScore } from '../../../hooks/useCurrentScore'

import { ScoreControlButton } from './ScoreControlButton'

type TProps = {
    readonly isEnabled: boolean
    readonly background?: string
    readonly tint?: string
    readonly selectedBorderColor?: string
}

export function useScoreLoopButton() {
    const score = useCurrentScore()
    const [isLoopEnabled, isKeyboardVisible] = useValues([
        scoreStoreChunk.props.getIsLoopEnabled,
        scoreStoreChunk.props.getIsKeyboardVisible,
    ])

    const actions = useActions({
        toggleLoop: scoreThunks.toggleLoop,
    })

    const onPress = useCallback(() => {
        reportEvent(
            RT_EVENTS.CHANGE_LOOP_STATUS,
            isKeyboardVisible ? { ui: 'keyboard' } : undefined,
        )
        reportEvent(
            isLoopEnabled ? RT_EVENTS.SCORE_LOOP_REMOVE : RT_EVENTS.SCORE_LOOP_CLICK,
            getScoreMetaEvent(score),
        )
        actions.toggleLoop()
    }, [actions, isKeyboardVisible, isLoopEnabled, score])
    return { onPress, isLoopEnabled }
}

export const ScoreLoopButton = React.memo((props: TProps) => {
    const { onPress, isLoopEnabled } = useScoreLoopButton()

    return (
        <ScoreControlButton
            testID={scoreTestIds.scoreLoop}
            icon={loop}
            isEnabled={props.isEnabled}
            onPress={onPress}
            selected={isLoopEnabled}
            background={props.background}
            tint={props.tint ?? brandColors.exceptionConstantWhite}
            selectedBorderColor={props.selectedBorderColor}
        />
    )
})
