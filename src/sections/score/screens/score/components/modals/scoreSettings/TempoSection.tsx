import { memo, useCallback } from 'react'
import { StyleSheet, View } from 'react-native'

import { brandColors, ListSectionHeader, MuseButton, Slider } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { getCurrentScoreMeta, getCurrentScoreSettings, scoreThunks } from '@mu-native/score'
import { useActions, useValues } from '@ug/store'

import { getScoreMetaEvent } from '../../../../../../../App/constants/scoreAnalytic'
import reportEvent from '../../../../../../../App/Utils/Analytics'
import { getCurrentBpm } from '../../../helpers/bpmHelpers'
import { useCurrentScore } from '../../../hooks/useCurrentScore'

const DEFAULT_TEMPO = 1
const MIN_TEMPO_PERCENT = 10
const MAX_TEMPO_PERCENT = 200

const toTempoMultiplier = (value: number) => (value + MIN_TEMPO_PERCENT) / 100
const formatPercent = (value: number) => `${value}%`
const formatTempoPercent = (value: number) => formatPercent(value + MIN_TEMPO_PERCENT)
const formatTempoBpm = (baseBpm: number, tempo: number) =>
    translate('native.score.bpm_value', { bpm: String(getCurrentBpm(baseBpm, tempo)) })

type Props = {
    standalone?: boolean
}

export const TempoSection = memo(({ standalone = false }: Props) => {
    const score = useCurrentScore()
    const [settings, meta] = useValues([getCurrentScoreSettings, getCurrentScoreMeta])
    const actions = useActions({ setTempo: scoreThunks.setTempo })
    const { tempo } = settings
    const scoreBpm = score?.bpm ?? 0
    const baseBpm = Number.isFinite(scoreBpm) && scoreBpm > 0 ? scoreBpm : meta?.bpm ?? 0
    const showBpm = standalone && Number.isFinite(baseBpm) && baseBpm > 0

    const setTempo = useCallback(
        (nextValue: number) => {
            reportEvent(RT_EVENTS.SCORE_TEMPO_SET_CLICK, {
                ...getScoreMetaEvent(score),
                'params.key': ['percentages'],
                'params.str_value': [nextValue.toFixed(1)],
                'params.value': [Math.round(nextValue * 100)],
            })
            actions.setTempo(nextValue)
        },
        [actions, score],
    )

    const onSetTempoValue = useCallback(
        (value: number) => setTempo(toTempoMultiplier(value)),
        [setTempo],
    )
    const resetToDefault = useCallback(() => setTempo(DEFAULT_TEMPO), [setTempo])
    const transformBpmBubbleText = useCallback(
        (value: number) => formatTempoBpm(baseBpm, toTempoMultiplier(value)),
        [baseBpm],
    )

    return (
        <>
            {!standalone && (
                <ListSectionHeader title={translate('native.settings_extasy_screen.tempo_title')} />
            )}
            <View style={styles.sliderWrapper}>
                <Slider
                    value={tempo * 100 - MIN_TEMPO_PERCENT}
                    minimumValue={0}
                    maximumValue={MAX_TEMPO_PERCENT - MIN_TEMPO_PERCENT}
                    minimumValueLabel={formatPercent(MIN_TEMPO_PERCENT)}
                    maximumValueLabel={formatPercent(MAX_TEMPO_PERCENT)}
                    minimumValueCaption={
                        showBpm ? formatTempoBpm(baseBpm, MIN_TEMPO_PERCENT / 100) : undefined
                    }
                    maximumValueCaption={
                        showBpm ? formatTempoBpm(baseBpm, MAX_TEMPO_PERCENT / 100) : undefined
                    }
                    bubble={showBpm ? transformBpmBubbleText : formatTempoPercent}
                    bubbleWidth={showBpm ? 72 : 52}
                    alwaysShowBubble={showBpm}
                    step={1}
                    style={[styles.slider, showBpm && styles.sliderWithBpm]}
                    onSlidingComplete={onSetTempoValue}
                    maximumTrackTintColor={brandColors.colorBackgroundDisabled}
                    minimumTrackTintColor={brandColors.contentPrimary}
                    bubbleBackgroundColor={brandColors.contentPrimary}
                />
            </View>
            {standalone && (
                <MuseButton
                    title={translate('native.settings.score.set_default_tempo')}
                    onPress={resetToDefault}
                    type="secondary"
                    size="large"
                    disabled={tempo === DEFAULT_TEMPO}
                    haptic
                    style={styles.setDefaultButton}
                />
            )}
        </>
    )
})
TempoSection.displayName = 'TempoSection'

const styles = StyleSheet.create({
    sliderWrapper: {
        paddingHorizontal: 20,
    },
    slider: {
        marginVertical: 16,
    },
    sliderWithBpm: {
        marginTop: 40,
    },
    setDefaultButton: {
        alignSelf: 'stretch',
        marginHorizontal: 20,
        marginTop: 2,
    },
})
