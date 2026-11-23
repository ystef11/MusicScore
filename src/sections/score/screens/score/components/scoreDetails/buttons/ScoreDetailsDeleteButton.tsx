import { useCallback } from 'react'

import { authStoreChunk } from '@mu-native/auth'
import { MuseButton } from '@mu-native/ds'
import { trashBin } from '@mu-native/icons/trashBin'
import { translate } from '@mu-native/locale'
import { useActions, useValues } from '@ug/store'

import { removeFromMyScores } from '../../../../../../../App/Controllers/ScoreActionsController'
import { MSScoreT } from '../../../types/scoreTypes'

const ScoreDetailsDeleteButton = ({ score }: { score: MSScoreT }) => {
    const [currentUser] = useValues([authStoreChunk.props.getUser])
    const actions = useActions({ removeFromMyScores })

    const showDelete = score?.authorId?.toString() === currentUser?.id?.toString()
    const onPress = useCallback(() => actions.removeFromMyScores(score, true), [actions, score])
    if (!showDelete) return null

    return (
        <MuseButton
            size="small"
            onPress={onPress}
            type="secondary"
            title={translate('native.shared.delete')}
            startIcon={trashBin}
        />
    )
}

export default ScoreDetailsDeleteButton
