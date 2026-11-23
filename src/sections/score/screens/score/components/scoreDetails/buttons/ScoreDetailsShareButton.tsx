import { useCallback } from 'react'

import { scoreTestIds } from '@mu/mu-mobile-test-id'
import { authStoreChunk } from '@mu-native/auth'
import { MuseButton } from '@mu-native/ds'
import { share as shareIcon } from '@mu-native/icons/share'
import { translate } from '@mu-native/locale'
import { Screen, useAppNavigation } from '@mu-native/navigation'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { useValues } from '@ug/store'

import { ScorePrivacy } from '../../../../../../../App/Model/MSScore'
import reportEvent from '../../../../../../../App/Utils/Analytics'
import { getScoreMetaEvent } from '../../../helpers/scoreHelpers.ts'
import { useShareScore } from '../../../hooks/useShareScore'
import { MSScoreT } from '../../../types/scoreTypes'

type TProps = {
    score: MSScoreT
}

const ScoreDetailsShareButton = ({ score }: TProps) => {
    const { isSharing, shareScore } = useShareScore(score)
    const navigation = useAppNavigation()
    const [currentUser] = useValues([authStoreChunk.props.getUser])

    const showShare = !score.isOffline
    const isOwnPrivateScore =
        score.privacy === ScorePrivacy.PRIVATE &&
        score.authorId?.toString() === currentUser?.id?.toString()

    const onPress = useCallback(() => {
        if (isOwnPrivateScore) {
            reportEvent(RT_EVENTS.SCORE_MAKE_PUBLIC_CLICK, {
                ...getScoreMetaEvent(score),
                'params.key': ['placement'],
                'params.str_value': ['score_details_share'],
                'params.value': [0],
            })
            navigation.push(Screen.makePublic, { score, placement: 'score_details_share' })
            return
        }
        reportEvent(RT_EVENTS.SCORE_SHARE_BUTTON_CLICK, getScoreMetaEvent(score))
        shareScore()
    }, [isOwnPrivateScore, navigation, score, shareScore])

    if (!showShare) return null

    return (
        <MuseButton
            size="small"
            onPress={onPress}
            isLoading={isSharing}
            type="secondary"
            title={translate('native.score_action_sheet.share_button')}
            startIcon={shareIcon}
            testID={scoreTestIds.scoreDetailsShareButton}
        />
    )
}

export default ScoreDetailsShareButton
