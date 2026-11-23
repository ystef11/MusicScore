import { useCallback } from 'react'

import { scoreTestIds } from '@mu/mu-mobile-test-id'
import { authStoreChunk } from '@mu-native/auth'
import { MuseButton, type MuseButtonProps } from '@mu-native/ds'
import { star } from '@mu-native/icons/star'
import { translate } from '@mu-native/locale'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { useActions, useValues } from '@ug/store'

import { tryShowExperimentalRateScoreModal } from '../../../../../../../App/Controllers/ScoreActionsController'
import { isScoreFromCatalog } from '../../../../../../../App/Model/MSScore'
import reportEvent from '../../../../../../../App/Utils/Analytics'
import { getScoreMetaEvent } from '../../../helpers/scoreHelpers.ts'
import { MSScoreT } from '../../../types/scoreTypes'

type TProps = {
    score: MSScoreT
    size?: MuseButtonProps['size']
    adaptiveTextSize?: MuseButtonProps['adaptiveTextSize']
}

export function useScoreRate(score: MSScoreT) {
    const [currentUser] = useValues([authStoreChunk.props.getUser])
    const actions = useActions({ tryShowExperimentalRateScoreModal })
    const showRate = score.authorId !== currentUser?.id && isScoreFromCatalog(score)
    const rated = !!score.userRating

    const onPress = useCallback(() => {
        reportEvent(RT_EVENTS.SCORE_RATING_BUTTON_CLICK, getScoreMetaEvent(score))
        actions.tryShowExperimentalRateScoreModal()
    }, [actions, score])

    return { showRate, rated, onPress }
}

export const ScoreDetailsRateButton = ({ score, size = 'small', adaptiveTextSize }: TProps) => {
    const { showRate, rated, onPress } = useScoreRate(score)

    if (!showRate) return null

    return (
        <MuseButton
            size={size}
            adaptiveTextSize={adaptiveTextSize}
            onPress={onPress}
            type="secondary"
            title={translate('native.score_details_sheet.rate_button')}
            startIcon={star}
            testID={scoreTestIds.scoreDetailsRateButton}
        />
    )
}
