import { memo } from 'react'
import { StyleSheet, View } from 'react-native'

import { colors, useAppSafeArea } from '@mu-native/ds'
import { scoreStoreChunk, TScoreSourceFile } from '@mu-native/score'
import { useValues } from '@ug/store'

import { InteractiveScoreContainer } from '../../containers/InteractiveScoreContainer.tsx'
import { PdfScoreViewerContainer } from '../../containers/PdfScoreViewerContainer.tsx'
import { ScoreDetailsContainer } from '../../containers/ScoreDetailsContainer.tsx'
import { ScoreScreenHeader } from '../scoreHeader/ScoreScreenHeader.tsx'

import ScoreLoadingPlaceholder from './ScoreLoadingPlaceholder.tsx'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
        minHeight: '100%',
    },
})

type Props = {
    source: TScoreSourceFile | null
}

export const ScoreScreenComponent = memo(({ source }: Props) => {
    const [isScoreLoaded, pageLayoutType, pianoKeyboardHeight] = useValues([
        scoreStoreChunk.props.getIsSuccessLoading,
        scoreStoreChunk.props.getPageLayoutType,
        scoreStoreChunk.props.getPianoKeyboardHeight,
    ])
    const { bottom } = useAppSafeArea({ bottom: 8 })
    const playerViewHeight = 44
    const bottomPlaceholderHeight = playerViewHeight + bottom + 16 + pianoKeyboardHeight

    const isPlaceholderNeeded = pageLayoutType === 'horizontal' && source?.type !== 'pdf'

    return (
        <View style={styles.container}>
            {source?.type === 'pdf' && <PdfScoreViewerContainer source={source} />}
            {source?.type === 'interactive' && <InteractiveScoreContainer source={source} />}
            <ScoreLoadingPlaceholder isLoading={!isScoreLoaded} />
            {isPlaceholderNeeded && <View style={{ height: bottomPlaceholderHeight }} />}
            <ScoreDetailsContainer />
            <ScoreScreenHeader isScoreLoaded={isScoreLoaded} />

        </View>
    )
})
