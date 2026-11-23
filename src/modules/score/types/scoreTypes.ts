import type { AnnotationPage } from 'react-native-pdf-light'

import type { MSScoreT } from '../../../App/Model/MSScore'

export const enum TPlaybackStatus {
    STATE_PLAYING = 0,
    STATE_PAUSED = 1,
    STATE_STOPPED = 2,
    STATE_EMPTY = 3,
}

export const enum TFitMode {
    FIT_SCREEN = 0,
    ORIGINAL = 1,
}

export const enum TScrollMode {
    HORIZONTAL = 0,
    VERTICAL = 1,
    PAGE = 2,
}

export const enum PedalSettings {
    playPause = 'playPause',
    nextPage = 'nextPage',
    prevPage = 'prevPage',
    autoScroll = 'autoScroll',
}

export type TPedalSettings = Record<keyof typeof PedalSettings, string | null>
export type ScorePageLayoutOptionKey = 'horizontal' | 'vertical' | 'single-line'
export type TPersistentScoreSettings = {
    addedAt: number
    tempo: number
    transposeDiff: number
    isCountdownEnabled: boolean
    metronomeVolume: number
    isMetronomeEnabled: boolean
    visiblePartIds: number[]
    playablePartIds: number[]
    partVolumeMap: Record<string, number>
}

export type TScoreState = {
    pageLayoutType: ScorePageLayoutOptionKey
    playback: number
    playbackPosition: Record<number, number>
    isLoopEnabled: boolean
    isFullScreen: boolean
    totalPages: number
    currentPage: number
    currentScore: MSScoreT | null
    scoreUri: string | null
    isPlaying: boolean
    isSuccessLoading: boolean
    playbackStatus: TPlaybackStatus
    isKeyboardVisible: boolean
    isCursorVisible: boolean
    isAutoScrollModalShown: boolean
    isAutoScrollOfferVisible: boolean
    openScoreCount: number
    openScorePerSessionCount: number
    scoreMetaMap: Record<number, TScoreMetaState>
    storeVersion: number
    pedalSettings: TPedalSettings
    onboarded: boolean
    visibleOnboardingStep: 0 | 1 | 2 | 3 | null
    checkingPDFExportRestriction: boolean
    settingsSheetIndex: number
    practiceModeTooltipShown: boolean
    /**
     * Step of the two-tooltip walkthrough shown on the first score opened through the
     * first-session flow. `null` means there is nothing to show — either it was never armed
     * or the user has been through it.
     */
    firstSessionOnboardingStep: 0 | 1 | null
    showStoragePermissionModal: boolean
    scoreSettingsMap: Record<MSScoreT['id'], TPersistentScoreSettings>
    currentNoteSize: number
    isOpenBuyScoreModal: boolean
    isOpenScorePremiumModal: boolean
    hasProcessedFreeAutoscrollExp: boolean
    hasAppliedProVerticalDefault: boolean
    hasInitializedAndroidReaderLayout: boolean
    isOpenScoreFeatureModal: boolean
    pianoKeyboardHeight: number
    firstSessionSpotlight: TSpotlightRect | null
    isFirstSessionPlaybackLocked: boolean
    isFirstSessionSaveHintShown: boolean
    firstSessionLikeRect: TSpotlightRect | null
    pdfAnnotations: AnnotationPage[] | null
    arePdfAnnotationsReady: boolean
    pendingPdfExport: TPendingPdfExport | null
}

/**
 * A PDF export requested from a screen with no XTZ engine mounted (Score Info).
 * Picked up by the offscreen exporter, which mounts XTZ transiently to render.
 */
export type TPendingPdfExport = {
    score: MSScoreT
    filePath: string
}

export type TSpotlightRect = {
    x: number
    y: number
    width: number
    height: number
    radius: number
}

export type TScorePart = {
    id: number
    volume: number
    partName: string
    muted?: boolean
    originalVolume?: number
}

export type TNoteSizeState = {
    min: number
    max: number
}

export type TScoreMetaState = {
    bpm?: number
    originalTranspose: string
    commentsCount: number
    totalPages: number
    noteSizeState: TNoteSizeState
    parts: TScorePart[]
}

export type TScoreSourceFile = {
    uri: string
    type: 'pdf' | 'interactive'
}
