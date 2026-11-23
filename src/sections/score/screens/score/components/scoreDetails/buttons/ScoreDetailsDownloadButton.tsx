import { memo } from 'react'

import { scoreTestIds } from '@mu/mu-mobile-test-id'
import { MuseButton, type MuseButtonProps, nativePresentFittedSheet } from '@mu-native/ds'
import { download } from '@mu-native/icons/download'
import { translate } from '@mu-native/locale'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { scoreStoreChunk } from '@mu-native/score'
import { useActions } from '@ug/store'

import reportEvent from '../../../../../../../App/Utils/Analytics'
import { getScoreMetaEvent } from '../../../helpers/scoreHelpers.ts'
import { MSScoreT } from '../../../types/scoreTypes.ts'

export const ScoreDetailsDownloadButton = memo(
    ({
        score,
        size = 'small',
        adaptiveTextSize,
    }: {
        score: MSScoreT
        size?: MuseButtonProps['size']
        adaptiveTextSize?: MuseButtonProps['adaptiveTextSize']
    }) => {
        const actions = useActions({
            setIsOpenBuyScoreModal: scoreStoreChunk.actions.setIsOpenBuyScoreModal,
        })

        const onPress = () => {
            reportEvent(RT_EVENTS.SCORE_DOWNLOAD_BUTTON_CLICK, getScoreMetaEvent(score))

            if (!score.isPurchased && !score.isPublicDomain && (score.isPdf || score.isOfficial)) {
                actions.setIsOpenBuyScoreModal(true)

                return
            }

            nativePresentFittedSheet('downloadScoreSheet')
        }

        return (
            <MuseButton
                size={size}
                adaptiveTextSize={adaptiveTextSize}
                onPress={onPress}
                type="secondary"
                title={translate('native.score_details_sheet.download_button')}
                startIcon={download}
                testID={scoreTestIds.scoreDetailsDownloadButton}
            />
        )
    },
)
