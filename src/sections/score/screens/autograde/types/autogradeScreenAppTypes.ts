import { TNoteSizeState, TPlaybackStatus } from '@mu-native/score'
import { TMeta } from '@mu-native/xtz'

import { MSScoreT } from '../../../../../App/Model/MSScore.ts'

export const enum AutogradeState {
    Initial,
    Preparing,
    Recording,
    Reviewing,
}

export type AutogradeResults = {
    accuracy: number
    rhythm: number
}

type AutogradeMistakeName =
    | 'NOTE_MISSED'
    | 'REST_MISSED'
    | 'PITCH_WRONG'
    | 'ONSET_EARLY'
    | 'ONSET_LATE'
    | 'OFFSET_EARLY'
    | 'OFFSET_LATE'

export type AutogradeDetailedResults = {
    duration: number
    mistakes: AutogradeMistakeName[]
    start: number
}[]

export type TSelectedRange = {
    startIndex: number
    endIndex: number
    startSec: number
    endSec: number
}

export type TAutogradeScreenState = {
    score: MSScoreT | null
    isLoaded: boolean
    activePart: number
    state: AutogradeState
    isPlaying: boolean
    playbackStatus: TPlaybackStatus
    recordPath: string | null
    results: AutogradeResults | null
    playbackPosition: number
    duration: number
    playbackSpeed: number
    isRangeSelectionEnabled: boolean
    selectedRange: TSelectedRange | undefined
    calibrationStatus: 'initial' | 'calibrating' | 'completed'
    calibrationResult: number | null
    noteSizeState: TNoteSizeState
    currentNoteSize: number
    parts: TMeta['parts']
    detailedResults: AutogradeDetailedResults | null
    gracefullyClosingScreen: boolean
    isFullscreen: boolean
    isOrientationLocked: boolean
}
