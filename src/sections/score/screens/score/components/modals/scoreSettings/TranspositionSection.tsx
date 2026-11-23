import { memo, useCallback } from 'react'
import { StyleSheet, View } from 'react-native'

import { scoreTestIds } from '@mu/mu-mobile-test-id'
import { AppText, ListSectionHeader, MuseButton, useSheetHorizontalInset } from '@mu-native/ds'
import { minus } from '@mu-native/icons/minus'
import { plus } from '@mu-native/icons/plus'
import { translate } from '@mu-native/locale'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import {
    getCurrentScoreSettings,
    getCurrentScoreTransposition,
    scoreThunks,
} from '@mu-native/score'
import { useActions, useValues } from '@ug/store'

import { getScoreMetaEvent } from '../../../../../../../App/constants/scoreAnalytic'
import reportEvent from '../../../../../../../App/Utils/Analytics'
import { useCurrentScore } from '../../../hooks/useCurrentScore'

type Props = {
    /**
     * When rendered as the dedicated Transpose sheet of the new Score Play View
     * (MUP-13932) the sheet already shows a title, so the section header is
     * hidden. The legacy general settings sheet renders it without the flag and
     * keeps its own section header.
     */
    standalone?: boolean
}

export const TranspositionSection = memo(({ standalone = false }: Props) => {
    const score = useCurrentScore()
    const [settings, transpose] = useValues([getCurrentScoreSettings, getCurrentScoreTransposition])
    const { transposeDiff } = settings
    const actions = useActions({ setTranspose: scoreThunks.setTranspose })

    const changeTranspose = useCallback(
        (transposeDiff: number) => {
            reportEvent(RT_EVENTS.MIXER_CHANGE_TRANSPOSITION, { value: transposeDiff })
            reportEvent(RT_EVENTS.SCORE_TRANSPOSE_SET_CLICK, {
                ...getScoreMetaEvent(score),
                'params.key': ['transpose_value'],
                'params.str_value': [`${transposeDiff}`],
                'params.value': [transposeDiff],
            })
            actions.setTranspose(transposeDiff)
        },
        [actions, score],
    )

    const incrementTranspose = useCallback(() => {
        const currentTranspose = transposeDiff + 1
        changeTranspose(currentTranspose)
    }, [changeTranspose, transposeDiff])

    const decrementTranspose = useCallback(() => {
        const currentTranspose = transposeDiff - 1
        changeTranspose(currentTranspose)
    }, [changeTranspose, transposeDiff])

    const resetTranspose = useCallback(() => {
        changeTranspose(0)
    }, [changeTranspose])

    const transposeValue = `${transpose ?? ''} (${transposeDiff > 0 ? '+' : ''}${transposeDiff})`
    const inset = useSheetHorizontalInset()

    return (
        <>
            {!standalone && (
                <ListSectionHeader title={translate('native.score.transposition_title')} />
            )}
            <View style={[styles.content, { paddingHorizontal: inset }]}>
                <AppText
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    rawText={transposeValue}
                    font="f17w400"
                    style={styles.textWrapper}
                    testID={scoreTestIds.scoreSettingsTransposeValue}
                />
                <MuseButton
                    onPress={decrementTranspose}
                    startIcon={minus}
                    type="secondary"
                    size="large"
                    haptic
                />
                <MuseButton
                    onPress={incrementTranspose}
                    startIcon={plus}
                    type="secondary"
                    haptic
                    testID={scoreTestIds.scoreSettingsTransposeUpButton}
                />
                <MuseButton
                    title={translate('native.score.default_title')}
                    onPress={resetTranspose}
                    type="secondary"
                    haptic
                />
            </View>
        </>
    )
})

const styles = StyleSheet.create({
    content: {
        flexDirection: 'row',
        paddingVertical: 12,
        alignItems: 'center',
        gap: 8,
    },
    textWrapper: {
        flex: 1,
        marginHorizontal: 4,
    },
    buttonsWrapper: {
        flex: 1,
        marginHorizontal: 4,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
})
