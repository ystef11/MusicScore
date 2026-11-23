import type { AnnotationPage } from 'react-native-pdf-light'

import { createExtendedStoreChunk } from '@ug/store'
import { createSelector } from 'reselect'

import { MSScoreT } from '../../../App/Model/MSScore'
import { DefaultNoteSize } from '../constants/noteSize'
import { playback } from '../constants/playback'
import { transpositionHelpers } from '../helpers/transposition.ts'
import {
    PedalSettings,
    TPersistentScoreSettings,
    TPlaybackStatus,
    TScoreMetaState,
    TScoreState,
} from '../types/scoreTypes'

const defaultScoreSettings: TPersistentScoreSettings = {
    addedAt: Date.now(),
    tempo: 1,
    transposeDiff: 0,
    isCountdownEnabled: false,
    metronomeVolume: 0.5,
    isMetronomeEnabled: false,
    visiblePartIds: [],
    playablePartIds: [],
    partVolumeMap: {},
}

const scoreMetaDefaultState: TScoreMetaState = {
    originalTranspose: '',
    commentsCount: 0,
    noteSizeState: { min: 0.5, max: 30 },
    totalPages: 0,
    parts: [],
}

const getCurrentScoreMetaInternal = (state: TScoreState) => {
    const score = state.currentScore

    if (!score) return null

    return state.scoreMetaMap[score.id] || null
}

const getCurrentScoreSettingsInternal = (state: TScoreState) => {
    const score = state.currentScore

    if (!score) return null

    return state.scoreSettingsMap[score.id] || null
}

const setCurrentScoreMetaFields = (data: Partial<TScoreMetaState>, state: TScoreState) => {
    const score = state.currentScore
    const meta = getCurrentScoreMetaInternal(state)
    if (!meta || !score) return state

    return {
        scoreMetaMap: {
            ...state.scoreMetaMap,
            [score.id]: {
                ...meta,
                ...data,
            },
        },
    }
}

const setCurrentScoreSettings = (
    settings: Partial<TPersistentScoreSettings>,
    state: TScoreState,
) => {
    const score = state.currentScore
    if (!score) return state

    return {
        scoreSettingsMap: {
            ...state.scoreSettingsMap,
            [score.id]: {
                ...(state.scoreSettingsMap[score.id] ?? defaultScoreSettings),
                ...settings,
            },
        },
    }
}

export const scoreStoreChunk = createExtendedStoreChunk<TScoreState>({
    treeKey: 'modules',
    storeKey: 'score',
})({
    persist: [
        'isAutoScrollModalShown',
        'openScoreCount',
        'storeVersion',
        'pedalSettings',
        'onboarded',
        'practiceModeTooltipShown',
        'firstSessionOnboardingStep',
        'scoreSettingsMap',
        'isKeyboardVisible',
        'pageLayoutType',
        'currentNoteSize',
        'hasProcessedFreeAutoscrollExp',
        'hasAppliedProVerticalDefault',
        'hasInitializedAndroidReaderLayout',
    ],
    initialState: {
        pageLayoutType: 'horizontal',
        playback: playback.empty,
        playbackPosition: {},
        isLoopEnabled: false,
        isFullScreen: false,
        totalPages: 0,
        currentPage: 0,
        isKeyboardVisible: false,
        isCursorVisible: true,
        currentScore: null,
        scoreUri: null,
        isPlaying: false,
        isSuccessLoading: false,
        playbackStatus: TPlaybackStatus.STATE_EMPTY,
        isAutoScrollModalShown: false,
        isAutoScrollOfferVisible: false,
        openScoreCount: 0,
        openScorePerSessionCount: 0,
        scoreMetaMap: {},
        pedalSettings: {
            [PedalSettings.playPause]: null,
            [PedalSettings.prevPage]: null,
            [PedalSettings.nextPage]: null,
            [PedalSettings.autoScroll]: null,
        },
        storeVersion: 0,
        onboarded: true,
        visibleOnboardingStep: 0,
        checkingPDFExportRestriction: false,
        settingsSheetIndex: 0,
        practiceModeTooltipShown: true,
        firstSessionOnboardingStep: null,
        showStoragePermissionModal: false,
        scoreSettingsMap: {},
        currentNoteSize: DefaultNoteSize,
        isOpenBuyScoreModal: false,
        isOpenScorePremiumModal: false,
        isOpenScoreFeatureModal: false,
        hasProcessedFreeAutoscrollExp: false,
        hasAppliedProVerticalDefault: false,
        hasInitializedAndroidReaderLayout: false,
        pianoKeyboardHeight: 0,
        firstSessionSpotlight: null,
        isFirstSessionPlaybackLocked: false,
        isFirstSessionSaveHintShown: false,
        firstSessionLikeRect: null,
        pdfAnnotations: null,
        arePdfAnnotationsReady: false,
        pendingPdfExport: null,
    },
    actions: {
        initializeAndroidReaderLayout: (_: void, state: TScoreState) => {
            if (state.hasInitializedAndroidReaderLayout) return state
            return {
                pageLayoutType: 'horizontal' as const,
                hasInitializedAndroidReaderLayout: true,
            }
        },
        reset: () => ({
            isSuccessLoading: false,
            currentScore: null,
            isPlaying: false,
            playbackStatus: TPlaybackStatus.STATE_EMPTY,
            isFullScreen: false,
            isLoopEnabled: false,
            pdfAnnotations: null,
            arePdfAnnotationsReady: false,
        }),
        setCurrentScore: (score: MSScoreT, state) => {
            const { scoreSettingsMap } = state
            const entries = Object.entries(scoreSettingsMap)
            const isDifferentScore = state.currentScore?.id !== score.id
            const annotationReset = isDifferentScore
                ? { pdfAnnotations: null, arePdfAnnotationsReady: false }
                : {}

            if (!(score.id in scoreSettingsMap) && entries.length === 25) {
                // Don't allow the map to grow to more than 25 entries
                const trimmed = entries.sort((a, b) => a[1].addedAt - b[1].addedAt).slice(1)
                const map = trimmed.reduce<TScoreState['scoreSettingsMap']>((acc, curr) => {
                    return {
                        ...acc,
                        [curr[0]]: curr[1],
                    }
                }, {})
                map[score.id] = {
                    ...defaultScoreSettings,
                    addedAt: Date.now(),
                }
                return {
                    ...annotationReset,
                    currentScore: score,
                    scoreSettingsMap: map,
                }
            }

            return {
                ...annotationReset,
                currentScore: score,
                scoreSettingsMap: {
                    ...state.scoreSettingsMap,
                    [score.id]: {
                        ...(state.scoreSettingsMap[score.id] ?? defaultScoreSettings),
                        addedAt: Date.now(),
                    },
                },
            }
        },
        updateCurrentScoreAfterBuy: (_, state: TScoreState) => ({
            currentScore: state.currentScore ? { ...state.currentScore, isPurchased: true } : null,
        }),
        resetPedalSettingsCustom: () => ({
            pedalSettings: {
                [PedalSettings.playPause]: null,
                [PedalSettings.prevPage]: null,
                [PedalSettings.nextPage]: null,
                [PedalSettings.autoScroll]: null,
            },
        }),
        setPedalSettingsCustom: (
            { activeKey, activeCode }: { activeKey: string; activeCode: string },
            state,
        ) => {
            const keyForNullifyValue = Object.entries(state.pedalSettings).find(
                ([_, value]) => value === activeCode,
            )

            return {
                pedalSettings: {
                    ...state.pedalSettings,
                    [activeKey]: activeCode,
                    ...(keyForNullifyValue?.[0] ? { [keyForNullifyValue?.[0]]: null } : {}),
                },
            }
        },
        setPlaybackPosition: (
            { scoreId, playbackPosition }: { scoreId: number; playbackPosition: number },
            state,
        ) => {
            return {
                playbackPosition: { ...state.playbackPosition, [scoreId]: playbackPosition },
            }
        },
        resetPlaybackStatus: () => ({ playbackStatus: TPlaybackStatus.STATE_EMPTY }),
        loadMeta: (
            { scoreId, meta }: { scoreId: number; meta: Partial<TScoreMetaState> },
            state,
        ) => {
            const settings = state.scoreSettingsMap[scoreId]
            const partIds = meta.parts?.map(part => part.id) || []
            const volumeMap = (meta.parts ?? [])?.reduce<Record<number, number>>((acc, curr) => {
                return { ...acc, [curr.id]: curr.volume }
            }, {})
            return {
                scoreMetaMap: {
                    ...state.scoreMetaMap,
                    [scoreId]: {
                        ...scoreMetaDefaultState,
                        ...meta,
                        noteSizeState: {
                            min: meta.noteSizeState?.min || scoreMetaDefaultState.noteSizeState.min,
                            max: meta.noteSizeState?.max || scoreMetaDefaultState.noteSizeState.max,
                        },
                    },
                },
                isLoopEnabled: false,
                ...setCurrentScoreSettings(
                    {
                        visiblePartIds: settings?.visiblePartIds.length
                            ? settings.visiblePartIds
                            : partIds,
                        partVolumeMap: {
                            ...volumeMap,
                            ...(settings?.partVolumeMap ?? {}),
                        },
                    },
                    state,
                ),
            }
        },
        setCurrentTempo: (tempo: number, state: TScoreState) => {
            return setCurrentScoreSettings({ tempo }, state)
        },
        setTranspose: ({ transposeDiff }: { transposeDiff: number }, state) => {
            return setCurrentScoreSettings({ transposeDiff }, state)
        },
        setIsCountdownEnabled: (isCountdownEnabled: boolean, state: TScoreState) => {
            return setCurrentScoreSettings({ isCountdownEnabled }, state)
        },
        setCommentsCount: (commentsCount: number, state: TScoreState) => {
            return setCurrentScoreMetaFields({ commentsCount }, state)
        },
        incrementCurrentCommentsCount: (_, state: TScoreState) => {
            const meta = getCurrentScoreMetaInternal(state)

            if (!meta) return state

            return setCurrentScoreMetaFields({ commentsCount: meta.commentsCount + 1 }, state)
        },
        decrementCurrentCommentsCount: (_, state: TScoreState) => {
            const meta = getCurrentScoreMetaInternal(state)

            if (!meta || meta.commentsCount === 0) return state

            return setCurrentScoreMetaFields({ commentsCount: meta.commentsCount - 1 }, state)
        },
        setMetronomeVolume: (metronomeVolume: number, state: TScoreState) => {
            return setCurrentScoreSettings({ metronomeVolume }, state)
        },
        setIsMetronomeEnabled: (isMetronomeEnabled: boolean, state: TScoreState) => {
            return setCurrentScoreSettings({ isMetronomeEnabled }, state)
        },
        setPartVolume: (
            { partId, volume }: { partId: number; volume: number },
            state: TScoreState,
        ) => {
            const meta = getCurrentScoreMetaInternal(state)
            const settings = getCurrentScoreSettingsInternal(state)

            if (!meta || !settings) return state

            const existingPart = meta.parts.find(part => part.id === partId)

            if (!existingPart) return state

            return setCurrentScoreSettings(
                {
                    partVolumeMap: {
                        ...settings.partVolumeMap,
                        [partId]: volume,
                    },
                },
                state,
            )
        },
        setVisibleParts: (visiblePartIds: number[], state) => {
            return setCurrentScoreSettings({ visiblePartIds }, state)
        },
        setPlayableParts: (playablePartIds: number[], state) => {
            return setCurrentScoreSettings({ playablePartIds }, state)
        },
        incrementOpenScoreCount: (_: void, state: TScoreState) => {
            return {
                openScoreCount: state.openScoreCount + 1,
                openScorePerSessionCount: state.openScorePerSessionCount + 1,
            }
        },
        toggleLoop: (_: void, state: TScoreState) => {
            return { isLoopEnabled: !state.isLoopEnabled }
        },
        toggleFullscreen: (_: void, state: TScoreState) => {
            return { isFullScreen: !state.isFullScreen }
        },
        setPdfAnnotations: (pdfAnnotations: AnnotationPage[] | null) => ({ pdfAnnotations }),
        setArePdfAnnotationsReady: (arePdfAnnotationsReady: boolean) => ({ arePdfAnnotationsReady }),
        toggleFavorite: (isFavorite: boolean, state: TScoreState) => {
            if (!state.currentScore) return state

            return {
                currentScore: {
                    ...state.currentScore,
                    isFavorite,
                    isDownloadable: state.currentScore?.isDownloadable ?? false,
                    isPdf: state.currentScore?.isPdf ?? false,
                },
            }
        },
    },
})

export const getPlaybackPosition = (scoreId: number | null | undefined) =>
    createSelector(
        scoreStoreChunk.props.getPlaybackPosition,
        (_: TScoreState) => scoreId,
        (positions, scoreId) => (scoreId ? positions[scoreId] || 0 : 0),
    )

export const getCurrentScoreMeta = createSelector(
    scoreStoreChunk.props.getCurrentScore,
    scoreStoreChunk.props.getScoreMetaMap,
    (score, metaMap) => {
        if (!score) return null
        return metaMap[score.id]
    },
)
export const getCurrentScoreSettings = createSelector(
    scoreStoreChunk.props.getCurrentScore,
    scoreStoreChunk.props.getScoreSettingsMap,
    (score, settingsMap) => {
        if (!score) return defaultScoreSettings
        return settingsMap[score.id]
    },
)
export const getCurrentScoreMetaOrDefault = createSelector(
    getCurrentScoreMeta,
    meta => meta || scoreMetaDefaultState,
)
export const getCurrentScoreParts = createSelector(getCurrentScoreMeta, meta => meta?.parts || [])
export const getCurrentNoteSizeState = createSelector(
    getCurrentScoreMetaOrDefault,
    meta => meta.noteSizeState,
)
export const getCurrentPlaybackPercentPosition = createSelector(
    scoreStoreChunk.props.getCurrentScore,
    scoreStoreChunk.props.getPlaybackPosition,
    (score, positions) => {
        if (score && Object.hasOwn(positions, score.id) && score.duration) {
            const items = score.duration.split(':')
            const seconds = +items[0] * 60 + +items[1]
            const percent = (positions[score.id] / seconds) * 100
            return isNaN(percent) ? 0 : percent
        }
        return 0
    },
)
export const getCurrentScoreTransposition = createSelector(
    getCurrentScoreMetaOrDefault,
    getCurrentScoreSettings,
    (meta, settings) => {
        return transpositionHelpers.readTransposition(
            meta.originalTranspose,
            settings.transposeDiff,
        )
    },
)
