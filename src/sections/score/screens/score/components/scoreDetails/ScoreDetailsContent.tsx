import React, { memo, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { AppText, colors, layout, SafeAreaView } from '@mu-native/ds'
import { scoreTestIds } from '@mu/mu-mobile-test-id'

import { isScoreFromCatalog } from '../../../../../../App/Model/MSScore'

import { ScoreDetailsFavoriteButton } from './buttons/ScoreDetailsFavoriteButton'
import { ButtonsCarousel } from './ButtonsCarousel'
import { ScoreDescription } from './ScoreDescription'
import { ScoreDetailHighlightComment } from './ScoreDetailHighlightComment.tsx'
import { ScoreDetailsTitle } from './ScoreDetailsTitle.tsx'
import { ScoreDetailUploaderProfileDetails } from './ScoreDetailUploaderProfileDetails.tsx'
import { MSScoreT } from '../../types/scoreTypes.ts'

type Props = {
    score: MSScoreT
}

const SheetTitle = memo((props: Props) => {
    const [linesCount, setLinesCount] = useState(1)
    return (
        <View
            style={[styles.titleWrapper, { alignItems: linesCount >= 2 ? 'flex-start' : 'center' }]}
        >
            <ScoreDetailsTitle title={props.score.title} onLinesCalculated={setLinesCount} />
            <ScoreDetailsFavoriteButton key="favorite" score={props.score} />
        </View>
    )
})

const ScoreDetailsContent = ({ score }: Props) => {
    const isFromCatalog = isScoreFromCatalog(score)

    return (
        <SafeAreaView edges={['left', 'right']} style={styles.container}>
            <View style={styles.wrapper}>
                <SheetTitle score={score} />
                {!!score.artistName && (
                    <AppText
                        style={styles.artistName}
                        brandColor="contentSecondary"
                        rawText={score.artistName || ' '}
                        testID={scoreTestIds.scoreDetailsArtistName}
                    />
                )}
            </View>
            <ButtonsCarousel score={score} />
            <View style={styles.wrapper}>
                {isFromCatalog && (
                    <>
                        <ScoreDetailHighlightComment score={score} />
                        <ScoreDescription score={score} />
                        <View style={styles.divider} />
                        <ScoreDetailUploaderProfileDetails score={score} />
                    </>
                )}
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingBottom: layout.marginSm,
    },
    wrapper: {
        paddingHorizontal: layout.baseMarginFromEdges,
    },
    divider: {
        height: 1,
        backgroundColor: colors.text900,
        opacity: 0.1,
        marginVertical: 12,
    },
    titleWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 12,
    },
    artistName: {
        marginTop: 4,
    },
})

export default React.memo(ScoreDetailsContent)
