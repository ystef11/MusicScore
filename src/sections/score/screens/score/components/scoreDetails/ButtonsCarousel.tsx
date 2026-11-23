import { memo } from 'react'
import { StyleSheet } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

import { scoreTestIds } from '@mu/mu-mobile-test-id'
import { layout } from '@mu-native/ds'

import { MSScoreT } from '../../types/scoreTypes'

import { ScoreDetailsAddToSetButton } from './buttons/ScoreDetailsAddToSetButton'
import { ScoreDetailsBuyScoreButton } from './buttons/ScoreDetailsBuyScoreButton.tsx'
import ScoreDetailsDeleteButton from './buttons/ScoreDetailsDeleteButton'
import { ScoreDetailsDownloadButton } from './buttons/ScoreDetailsDownloadButton'
import { ScoreDetailsMakePublicButton } from './buttons/ScoreDetailsMakePublicButton'
import { ScoreDetailsSaveButton } from './buttons/ScoreDetailsSaveButton'
import ScoreDetailsShareButton from './buttons/ScoreDetailsShareButton'

type Props = {
    score: MSScoreT
}

export const ButtonsCarousel = memo(({ score }: Props) => {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.newContainer}
            testID={scoreTestIds.scoreDetailsButtonsCarousel}
        >
            <ScoreDetailsMakePublicButton key="makePublic" score={score} />
            <ScoreDetailsBuyScoreButton key="buyScore" score={score} />
            <ScoreDetailsDownloadButton key="download" score={score} />
            <ScoreDetailsSaveButton key="save" score={score} />
            <ScoreDetailsAddToSetButton key="addToSet" score={score} />
            <ScoreDetailsShareButton key="share" score={score} />
            <ScoreDetailsDeleteButton key="delete" score={score} />
        </ScrollView>
    )
})

const styles = StyleSheet.create({
    newContainer: {
        marginTop: 16,
        columnGap: 8,
        paddingHorizontal: layout.baseMarginFromEdges,
    },
})
