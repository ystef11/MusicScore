import { memo } from 'react'
import { StyleSheet, View } from 'react-native'

import {
    AppText,
    BadgeComplexity,
    CommonTouchable,
    layout,
    PlayShortcutButton,
} from '@mu-native/ds'

import type { MSScoreT } from '../../../../App/Model/MSScore'
import { resolveScoreByline } from '../api'

import { ScorePreviewImage } from './ScorePreviewImage'

const IMAGE_WIDTH = 93
const IMAGE_HEIGHT = 132

type TProps = {
    score: MSScoreT
    onPress: (score: MSScoreT) => void
    /** Shows the Play pill (MUP-13932); hidden for PDF scores, which have no interactive player. */
    onPlayPress?: (score: MSScoreT) => void
    testID?: string
}

export const ScoreItem = memo(({ score, onPress, onPlayPress, testID }: TProps) => {
    const instruments = score.getShortPartsString?.()
    // §2.1: artist for non-original scores that have one, else the creator username.
    const byline = resolveScoreByline(score)

    return (
        <CommonTouchable onPress={() => onPress(score)} style={styles.container} testID={testID}>
            <ScorePreviewImage score={score} width={IMAGE_WIDTH} height={IMAGE_HEIGHT} />
            <View style={styles.info}>
                <AppText font="f15w500" numberOfLines={2} rawText={score.title} />
                {!!byline && (
                    <AppText
                        font="f13w400"
                        brandColor="contentSecondary"
                        numberOfLines={1}
                        rawText={byline}
                        style={styles.author}
                    />
                )}
                <AppText
                    font="f15w400"
                    numberOfLines={1}
                    rawText={instruments}
                    style={styles.meta}
                />
                {!!score.complexity && (
                    <View style={styles.badge}>
                        <BadgeComplexity complexity={score.complexity} />
                    </View>
                )}
                {!!onPlayPress && !score.isPdf && (
                    <PlayShortcutButton onPress={() => onPlayPress(score)} />
                )}
            </View>
        </CommonTouchable>
    )
})

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: layout.marginMd,
    },
    info: {
        flex: 1,
        gap: layout.marginXs,
    },
    author: {
        marginTop: layout.margin3Xs,
    },
    meta: {
        marginTop: layout.marginSm,
    },
    badge: {
        alignSelf: 'flex-start',
        marginTop: layout.marginXs,
    },
})
