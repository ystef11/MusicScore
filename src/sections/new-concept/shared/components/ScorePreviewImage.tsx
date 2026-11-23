import { memo } from 'react'
import { StyleSheet, View } from 'react-native'

import { BadgeOfficial, BadgePurchasedStore, brandColors, FastImage, layout } from '@mu-native/ds'

import type { MSScoreT } from '../../../../App/Model/MSScore'

type TProps = {
    score: MSScoreT
    width: number
    height: number
    borderRadius?: number
}

// Score preview artwork with the "Official" badge overlaid bottom-left when
// the score is official — shared by every score card size. An SMP/SMD purchase
// badge replaces "Official" when both apply (MUP-13968).
export const ScorePreviewImage = memo(({ score, width, height, borderRadius = 1 }: TProps) => {
    const { purchaseSource } = score

    return (
        <View>
            <FastImage
                style={[styles.image, { width, height, borderRadius }]}
                source={score.previewImageUrl ? { uri: score.previewImageUrl } : undefined}
                resizeMode="cover"
            />
            {(!!purchaseSource || score.isOfficial) && (
                <View style={styles.badge}>
                    {purchaseSource ? (
                        <BadgePurchasedStore store={purchaseSource} />
                    ) : (
                        <BadgeOfficial />
                    )}
                </View>
            )}
        </View>
    )
})

const styles = StyleSheet.create({
    image: {
        backgroundColor: brandColors.backgroundInactive,
        borderWidth: 1,
        borderColor: brandColors.strokeDefault,
        borderRadius: 1,
    },
    badge: {
        position: 'absolute',
        left: layout.marginXs,
        bottom: layout.marginXs,
    },
})
