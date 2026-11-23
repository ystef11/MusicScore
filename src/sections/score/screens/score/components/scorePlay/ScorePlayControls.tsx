import { memo, useCallback, useRef, useState } from 'react'
import { StyleSheet, View, type ViewInstance } from 'react-native'

import { scoreTestIds } from '@mu/mu-mobile-test-id'
import { useAppleWatchScorePlayLogic } from '@mu-native/apple-watch-module'
import { platform } from '@mu-native/common'
import {
    AppText,
    brandColors,
    CommonTouchable,
    Icon,
    IconSource,
    layout,
    MuseButton,
    nativePresentFittedSheet,
    Popover,
    PopoverPlacement,
    useAppSafeArea,
} from '@mu-native/ds'
import { detail } from '@mu-native/icons/detail'
import { metronome } from '@mu-native/icons/metronome'
import { pause } from '@mu-native/icons/pause'
import { pianoTool } from '@mu-native/icons/pianoTool'
import { play } from '@mu-native/icons/play'
import { playbackSpeed } from '@mu-native/icons/playbackSpeed'
import { transpose } from '@mu-native/icons/transpose'
import { translate } from '@mu-native/locale'
import { marketingStoreChunk, sources } from '@mu-native/marketing'
import { useRoute } from '@mu-native/navigation'
import { getCurrentScoreSettings, scoreStoreChunk, scoreThunks } from '@mu-native/score'
import { useActions, useValues } from '@ug/store'

import { checkPremiumThunk } from '../../../../../../App/Controllers/ScoreActionsController'
import { getCurrentBpm } from '../../helpers/bpmHelpers'
import { useOnPressPlayHandler } from '../../hooks/useOnPressPlayHandler'
import { ScoreControlButton } from '../scoreControl/experiment2/ScoreControlButton'
import { ScoreLoopButton } from '../scoreControl/experiment2/ScoreLoopButton'
import { ScoreRewindButton } from '../scoreControl/experiment2/ScoreRewindButton'

const BG = brandColors.actionSecondaryDefault
const ICON = brandColors.exceptionInverseLight
// Active toggle buttons get a border in this color (keeping the black icon).
const ACTIVE_BORDER = brandColors.exceptionInverseLight
// Hide the popover's default pointer triangle.
const ARROW_NONE = { width: 0, height: 0 }

type MenuRowProps = {
    icon: IconSource
    label: string
    onPress: () => void
}

const MenuRow = ({ icon, label, onPress }: MenuRowProps) => (
    <CommonTouchable style={styles.menuRow} onPress={onPress}>
        <Icon source={icon} size={24} tint={ICON} />
        <AppText font="f15w400" rawText={label} />
    </CommonTouchable>
)

/**
 * Bottom control bar of the new Score Play View, composed from the reused UI-kit
 * control buttons. Left: transport (rewind while playing, play/pause, loop).
 * Right: tools — in landscape Transpose/Tempo show labels; in portrait they
 * become icons and Tempo + Keyboard collapse into the "•••" overflow menu.
 */
export const ScorePlayControls = memo(() => {
    const [isPlaying, isKeyboardVisible, settings, isScoreLoaded, score, pageLayoutType, isPro] =
        useValues([
            scoreStoreChunk.props.getIsPlaying,
            scoreStoreChunk.props.getIsKeyboardVisible,
            getCurrentScoreSettings,
            scoreStoreChunk.props.getIsSuccessLoading,
            scoreStoreChunk.props.getCurrentScore,
            scoreStoreChunk.props.getPageLayoutType,
            marketingStoreChunk.props.getIsPro,
        ])
    const route = useRoute<any>()
    // Orientation on the play screen is driven by the DISPLAY MODE, not by window
    // size: useInitScore locks the screen to landscape for vertical / single-line
    // and to portrait for "Portrait View" (horizontal). Reading window size here
    // was unreliable because useWindowDimensions doesn't update while the
    // orientation is locked, leaving the controls in a stale layout. Tablets keep
    // the full (landscape) layout regardless.
    const isLandscape = platform.isTablet || pageLayoutType !== 'horizontal'
    const insets = useAppSafeArea({ bottom: 8 })
    const actions = useActions({
        setIsKeyboardVisible: scoreThunks.setIsKeyboardVisible,
        setMarketingFields: marketingStoreChunk.actions.setPartialFieldsCustom,
        checkPremiumThunk,
    })

    const onPressPlay = useOnPressPlayHandler()
    useAppleWatchScorePlayLogic({ isPlaying, onPress: onPressPlay })

    const menuRef = useRef<ViewInstance>(null)
    const [menuVisible, setMenuVisible] = useState(false)
    const closeMenu = useCallback(() => setMenuVisible(false), [])
    const openMenu = useCallback(() => setMenuVisible(true), [])

    const onKeyboard = useCallback(() => {
        // Keyboard is a Pro feature — mirror the score-settings switch and show
        // the paywall for non-Pro users who haven't purchased the score.
        if (!isPro && !score?.isPurchased) {
            actions.setMarketingFields({
                source: sources.keyboard,
                featureText: 'marketing_text.keyboard',
                inAppForSale: score,
            })
            actions.checkPremiumThunk()
            return
        }
        actions.setIsKeyboardVisible(!isKeyboardVisible)
    }, [actions, isKeyboardVisible, isPro, score])
    const onTempo = useCallback(() => nativePresentFittedSheet('tempoSheet'), [])
    const onMetronome = useCallback(() => nativePresentFittedSheet('metronomeSheet'), [])
    const onTranspose = useCallback(() => nativePresentFittedSheet('transposeSheet'), [])
    const onMenuTempo = useCallback(() => {
        closeMenu()
        onTempo()
    }, [closeMenu, onTempo])
    const onMenuKeyboard = useCallback(() => {
        closeMenu()
        onKeyboard()
    }, [closeMenu, onKeyboard])

    const tempo = settings?.tempo ?? 1
    // The store's currentScore briefly lacks `bpm` while the play screen reloads
    // it (route param carries no bpm either), which flashed "100%" before the
    // BPM appeared. Keep the first non-zero bpm sticky so it never falls back to
    // the percentage once known.
    const rawBpm = route.params?.score?.bpm ?? score?.bpm ?? 0
    const baseBpmRef = useRef(0)
    if (rawBpm > 0) baseBpmRef.current = rawBpm
    const baseBpm = baseBpmRef.current

    // Show real BPM when the backend provides `bpm`; otherwise fall back to the
    // percentage of the original tempo. While the score is still loading and no
    // bpm is known yet, hide the control rather than flashing "100%".
    const showTempo = baseBpm > 0 || isScoreLoaded
    const tempoLabel =
        baseBpm > 0
            ? translate('native.score.bpm_value', { bpm: String(getCurrentBpm(baseBpm, tempo)) })
            : translate('native.score.tempo_percent', { percent: String(Math.round(tempo * 100)) })

    return (
        <View
            style={[
                styles.container,
                { paddingBottom: insets.bottom },
                isLandscape && styles.landscapePadding,
            ]}
        >
            <View style={styles.group}>
                {isPlaying && (
                    <ScoreRewindButton isEnabled={isScoreLoaded} background={BG} tint={ICON} />
                )}
                <ScoreControlButton
                    testID={scoreTestIds.scorePlay}
                    icon={isPlaying ? pause : play}
                    onPress={onPressPlay}
                    isEnabled={isScoreLoaded}
                    background={BG}
                    tint={ICON}
                />
                <ScoreLoopButton
                    isEnabled={isScoreLoaded}
                    background={BG}
                    tint={ICON}
                    selectedBorderColor={ACTIVE_BORDER}
                />
            </View>

            <View style={styles.group}>
                {isLandscape ? (
                    <MuseButton
                        type="secondary"
                        size="large"
                        title={translate('native.score.chip_transpose')}
                        startIcon={transpose}
                        onPress={onTranspose}
                    />
                ) : (
                    <ScoreControlButton
                        icon={transpose}
                        onPress={onTranspose}
                        isEnabled
                        background={BG}
                        tint={ICON}
                    />
                )}

                {isLandscape && showTempo && (
                    <MuseButton
                        type="secondary"
                        size="large"
                        title={tempoLabel}
                        onPress={onTempo}
                    />
                )}

                <ScoreControlButton
                    icon={metronome}
                    onPress={onMetronome}
                    isEnabled
                    selected={settings?.isMetronomeEnabled}
                    background={BG}
                    tint={ICON}
                    selectedBorderColor={ACTIVE_BORDER}
                />

                {isLandscape ? (
                    <ScoreControlButton
                        icon={pianoTool}
                        onPress={onKeyboard}
                        isEnabled
                        selected={isKeyboardVisible}
                        background={BG}
                        tint={ICON}
                        selectedBorderColor={ACTIVE_BORDER}
                    />
                ) : (
                    <View ref={menuRef} collapsable={false}>
                        <ScoreControlButton
                            icon={detail}
                            onPress={openMenu}
                            isEnabled
                            background={BG}
                            tint={ICON}
                        />
                    </View>
                )}
            </View>

            <Popover
                isVisible={menuVisible}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                from={menuRef as any}
                onRequestClose={closeMenu}
                placement={PopoverPlacement.TOP}
                arrowSize={ARROW_NONE}
            >
                <View style={styles.menu}>
                    <MenuRow
                        icon={playbackSpeed}
                        label={translate('native.settings_extasy_screen.tempo_title')}
                        onPress={onMenuTempo}
                    />
                    <MenuRow
                        icon={pianoTool}
                        label={translate('native.score.display_keyboard')}
                        onPress={onMenuKeyboard}
                    />
                </View>
            </Popover>
        </View>
    )
})
ScorePlayControls.displayName = 'ScorePlayControls'

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: layout.baseMarginFromEdges,
        paddingTop: 8,
        columnGap: 8,
    },
    // Edge-to-edge with an inset in landscape (see ScorePlayScreen).
    landscapePadding: {
        paddingHorizontal: 40,
    },
    group: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 8,
    },
    menu: {
        paddingVertical: 4,
    },
    menuRow: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
})
