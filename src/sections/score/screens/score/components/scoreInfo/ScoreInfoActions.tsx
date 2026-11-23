import { memo } from 'react'
import { StyleSheet, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

import { layout, MuseButton } from '@mu-native/ds'
import { play } from '@mu-native/icons/play'
import { translate } from '@mu-native/locale'

import { MSScoreT } from '../../types/scoreTypes'
import { ScoreDetailsAddToSetButton } from '../scoreDetails/buttons/ScoreDetailsAddToSetButton'
import { ScoreDetailsBuyScoreButton } from '../scoreDetails/buttons/ScoreDetailsBuyScoreButton'
import { ScoreDetailsDownloadButton } from '../scoreDetails/buttons/ScoreDetailsDownloadButton'
import { ScoreDetailsMakePublicButton } from '../scoreDetails/buttons/ScoreDetailsMakePublicButton'
import { ScoreDetailsSaveButton } from '../scoreDetails/buttons/ScoreDetailsSaveButton'

type Props = {
    score: MSScoreT
    onPlay: () => void
    /**
     * When rendered inside the tablet header's right column, drop the screen-edge
     * horizontal margins so the actions align with the column, not the screen.
     */
    inColumn?: boolean
}

/**
 * Primary "Play" action plus the secondary actions row (Buy / Download / Save /
 * Add to set) of the Score Info screen. Each secondary button hides
 * itself when it doesn't apply to the current score.
 */
export const ScoreInfoActions = memo(({ score, onPlay, inColumn }: Props) => {
    return (
        <View style={styles.container}>
            <MuseButton
                type="primary"
                size="large"
                title={translate('native.score_info.play_button')}
                startIcon={play}
                onPress={onPlay}
                adaptiveTextSize={false}
                style={inColumn ? undefined : styles.playButton}
            />
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[styles.row, inColumn && styles.rowInColumn]}
            >
                <ScoreDetailsMakePublicButton score={score} size="large" adaptiveTextSize={false} />
                <ScoreDetailsBuyScoreButton
                    score={score}
                    sizeButton="large"
                    adaptiveTextSize={false}
                />
                <ScoreDetailsDownloadButton score={score} size="large" adaptiveTextSize={false} />
                <ScoreDetailsSaveButton score={score} size="large" adaptiveTextSize={false} />
                <ScoreDetailsAddToSetButton score={score} size="large" adaptiveTextSize={false} />
            </ScrollView>
        </View>
    )
})
ScoreInfoActions.displayName = 'ScoreInfoActions'

const styles = StyleSheet.create({
    container: {
        marginTop: 16,
    },
    playButton: {
        marginHorizontal: layout.baseMarginFromEdges,
    },
    row: {
        columnGap: 4,
        paddingHorizontal: layout.baseMarginFromEdges,
        marginTop: 8,
    },
    rowInColumn: {
        paddingHorizontal: 0,
    },
})
