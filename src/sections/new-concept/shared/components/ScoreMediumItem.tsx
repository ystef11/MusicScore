import { memo } from 'react'
import { StyleSheet, View } from 'react-native'

import { AppText, CommonTouchable, layout } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

import type { MSScoreT } from '../../../../App/Model/MSScore'

import { ScorePreviewImage } from './ScorePreviewImage'

const IMAGE_SIZE = 93

type TProps = {
    score: MSScoreT
    onPress: (score: MSScoreT) => void
    testID?: string
}

const getInstrumentLabel = (score: MSScoreT) => {
    const firstInstrument = score.instruments?.[0]?.name
    if (score.partsCount > 1 || !firstInstrument) {
        return translate('native.score.parts_count', { count: score.partsCount })
    }
    return firstInstrument
}

export const ScoreMediumItem = memo(({ score, onPress, testID }: TProps) => (
    <CommonTouchable onPress={() => onPress(score)} style={styles.container} testID={testID}>
        <ScorePreviewImage score={score} width={IMAGE_SIZE} height={IMAGE_SIZE} />
        <View style={styles.info}>
            <AppText font="f13w500" numberOfLines={2} rawText={score.title} style={styles.title} />
            <AppText
                font="f13w400"
                brandColor="contentSecondary"
                numberOfLines={1}
                rawText={getInstrumentLabel(score)}
            />
        </View>
    </CommonTouchable>
))

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: layout.marginXm,
    },
    info: {
        flex: 1,
        gap: layout.marginSm,
    },
    title: {
        lineHeight: 16,
    },
})
