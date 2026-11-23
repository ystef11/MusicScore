import { type ReactNode } from 'react'
import { Dimensions, StyleProp, StyleSheet, View, ViewStyle } from 'react-native'

import { useDimensions } from '@mu-native/common'
import {
    AppText,
    CommonTouchable,
    layout,
    PlayShortcutButton,
    ScoreListItemRatingInstruments,
    ScorePreviewImage,
} from '@mu-native/ds'

import type { MSScoreT } from '../../Model/MSScore'
import { isTablet } from '../../Utils/Platform.ts'
import Utils from '../../Utils/Utils.ts'

import { ScoreItemAuthor } from './item/ScoreItemAuthor.tsx'
import { ScoreItemTitle } from './item/ScoreItemTitle.tsx'

type Props = {
    score: MSScoreT
    onScorePress?: (score: MSScoreT) => void
    onScorePlayPress?: (score: MSScoreT) => void
    disabled?: boolean
    style?: StyleProp<ViewStyle>
    isOdd?: boolean
    variant?: 'basic' | 'favorites' | 'myScores'
    testID?: string
    renderExtra?: (score: MSScoreT) => ReactNode
    renderTrailing?: (score: MSScoreT) => ReactNode
}

export const ScoreListItem = ({
    score,
    onScorePress,
    onScorePlayPress,
    disabled,
    style,
    isOdd,
    variant = 'basic',
    testID,
    renderExtra,
    renderTrailing,
}: Props) => {
    const dimensions = useDimensions('window')

    const onPress = () => {
        onScorePress?.(score)
    }

    const isPro = !!score?.authorPro && !score?.isOfficial

    const isFavoriteVariant = variant === 'favorites'
    const isMyScoresVariant = variant === 'myScores'

    const containerStyle: StyleProp<ViewStyle>[] = [styles.container, style]

    if (isTablet) {
        containerStyle.push({
            width: (dimensions.width - layout.baseMarginFromEdges * 2) / 2 - 8,
            marginStart: isOdd ? layout.baseMarginFromEdges : 8,
            paddingHorizontal: 0,
        })
    }

    if (isFavoriteVariant) {
        containerStyle.push(styles.favoriteVariantContainer)
    }

    const content = (
        <>
            <ScorePreviewImage
                url={score?.previewImageUrl}
                isOfficial={score?.isOfficial}
                purchaseSource={score?.purchaseSource}
                original={score?.isOrigin}
                complexity={score?.complexity}
                blocked={score?.score_blocked_by_country}
                size={isFavoriteVariant ? styles.favoriteVariantImage : undefined}
                privacy={isMyScoresVariant ? score?.privacy : undefined}
            />
            <View style={[styles.titleContainer, isFavoriteVariant && styles.favoriteVariantTitle]}>
                <ScoreItemTitle score={score} />

                {!isMyScoresVariant && !!score?.authorName && (
                    <ScoreItemAuthor score={score} isPro={isPro} />
                )}
                {!isMyScoresVariant && !score?.isOffline && (
                    <ScoreListItemRatingInstruments
                        text={score.getDescriptionInstrumentsString()}
                        ratingTitle={` ${Utils.toNumber(score?.rating)}`}
                    />
                )}
                {isMyScoresVariant && !score?.isOffline && (
                    <AppText
                        font="f15w400"
                        brandColor="contentSecondary"
                        numberOfLines={1}
                        rawText={score.getDescriptionInstrumentsString().replace(/^\s*·\s*/, '')}
                    />
                )}
                {!!onScorePlayPress && !score?.isPdf && (
                    <PlayShortcutButton onPress={() => onScorePlayPress(score)} />
                )}
                {renderExtra?.(score)}
            </View>
        </>
    )

    if (renderTrailing) {
        return (
            <View style={containerStyle}>
                <CommonTouchable onPress={onPress} disabled={disabled} style={styles.scoreContent} testID={testID}>
                    {content}
                </CommonTouchable>
                {renderTrailing(score)}
            </View>
        )
    }

    return (
        <CommonTouchable onPress={onPress} disabled={disabled} style={containerStyle} testID={testID}>
            {content}
        </CommonTouchable>
    )
}

const styles = StyleSheet.create({
    scoreContent: { flex: 1, flexDirection: 'row' },
    titleContainer: {
        flex: 1,
        marginStart: 8,
        rowGap: 4,
    },
    container: {
        width: '100%',
        flexDirection: 'row',
        paddingHorizontal: layout.baseMarginFromEdges,
    },
    favoriteVariantContainer: {
        width: isTablet
            ? Dimensions.get('screen').width * 0.6
            : Dimensions.get('screen').width * 0.8,
        height: isTablet ? 180 : 160,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        paddingHorizontal: 0,
    },
    favoriteVariantImage: {
        width: 160,
        height: 160,
    },
    favoriteVariantTitle: { marginTop: 8 },
})
