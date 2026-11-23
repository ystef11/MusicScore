import { StyleSheet, View } from 'react-native'

import { localizeNumber } from '@mu-native/locale/i18n'

import { brandColors } from '../../constants/new/brandColors.ts'
import { CommonTouchable } from '../../elements/CommonTouchable.tsx'
import { AppText } from '../AppText/AppText'
import { ScoreListItemRatingInstruments } from '../scoreListItem/ScoreListItemRatingInstruments'
import { ScorePreviewImage } from '../scoreListItem/ScorePreviewImage'

import { PlayShortcutButton } from '../scoreListItem/PlayShortcutButton.tsx'

import { CarouselScoreFavoriteButton } from './CarouselScoreFavoriteButton.tsx'
import { TScoreConstraints } from './carouselScoreItemTypes.ts'

type TProps<TScore extends TScoreConstraints> = {
    onPress: (score: TScore) => void
    score: TScore
    disabled?: boolean
    testID?: string
    onFavoritePress?: (score: TScore) => void
    onPlayPress?: (score: TScore) => void
}

export const CarouselScoreItem = <TScore extends TScoreConstraints>({
    onPress,
    disabled,
    score,
    testID,
    onFavoritePress,
    onPlayPress,
}: TProps<TScore>) => {
    const ratingTitle =
        score?.rating == null ? '' : ` ${localizeNumber(score.rating, { precision: 1 })}`
    const onCardPress = () => onPress(score)
    const onFavoriteAdd = () => onFavoritePress?.(score)

    const card = (
        <CommonTouchable
            onPress={onCardPress}
            disabled={disabled}
            style={styles.bigContainer}
            testID={testID}
        >
            <ScorePreviewImage
                url={score?.previewImageUrl}
                isOfficial={score?.isOfficial}
                original={score?.isOrigin}
                complexity={score?.complexity}
                blocked={score?.score_blocked_by_country}
                size={styles.previewSize}
            />
            <View style={styles.bigTitleContainer}>
                <AppText font="f15w500" numberOfLines={1} rawText={score.title} />
                {!!score?.authorName && (
                    <AppText
                        font="f15w400"
                        brandColor="contentSecondary"
                        numberOfLines={1}
                        rawText={score.authorName}
                    />
                )}
                {!score?.isOffline && (
                    <ScoreListItemRatingInstruments
                        text={score.getDescriptionInstrumentsString()}
                        ratingTitle={ratingTitle}
                    />
                )}
                {!!onPlayPress && !score?.isPdf && (
                    <PlayShortcutButton onPress={() => onPlayPress(score)} />
                )}
            </View>
        </CommonTouchable>
    )

    if (!onFavoritePress) {
        return card
    }

    return (
        <View style={styles.favoriteOverlayContainer}>
            {card}
            <CarouselScoreFavoriteButton score={score} onFavoritePress={onFavoriteAdd} />
        </View>
    )
}

const CAROUSEL_SCORE_ITEM_SIZE = 160

const styles = StyleSheet.create({
    previewSize: {
        width: CAROUSEL_SCORE_ITEM_SIZE,
        height: CAROUSEL_SCORE_ITEM_SIZE,
    },

    bigContainer: {
        alignSelf: 'center',
        width: CAROUSEL_SCORE_ITEM_SIZE,
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: brandColors.exceptionConstantWhite,
    },

    favoriteOverlayContainer: {
        position: 'relative',
        alignSelf: 'center',
        width: CAROUSEL_SCORE_ITEM_SIZE,
    },

    bigTitleContainer: {
        marginTop: 8,
        alignItems: 'flex-start',
        rowGap: 4,
    },
})
