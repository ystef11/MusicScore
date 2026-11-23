import { memo, useCallback } from 'react'

import { scoreTestIds } from '@mu/mu-mobile-test-id'
import { authStoreChunk } from '@mu-native/auth'
import { MuseButton, type MuseButtonProps } from '@mu-native/ds'
import { plus } from '@mu-native/icons/plus'
import { translate } from '@mu-native/locale'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { useActions, useValues } from '@ug/store'

import { addIntoSet } from '../../../../../../../App/profileScreens/users/store/userAsyncActions'
import reportEvent from '../../../../../../../App/Utils/Analytics'
import { getScoreMetaEvent } from '../../../helpers/scoreHelpers.ts'
import { MSScoreT } from '../../../types/scoreTypes.ts'

type TProps = {
    score: MSScoreT
    size?: MuseButtonProps['size']
    adaptiveTextSize?: MuseButtonProps['adaptiveTextSize']
}

export const ScoreDetailsAddToSetButton = memo(
    ({ score, size = 'small', adaptiveTextSize }: TProps) => {
        const [currentUser] = useValues([authStoreChunk.props.getUser])
        const actions = useActions({ addIntoSet })

        const onPress = useCallback(() => {
            reportEvent(RT_EVENTS.SET_SCORE_ADD_TO_CLICK, getScoreMetaEvent(score))
            actions.addIntoSet(score)
        }, [actions, score])

        const scoreIsMine = !!currentUser?.id && score.authorId === currentUser.id
        const showAddToSet = !scoreIsMine && (!score.isOffline || !!score.webScoreSaved)
        if (!showAddToSet) return null

        return (
            <MuseButton
                size={size}
                adaptiveTextSize={adaptiveTextSize}
                onPress={onPress}
                type="secondary"
                title={translate('native.score_action_sheet.set_add_button')}
                startIcon={plus}
                testID={scoreTestIds.scoreDetailsAddToSetButton}
            />
        )
    },
)
