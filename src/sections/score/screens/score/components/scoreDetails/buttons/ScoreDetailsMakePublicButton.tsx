import { memo } from 'react'

import { authStoreChunk } from '@mu-native/auth'
import { MuseButton, type MuseButtonProps } from '@mu-native/ds'
import { userGroup } from '@mu-native/icons/userGroup'
import { translate } from '@mu-native/locale'
import { Screen, useAppNavigation } from '@mu-native/navigation'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { useValues } from '@ug/store'

import { ScorePrivacy } from '../../../../../../../App/Model/MSScore'
import reportEvent from '../../../../../../../App/Utils/Analytics'
import { getScoreMetaEvent } from '../../../helpers/scoreHelpers.ts'
import { MSScoreT } from '../../../types/scoreTypes.ts'

type Props = {
    score: MSScoreT
    size?: MuseButtonProps['size']
    adaptiveTextSize?: MuseButtonProps['adaptiveTextSize']
}

export const ScoreDetailsMakePublicButton = memo(
    ({ score, size = 'small', adaptiveTextSize }: Props) => {
        const navigation = useAppNavigation()
        const [currentUser] = useValues([authStoreChunk.props.getUser])

        const isOwnPrivateScore =
            score.privacy !== ScorePrivacy.PUBLIC &&
            score.authorId?.toString() === currentUser?.id?.toString()

        if (!isOwnPrivateScore) return null

        const onPress = () => {
            reportEvent(RT_EVENTS.SCORE_MAKE_PUBLIC_CLICK, {
                ...getScoreMetaEvent(score),
                'params.key': ['placement'],
                'params.str_value': ['score_details'],
                'params.value': [0],
            })
            navigation.push(Screen.makePublic, { score, placement: 'score_details' })
        }

        return (
            <MuseButton
                size={size}
                adaptiveTextSize={adaptiveTextSize}
                onPress={onPress}
                type="secondary"
                title={translate('native.make_public.make_public_button')}
                startIcon={userGroup}
            />
        )
    },
)
