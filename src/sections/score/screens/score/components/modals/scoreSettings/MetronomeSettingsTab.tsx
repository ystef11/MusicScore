import { memo, useCallback } from 'react'
import { NativeModules, Platform, StyleSheet, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { useReachability } from 'react-native-watch-connectivity'

import { scoreTestIds } from '@mu/mu-mobile-test-id'
import { sendMessageToWatch } from '@mu-native/apple-watch-module'
import { platform } from '@mu-native/common'
import {
    brandColors,
    BrandSwitcherListCell,
    Divider,
    ListSectionHeader,
    NativeBottomSheet,
    nativeDismissFittedSheet,
    SheetTitle,
    Slider,
    useAppSafeArea,
} from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { marketingStoreChunk, sources } from '@mu-native/marketing'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { getCurrentScoreSettings, scoreThunks } from '@mu-native/score'
import { useActions, useValues } from '@ug/store'

import { getScoreMetaEvent } from '../../../../../../../App/constants/scoreAnalytic'
import { checkPremiumThunk } from '../../../../../../../App/Controllers/ScoreActionsController'
import { MSScoreT } from '../../../../../../../App/Model/MSScore'
import reportEvent from '../../../../../../../App/Utils/Analytics'
import { useCurrentScore } from '../../../hooks/useCurrentScore'

import { TempoSection } from './TempoSection'

const styles = StyleSheet.create({
    sliderWrapper: {
        paddingHorizontal: 20,
    },
    slider: {
        marginVertical: 16,
    },
})

const MetronomeSettingsTab = ({ hideTempo }: { hideTempo?: boolean }) => {
    const inset = useAppSafeArea({ bottom: 32 })
    const score = useCurrentScore()
    const [isPro, settings] = useValues([
        marketingStoreChunk.props.getIsPro,
        getCurrentScoreSettings,
    ])
    const actions = useActions({
        toggleCountdown: scoreThunks.setCountdownEnabled,
        setIsMetronomeEnabled: scoreThunks.setIsMetronomeEnabled,
        setVolume: scoreThunks.setMetronomeVolume,
        setPartialFieldsCustom: marketingStoreChunk.actions.setPartialFieldsCustom,
        checkPremiumThunk,
    })
    const localPlayback = Platform.OS === 'android' && !!NativeModules.WebScoreSource && !score?.isPdf
    const isReachable = useReachability()

    const { isCountdownEnabled, metronomeVolume, isMetronomeEnabled } = settings

    const showMarketingPopup = (
        score: MSScoreT | null,
        featureText = 'marketing_text.metronome',
    ) => {
        nativeDismissFittedSheet('metronomeSheet')
        actions.setPartialFieldsCustom({
            source: sources.metronome,
            featureText,
            inAppForSale: score,
        })

        actions.checkPremiumThunk()
    }

    const transformVolumeBubbleText = useCallback(
        (number: number) => `${Math.round(number * 100)}`,
        [],
    )

    const onSwitchCountdown = useCallback(
        (value: any) => {
            reportEvent(
                value
                    ? RT_EVENTS.SCORE_METRONOME_PRECOUNT_ON_CLICK
                    : RT_EVENTS.SCORE_METRONOME_PRECOUNT_OFF_CLICK,
                getScoreMetaEvent(score),
            )
            if (localPlayback || isPro || score?.isPurchased) {
                actions.toggleCountdown(value)
                reportEvent(RT_EVENTS.MIXER_METRONOM_PRECOUNT_CHANGE, {
                    value: value ? 'on' : 'off',
                })
                reportEvent(
                    value
                        ? RT_EVENTS.SCORE_METRONOME_PRECOUNT_ON
                        : RT_EVENTS.SCORE_METRONOME_PRECOUNT_OFF,
                    getScoreMetaEvent(score),
                )
                return
            }
            actions.toggleCountdown(false)
            showMarketingPopup(score, 'marketing_text.count_off')
        },
        [localPlayback, isPro, score],
    )

    const onSwitchMetronome = useCallback(
        (value: boolean) => {
            reportEvent(RT_EVENTS.SCORE_METRONOME_SWITCH_CLICK, getScoreMetaEvent(score))
            if (localPlayback || isPro || score?.isPurchased) {
                actions.setIsMetronomeEnabled(value)
                if (platform.isIos && isReachable)
                    sendMessageToWatch({ key: 'isMetronomeEnabled', value })
                return
            }
            actions.setIsMetronomeEnabled(false)
            showMarketingPopup(score)
        },
        [localPlayback, isPro, score, isReachable],
    )
    const onSetMetronomeVolume = useCallback(
        (volume: any) => {
            reportEvent(RT_EVENTS.SCORE_METRONOME_SOUND_SET_CLICK, getScoreMetaEvent(score))
            if (localPlayback || isPro || score?.isPurchased) {
                actions.setVolume(volume)
                if (platform.isIos && isReachable) {
                    sendMessageToWatch({
                        key: 'volumeMetronome',
                        value: volume,
                    })
                }
                reportEvent(RT_EVENTS.SCORE_METRONOME_SOUND_SET, getScoreMetaEvent(score))
                return
            }
            actions.setVolume(0)
            showMarketingPopup(score)
        },
        [localPlayback, isPro, score, isReachable],
    )

    return (
        <ScrollView contentContainerStyle={{ paddingBottom: inset.bottom }}>
            <Divider />
            <>
                <BrandSwitcherListCell
                    title={translate('native.score.count_off')}
                    switchValue={isCountdownEnabled}
                    onSwitchChange={onSwitchCountdown}
                    testID={scoreTestIds.scoreMetronomePrecountSwitch}
                />
                <BrandSwitcherListCell
                    title={translate('native.score.enable_metronome')}
                    switchValue={isMetronomeEnabled}
                    onSwitchChange={onSwitchMetronome}
                    testID={scoreTestIds.scoreMetronomeSwitch}
                />
            </>
            <Divider />
            <ListSectionHeader title={translate('native.score.volume_title')} />
            <View style={styles.sliderWrapper}>
                <Slider
                    value={metronomeVolume}
                    minimumValue={0}
                    maximumValue={1}
                    maximumTrackTintColor={brandColors.colorBackgroundDisabled}
                    minimumTrackTintColor={brandColors.contentPrimary}
                    bubbleBackgroundColor={brandColors.contentPrimary}
                    minimumValueLabel="0"
                    maximumValueLabel="100"
                    bubble={transformVolumeBubbleText}
                    style={styles.slider}
                    onSlidingComplete={onSetMetronomeVolume}
                    disabled={!isMetronomeEnabled}
                />
            </View>
            {!hideTempo && <TempoSection />}
        </ScrollView>
    )
}

export const MetronomeSettingsSheet = memo(
    ({
        hideTempo,
        maxWidth,
        centerOnTablet,
    }: {
        hideTempo?: boolean
        maxWidth?: number
        centerOnTablet?: boolean
    }) => {
        return (
            <NativeBottomSheet
                name="metronomeSheet"
                maxWidth={maxWidth}
                centerOnTablet={centerOnTablet}
            >
                <SheetTitle
                    title={translate(
                        hideTempo
                            ? 'native.key_words.metronome'
                            : 'native.settings_extasy_screen.tempo_title',
                    )}
                    titleTestID={scoreTestIds.scoreSheetTitle}
                />
                <MetronomeSettingsTab hideTempo={hideTempo} />
            </NativeBottomSheet>
        )
    },
)
