import { translate } from '@mu-native/locale'
import { DefaultNoteSize, TPlaybackStatus } from '@mu-native/score'
import { TMeta } from '@mu-native/xtz'
import { createExtendedStoreChunk } from '@ug/store'
import { createSelector } from 'reselect'

import { AutogradeState, type TAutogradeScreenState } from '../types/autogradeScreenAppTypes.ts'

const initialState: TAutogradeScreenState = {
    score: null,
    isLoaded: false,
    activePart: 0,
    state: AutogradeState.Initial,
    isPlaying: false,
    playbackStatus: TPlaybackStatus.STATE_STOPPED,
    recordPath: null,
    results: null,
    playbackPosition: 0,
    duration: 0,
    playbackSpeed: 1,
    isRangeSelectionEnabled: false,
    selectedRange: undefined,
    calibrationStatus: 'initial',
    calibrationResult: null,
    noteSizeState: {
        min: 5,
        max: 30,
    },
    currentNoteSize: DefaultNoteSize,
    parts: [],
    detailedResults: null,
    gracefullyClosingScreen: false,
    isFullscreen: false,
    isOrientationLocked: false,
}

const autogradeScreenStoreChunk = createExtendedStoreChunk<TAutogradeScreenState>({
    treeKey: 'screens',
    storeKey: 'autograde',
})({
    initialState,
    persist: ['calibrationStatus', 'calibrationResult'],
    actions: {
        reset: (_, state) => {
            return {
                ...initialState,
                calibrationStatus: state.calibrationStatus,
                calibrationResult: state.calibrationResult,
            }
        },
        loadMeta: (meta: TMeta) => {
            return {
                isLoaded: true,
                duration: meta.duration,
                noteSizeState: {
                    min: meta.minNoteSize || 0.5,
                    max: meta.maxNoteSize || 30,
                },
                parts: meta.parts ?? [],
            }
        },
        resetBeforeRecording: () => {
            return {
                detailedResults: null,
                recordPath: null,
                results: null,
            }
        },
        toggleFullscreen: (_: undefined, state) => {
            return {
                isFullscreen: !state.isFullscreen,
            }
        },
    },
})

export const getParts = createSelector(autogradeScreenStoreChunk.props.getParts, parts =>
    (parts ?? []).map((part, index) => ({
        ...part,
        partName:
            part.partName || translate('native.score.part_number', { number: String(index + 1) }),
    })),
)

export const getActivePart = createSelector(
    autogradeScreenStoreChunk.props.getActivePart,
    getParts,
    (partIndex, parts) => parts[partIndex] ?? null,
)

export default autogradeScreenStoreChunk
