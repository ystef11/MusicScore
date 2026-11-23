import React, { useRef } from 'react'
import { type ViewInstance } from 'react-native'

import { scoreTestIds } from '@mu/mu-mobile-test-id'
import { brandColors } from '@mu-native/ds'
import { cursor } from '@mu-native/icons/cursor'
import { scoreStoreChunk, scoreThunks } from '@mu-native/score'
import { useActions, useValues } from '@ug/store'


import { ScoreControlButton } from './ScoreControlButton'

type TProps = {
    readonly isEnabled: boolean
}

export function useScoreCursor() {
    const [isCursorVisible] = useValues([scoreStoreChunk.props.getIsCursorVisible])

    const actions = useActions({
        setCursorVisible: scoreThunks.toggleCursorVisibility,
    })

    const onPress = actions.setCursorVisible

    return { onPress, isCursorVisible }
}

export const ScoreCursorButton = React.memo((props: TProps) => {
    const { isCursorVisible, onPress } = useScoreCursor()
    const ref = useRef<ViewInstance>(null)
    return (
        <>
            <ScoreControlButton
                ref={ref}
                testID={scoreTestIds.scoreCursor}
                icon={cursor}
                onPress={onPress}
                selected={isCursorVisible}
                isEnabled={props.isEnabled}
                tint={brandColors.exceptionConstantWhite}
            />

        </>
    )
})
