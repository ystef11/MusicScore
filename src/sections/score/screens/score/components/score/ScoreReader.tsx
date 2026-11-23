import { memo, useState } from 'react'
import {
    NativeModules,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native'

import { scoreTestIds } from '@mu/mu-mobile-test-id'
import {
    AppText,
    Icon,
    type IconSource,
    nativePresentFittedSheet,
    ProgressBar,
    useAppSafeArea,
} from '@mu-native/ds'
import { chevronDown } from '@mu-native/icons/chevronDown'
import { chevronLeft } from '@mu-native/icons/chevronLeft'
import { chevronUp } from '@mu-native/icons/chevronUp'
import { cursor } from '@mu-native/icons/cursor'
import { expand } from '@mu-native/icons/expand'
import { infoCircle } from '@mu-native/icons/infoCircle'
import { loop } from '@mu-native/icons/loop'
import { metronome } from '@mu-native/icons/metronome'
import { mixer } from '@mu-native/icons/mixer'
import { playbackSpeed } from '@mu-native/icons/playbackSpeed'
import { settings } from '@mu-native/icons/settings'
import { sparkles } from '@mu-native/icons/sparkles'
import { star } from '@mu-native/icons/star'
import { transpose } from '@mu-native/icons/transpose'
import { zoomIn } from '@mu-native/icons/zoomIn'
import { getCurrentLocaleCode, localizeNumber, translate } from '@mu-native/locale'
import { Screen, useAppNavigation } from '@mu-native/navigation'
import {
    getCurrentPlaybackPercentPosition,
    getCurrentScoreSettings,
    getCurrentScoreTransposition,
    scoreStoreChunk,
    type TScoreSourceFile,
} from '@mu-native/score'
import { xtz } from '@mu-native/xtz'
import { useActions, useValues } from '@ug/store'

import { isScoreFromCatalog, type MSScoreT } from '../../../../../../App/Model/MSScore'
import { InteractiveScoreContainer } from '../../containers/InteractiveScoreContainer'
import { getCurrentBpm } from '../../helpers/bpmHelpers'
import { useAutoGradeLogic } from '../../hooks/useAutoGradeLogic'
import { PianoKeyboard } from '../piano/PianoKeyboard'
import { useScoreCursor } from '../scoreControl/experiment2/ScoreCursorButton'
import { useScoreLoopButton } from '../scoreControl/experiment2/ScoreLoopButton'
import { ScorePlayButton } from '../scoreControl/experiment2/ScorePlayButton'
import { ScoreRewindButton } from '../scoreControl/experiment2/ScoreRewindButton'
import { ButtonsCarousel } from '../scoreDetails/ButtonsCarousel'
import { ScoreDetailsFavoriteButton } from '../scoreDetails/buttons/ScoreDetailsFavoriteButton'

import ScoreLoadingPlaceholder from './ScoreLoadingPlaceholder'

const ink = '#182C30'
const accent = '#086761'
const panel = '#F1F6F5'
const tile = '#E3EEEB'
const line = '#D3E1DF'

type ButtonProps = {
    icon: IconSource
    label: string
    onPress: () => void
    testID?: string
    enabled?: boolean
    selected?: boolean
}

const Tool = ({ icon, label, onPress, testID, enabled = true, selected }: ButtonProps) => (
    <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: !enabled, selected }}
        disabled={!enabled}
        onPress={onPress}
        testID={testID}
        style={[styles.tool, !enabled && styles.disabled]}
    >
        <View style={[styles.toolTile, selected && styles.selected]}>
            <Icon source={icon} size={20} tint={selected ? '#FFFFFF' : ink} />
        </View>
        <AppText font="f12w500" numberOfLines={1} rawText={label} />
    </TouchableOpacity>
)

const PlaybackProgress = memo(() => {
    const [progress] = useValues([getCurrentPlaybackPercentPosition])
    return (
        <ProgressBar
            progress={progress / 100}
            width={null}
            height={3}
            borderWidth={0}
            borderRadius={0}
            color={accent}
            unfilledColor={line}
            style={styles.progress}
        />
    )
})

const PlaybackControls = memo(({ score, enabled }: { score: MSScoreT; enabled: boolean }) => {
    const [playbackSettings, key] = useValues([
        getCurrentScoreSettings,
        getCurrentScoreTransposition,
    ])
    const { onPress: toggleLoop, isLoopEnabled } = useScoreLoopButton()
    const { onPress: toggleCursor, isCursorVisible } = useScoreCursor()
    const actions = useActions({ setFullscreen: scoreStoreChunk.actions.setIsFullScreen })
    const tempo = playbackSettings.tempo
    const tempoLabel =
        score.bpm && score.bpm > 0
            ? translate('native.score.bpm_value', { bpm: String(getCurrentBpm(score.bpm, tempo)) })
            : translate('native.score.tempo_percent', { percent: String(Math.round(tempo * 100)) })

    return (
        <View style={styles.controls}>
            <View style={styles.transport}>
                <ScorePlayButton
                    isEnabled={enabled}
                    background={accent}
                    size={48}
                    styles={styles.play}
                />
                <ScoreRewindButton isEnabled={enabled} background={tile} tint={ink} />
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tools}
            >
                <Tool
                    icon={playbackSpeed}
                    label={tempoLabel}
                    enabled={enabled}
                    onPress={() => nativePresentFittedSheet('tempoSheet')}
                />
                <Tool
                    icon={loop}
                    label={translate('native.score.chip_loop')}
                    enabled={enabled}
                    selected={isLoopEnabled}
                    onPress={toggleLoop}
                    testID={scoreTestIds.scoreLoop}
                />
                <Tool
                    icon={zoomIn}
                    label={translate('native.score.chip_zoom')}
                    enabled={enabled}
                    onPress={() => nativePresentFittedSheet('zoomSheet')}
                />
                <Tool
                    icon={transpose}
                    label={key || translate('native.score.chip_transpose')}
                    enabled={enabled}
                    onPress={() => nativePresentFittedSheet('transposeSheet')}
                />
                <Tool
                    icon={mixer}
                    label={translate('native.score.chip_mixer')}
                    enabled={enabled}
                    onPress={() => nativePresentFittedSheet('mixerSheet')}
                    testID={scoreTestIds.scoreToolbarMixerButton}
                />
                <Tool
                    icon={metronome}
                    label={translate('native.score.chip_metronome')}
                    enabled={enabled}
                    selected={playbackSettings.isMetronomeEnabled}
                    onPress={() => nativePresentFittedSheet('metronomeSheet')}
                    testID={scoreTestIds.scoreToolbarMetronomeButton}
                />
                <Tool
                    icon={cursor}
                    label={translate('native.score.display_cursor')}
                    enabled={enabled}
                    selected={isCursorVisible}
                    onPress={toggleCursor}
                    testID={scoreTestIds.scoreCursor}
                />
                <Tool
                    icon={expand}
                    label={translate('native.score_onboarding.tap_fullscreen')}
                    enabled={enabled}
                    onPress={() => actions.setFullscreen(true)}
                    testID={scoreTestIds.scoreFullscreen}
                />
            </ScrollView>
        </View>
    )
})

type Props = {
    score: MSScoreT
    source: TScoreSourceFile | null
}

export const ScoreReader = memo(({ score, source }: Props) => {
    const navigation = useAppNavigation()
    const { onNavigateAutoGradeScreen } = useAutoGradeLogic()
    const insets = useAppSafeArea({ bottom: 8 })
    const { width, height } = useWindowDimensions()
    const [isLoaded, isPlaying, isKeyboardVisible, isFullscreen] = useValues([
        scoreStoreChunk.props.getIsSuccessLoading,
        scoreStoreChunk.props.getIsPlaying,
        scoreStoreChunk.props.getIsKeyboardVisible,
        scoreStoreChunk.props.getIsFullScreen,
    ])
    const actions = useActions({ setFullscreen: scoreStoreChunk.actions.setIsFullScreen })
    const [expanded, setExpanded] = useState(true)
    const [noteHintsEnabled, setNoteHintsEnabled] = useState(false)
    const isCatalog = isScoreFromCatalog(score)
    const showDetails = !isPlaying && width <= height
    const hasSummary = isCatalog && showDetails
    const hasActions = showDetails && (expanded || !isCatalog)
    const byline = [...new Set([score.artistName, score.authorName].filter(Boolean))].join(' · ')
    const scoreInfoLabel = translate('native.score.about_this_score')
    const noteHintsLabel = getCurrentLocaleCode() === 'ru' ? 'Названия нот' : 'Note names'
    const canShowNoteHints = isLoaded && source?.type === 'interactive'
    const hasLocalPractice = !!NativeModules.WebScoreSource?.startPracticeMicrophone
    const canStartPractice = isLoaded && source?.type === 'interactive' && !!source.uri

    return (
        <View
            style={[
                styles.root,
                {
                    paddingLeft: insets.left,
                    paddingRight: insets.right,
                    paddingTop: insets.top,
                    paddingBottom: insets.bottom,
                },
            ]}
        >
            {!isFullscreen && (
                <View style={styles.header}>
                    <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel={translate('native.actions.back')}
                        testID={scoreTestIds.scoreBack}
                        style={styles.headerButton}
                        onPress={() => {
                            xtz.stop()
                            navigation.goBack()
                        }}
                    >
                        <Icon source={chevronLeft} size={22} tint={ink} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel={`${score.title}. ${scoreInfoLabel}`}
                        style={styles.heading}
                        onPress={() => navigation.push(Screen.ScoreDetailsInformationScreen)}
                    >
                        <AppText
                            font="f17w600"
                            numberOfLines={1}
                            rawText={score.title}
                            testID={scoreTestIds.scoreDetailsTitle}
                        />
                        {!!byline && (
                            <AppText
                                font="f13w500"
                                numberOfLines={1}
                                rawText={byline}
                                brandColor="contentSecondary"
                            />
                        )}
                    </TouchableOpacity>
                    {isCatalog && (
                        <ScoreDetailsFavoriteButton
                            key={score.id}
                            score={score}
                            isNew
                            transparent
                        />
                    )}
                    <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel={noteHintsLabel}
                        accessibilityState={{ disabled: !canShowNoteHints, selected: noteHintsEnabled }}
                        disabled={!canShowNoteHints}
                        style={[
                            styles.headerButton,
                            noteHintsEnabled && styles.activeHeaderButton,
                            !canShowNoteHints && styles.disabled,
                        ]}
                        onPress={() => setNoteHintsEnabled((enabled) => !enabled)}
                        testID="score-reader-note-hints"
                    >
                        <Icon source={infoCircle} size={22} tint={noteHintsEnabled ? accent : ink} />
                    </TouchableOpacity>
                    {hasLocalPractice && (
                        <TouchableOpacity
                            accessibilityRole="button"
                            accessibilityLabel={translate('native.score.settings.practice_mode')}
                            accessibilityState={{ disabled: !canStartPractice }}
                            disabled={!canStartPractice}
                            onPress={onNavigateAutoGradeScreen}
                            style={[styles.headerButton, !canStartPractice && styles.disabled]}
                            testID="score-reader-practice"
                        >
                            <Icon source={sparkles} size={22} tint={accent} />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel={translate('native.key_words.settings')}
                        testID={scoreTestIds.scoreSettingsButton}
                        style={styles.headerButton}
                        onPress={() => nativePresentFittedSheet('scoreSettingsSheet')}
                    >
                        <Icon source={settings} size={22} tint={ink} />
                    </TouchableOpacity>
                </View>
            )}
            <View style={styles.sheet}>
                {source?.type === 'interactive' && (
                    <InteractiveScoreContainer
                        source={source}
                        noteHintsEnabled={noteHintsEnabled}
                        onScoreTap={() => {
                            if (isFullscreen) actions.setFullscreen(false)
                        }}
                    />
                )}
                <ScoreLoadingPlaceholder isLoading={!isLoaded} />
            </View>
            {!isFullscreen && (
                <>
                    {isKeyboardVisible && <PianoKeyboard place="sheet" />}
                    <View style={styles.panel}>
                        {hasSummary && (
                            <View style={styles.summary}>
                                {!!score.rating && (
                                    <View style={styles.rating}>
                                        <Icon source={star} size={15} tint={accent} />
                                        <AppText
                                            font="f13w500"
                                            rawText={
                                                score.ratingCount
                                                    ? `${localizeNumber(
                                                          score.rating,
                                                      )} (${localizeNumber(score.ratingCount)})`
                                                    : localizeNumber(score.rating)
                                            }
                                        />
                                    </View>
                                )}
                                <TouchableOpacity
                                    accessibilityRole="button"
                                    style={styles.comments}
                                    testID={scoreTestIds.scoreDetailsCommentsSection}
                                    onPress={() =>
                                        navigation.navigate(Screen.comments, {
                                            scoreTitle: score.title,
                                            scoreId: score.id,
                                        })
                                    }
                                >
                                    <AppText
                                        font="f13w500"
                                        numberOfLines={1}
                                        rawText={translate('native.score.comments_count', {
                                            count: score.commentsCount || 0,
                                        })}
                                    />
                                </TouchableOpacity>
                                {!!score.hits && (
                                    <AppText
                                        font="f13w500"
                                        numberOfLines={1}
                                        rawText={translate(
                                            'native.score_details_sheet.views_number',
                                            {
                                                number: localizeNumber(score.hits, {
                                                    notation: 'compact',
                                                }),
                                            },
                                        )}
                                    />
                                )}
                                <TouchableOpacity
                                    accessibilityRole="button"
                                    accessibilityLabel={scoreInfoLabel}
                                    accessibilityState={{ expanded }}
                                    style={styles.headerButton}
                                    onPress={() => setExpanded((previous) => !previous)}
                                >
                                    <Icon
                                        source={expanded ? chevronDown : chevronUp}
                                        size={19}
                                        tint={ink}
                                    />
                                </TouchableOpacity>
                            </View>
                        )}
                        {hasActions && (
                            <View style={styles.actions}>
                                <ButtonsCarousel score={score} />
                            </View>
                        )}
                        <PlaybackProgress />
                        <PlaybackControls score={score} enabled={isLoaded} />
                    </View>
                </>
            )}
        </View>
    )
})

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#FFFFFF' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        minHeight: 58,
        paddingHorizontal: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: line,
    },
    heading: { flex: 1, gap: 2, marginHorizontal: 6, minHeight: 44, justifyContent: 'center' },
    headerButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
    activeHeaderButton: { backgroundColor: tile, borderRadius: 10 },
    sheet: { flex: 1 },
    panel: { backgroundColor: panel },
    summary: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12 },
    rating: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    comments: { flex: 1, minHeight: 44, justifyContent: 'center' },
    actions: { paddingBottom: 12 },
    progress: { width: '100%' },
    controls: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5 },
    transport: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        borderRightWidth: StyleSheet.hairlineWidth,
        borderRightColor: line,
    },
    play: { marginHorizontal: 0, borderRadius: 14 },
    tools: { alignItems: 'flex-start', gap: 4, paddingHorizontal: 6 },
    tool: { alignItems: 'center', width: 64, gap: 3 },
    toolTile: {
        width: 44,
        height: 44,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: tile,
    },
    selected: { backgroundColor: accent },
    disabled: { opacity: 0.45 },
})
