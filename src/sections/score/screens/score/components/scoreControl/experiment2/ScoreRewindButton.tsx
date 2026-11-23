import React, { useCallback } from 'react'

import { scoreTestIds } from '@mu/mu-mobile-test-id'
import { brandColors } from '@mu-native/ds'
import { skipPrevious } from '@mu-native/icons/skipPrevious'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { xtz } from '@mu-native/xtz'

import reportEvent from '../../../../../../../App/Utils/Analytics'
import { getScoreMetaEvent } from '../../../helpers/scoreHelpers.ts'
import { useCurrentScore } from '../../../hooks/useCurrentScore'

import { ScoreControlButton } from './ScoreControlButton'

type TProps = {
    readonly isEnabled: boolean
    readonly background?: string
    readonly tint?: string
}

function useScoreRewind() {
    const score = useCurrentScore()

    const onPressRewind = useCallback(async () => {
        reportEvent(RT_EVENTS.SCORE_REWIND, getScoreMetaEvent(score))
        await xtz.rewind()
    }, [score])

    return { onPress: onPressRewind }
}

export const ScoreRewindButton = React.memo((props: TProps) => {
    const { onPress } = useScoreRewind()
    return (
        <ScoreControlButton
            testID={scoreTestIds.scoreRewind}
            tint={props.tint ?? brandColors.exceptionConstantWhite}
            icon={skipPrevious}
            isEnabled={props.isEnabled}
            onPress={onPress}
            background={props.background}
        />
    )
})
