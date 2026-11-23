import { memo } from 'react'
import { StyleSheet, View } from 'react-native'

import { AppText, brandColors, CommonTouchable, FastImage, layout } from '@mu-native/ds'

import type { MSScoreT } from '../../../../App/Model/MSScore'

const IMAGE_SIZE = 40
const MIN_HEIGHT = 56

type TProps = {
    score: MSScoreT
    onPress: (score: MSScoreT) => void
    testID?: string
}

export const ScoreSmallItem = memo(({ score, onPress, testID }: TProps) => (
    <CommonTouchable onPress={() => onPress(score)} style={styles.container} testID={testID}>
        <View style={styles.imageWrapper}>
            <FastImage
                style={styles.image}
                source={score.previewImageUrl ? { uri: score.previewImageUrl } : undefined}
                resizeMode="cover"
            />
        </View>
        <AppText font="f15w500" numberOfLines={2} rawText={score.title} style={styles.title} />
    </CommonTouchable>
))

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: brandColors.backgroundInactive,
        borderRadius: 1,
        padding: layout.marginSm,
        gap: layout.marginXm,
        minHeight: MIN_HEIGHT,
    },
    imageWrapper: {
        width: IMAGE_SIZE,
        height: IMAGE_SIZE,
        borderRadius: 1,
        overflow: 'hidden',
    },
    image: {
        width: IMAGE_SIZE,
        height: IMAGE_SIZE,
    },
    title: {
        flex: 1,
    },
})
