import { memo } from 'react'
import { StyleSheet } from 'react-native'

import { AppText, colors, Divider, layoutHelpers, renderTaggedText } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

import { useCurrentScore } from '../../hooks/useCurrentScore.ts'

type TProps = {
    onOpenSongPress: (songId: number) => void
    onOpenArtist: (artistId: number) => void
}

export const DescriptionModalBasedOnBy = memo(({ onOpenSongPress, onOpenArtist }: TProps) => {
    const score = useCurrentScore()

    const songNameCapitalized = score?.songName
        ? layoutHelpers.capitalizeFirstLetter(score.songName)
        : ''

    const onPressComposition = () => {
        if (!score) return
        onOpenSongPress(score.songId)
    }

    const onPressArtist = () => {
        if (!score) return
        onOpenArtist(score.artistId)
    }

    return (
        <>
            <AppText font="f15w400">
                {renderTaggedText(
                    translate('native.artists.based_on_song', { song: songNameCapitalized }),
                    {
                        song: <AppText brandColor="accentPrimary" onPress={onPressComposition} />,
                    },
                )}
            </AppText>
            <AppText font="f15w400">
                {renderTaggedText(
                    translate('native.artists.by_artist', { artist: score?.artistName ?? '' }),
                    {
                        artist: <AppText brandColor="accentPrimary" onPress={onPressArtist} />,
                    },
                )}
            </AppText>
            <Divider style={styles.divider} />
        </>
    )
})
DescriptionModalBasedOnBy.displayName = 'DescriptionModalBasedOnBy'

const styles = StyleSheet.create({
    divider: {
        marginVertical: 16,
        marginHorizontal: 0,
    },

    link: {
        color: colors.link,
    },

    row: {
        flexDirection: 'row',
    },
})
