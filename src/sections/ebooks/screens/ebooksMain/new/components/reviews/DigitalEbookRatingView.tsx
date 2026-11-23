import { memo } from 'react'
import { StyleSheet, View } from 'react-native'

import { AppText, brandColors, Icon, layout } from '@mu-native/ds'
import { star } from '@mu-native/icons/star'
import { translate } from '@mu-native/locale'
import { useValues } from '@ug/store'

import { useDigitalEbookDetailsChunk } from '../../stores/DigitalEbookDetailsStore.ts'

import { DigitalEbookStarsRatingView } from './DigitalEbookStarsRatingView.tsx'

export function keys<T extends object>(object: T) {
    return Object.keys(object) as Array<keyof T>
}

const StartsLine = ({ count }: { count: number }) => {
    return (
        <>
            {Array(5 - count)
                .fill(null)
                .map((_, index) => (
                    <View key={index} style={{ width: 8 }} />
                ))}
            {Array(count)
                .fill(null)
                .map((_, index) => (
                    <Icon key={index} source={star} tint={brandColors.contentSecondary} size={8} />
                ))}
        </>
    )
}

const LineProgress = ({ progress }: { progress: number }) => {
    return (
        <View style={styles.progressBase}>
            <View style={[styles.progressInner, { flex: progress }]} />
        </View>
    )
}

export const DigitalEbookRatingView = memo(() => {
    const chunk = useDigitalEbookDetailsChunk()
    const [rating] = useValues([chunk.props.getRating])
    if (!rating) return null

    const allKeys = keys(rating.ratings)
    const total = Math.max(
        allKeys.reduce((acc, key) => acc + rating.ratings[key], 0),
        1,
    )
    return (
        <>
            <View style={styles.base}>
                <View style={styles.totalRatingContainer}>
                    <AppText rawText={rating.rating_calculated.toString()} font="f56w400Accent" />
                    <AppText
                        font="f11w400"
                        rawText={translate('native.ebooks.rating', {
                            number: rating.max_rating.toString(),
                        })}
                    />
                </View>

                <View style={styles.detailedRating}>
                    {allKeys.reverse().map((key, index) => (
                        <View key={index} style={styles.line}>
                            <StartsLine count={5 - index} />
                            <LineProgress progress={rating.ratings[key] / total} />
                        </View>
                    ))}
                </View>
            </View>
            <AppText
                rawText={
                    rating.rating_count > 1
                        ? translate('native.shared.ratings', {
                              rating: rating.rating_count.toString(),
                          })
                        : translate('native.shared.rating', {
                              rating: rating.rating_count.toString(),
                          })
                }
                font="f13w400"
                style={styles.ratingCount}
            />
            <DigitalEbookStarsRatingView />
        </>
    )
})

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    totalRatingContainer: {
        flex: 0.7,
        alignItems: 'center',
    },

    line: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    detailedRating: {
        flex: 1.3,
        rowGap: 4,
        alignItems: 'flex-end',
    },

    progressBase: {
        flex: 1,
        height: 2,
        backgroundColor: brandColors.colorBackgroundDisabled,
        marginStart: 8,
        borderRadius: 1,
        flexDirection: 'row',
    },

    progressInner: {
        backgroundColor: brandColors.contentSecondary,
        borderRadius: 1,
        height: 2,
    },

    ratingCount: {
        alignSelf: 'flex-end',
        marginEnd: layout.baseMarginFromEdges,
        marginTop: 8,
    },
})
