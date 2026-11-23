import { useCallback } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'

import { layout, staticSafeArea } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { Screen, useAppNavigation, useNavHeader } from '@mu-native/navigation'

import { DescriptionModalBasedOnBy } from '../components/modals/DescriptionModalBasedOnBy.tsx'
import { DescriptionModalMetaInfo } from '../components/modals/DescriptionModalMetaInfo.tsx'
import { ScoreDescriptionModalDescription } from '../components/modals/ScoreDescriptionModalDescription.tsx'
import { ScoreDescriptionModalInfo } from '../components/modals/ScoreDescriptionModalInfo.tsx'
import { ScoreDetailsTitle } from '../components/scoreDetails/ScoreDetailsTitle.tsx'
import { ScoreDetailUploaderProfileDetails } from '../components/scoreDetails/ScoreDetailUploaderProfileDetails.tsx'
import { useCurrentScore } from '../hooks/useCurrentScore.ts'

export const ScoreDetailsInformationScreen = () => {
    useNavHeader(translate('native.score.about_this_score'), false)
    const score = useCurrentScore()
    const navigation = useAppNavigation()

    const onOpenSongPress = useCallback(
        (compositionId: number) => {
            navigation.push(Screen.songSheetmusic, { compositionId })
        },
        [navigation],
    )

    const onOpenArtistPress = useCallback(
        (artistId: number) => {
            navigation.push(Screen.artist, { artistId })
        },
        [navigation],
    )

    if (!score) return null

    return (
        <View style={styles.base}>
            <ScrollView contentContainerStyle={styles.contentContainer}>
                <ScoreDetailsTitle
                    numberOfLines={30}
                    title={score?.title ?? ''}
                    textAlign="center"
                />
                <ScoreDescriptionModalInfo score={score} />
                <ScoreDescriptionModalDescription />
                <DescriptionModalBasedOnBy
                    onOpenSongPress={onOpenSongPress}
                    onOpenArtist={onOpenArtistPress}
                />
                <DescriptionModalMetaInfo />
            </ScrollView>
            <ScoreDetailUploaderProfileDetails score={score} />
        </View>
    )
}

const styles = StyleSheet.create({
    base: {
        paddingHorizontal: layout.baseMarginFromEdges,
        flex: 1,
        paddingBottom: staticSafeArea().bottom,
    },

    contentContainer: {
        paddingTop: 20,
    },
})
