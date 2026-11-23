import FavoritesProvider from '../../../../App/Services/FavoritesProvider'
import { downloadWebScore, findSavedWebScoreFile, isDeviceVerificationError } from '../../../../App/Services/WebScoreProvider'
import { Alert, Platform } from 'react-native'

import { getScoreInfoScreenFeatureFlag } from '@mu-native/ab'
import { DispatchFun, GetStateFun, platform } from '@mu-native/common'
import { hqSoundfontThunkActions } from '@mu-native/hq-soundfont'
import { translate } from '@mu-native/locale'
import { marketingStoreChunk, sources } from '@mu-native/marketing'
import { NavigationService, Screen } from '@mu-native/navigation'
import { offlineScoresStoreChunk } from '@mu-native/offlineScores'
import { getCurrentScoreSettings, scoreStoreChunk, transpositionHelpers } from '@mu-native/score'
import { TMeta, TPart } from '@mu-native/xtz'

import MetricaEvents from '../../../../App/constants/MetricaEvents.ts'
import { getScoreMetaEvent } from '../../../../App/constants/scoreAnalytic.ts'
import ScoreActionsController, {
    updateInSongbook,
} from '../../../../App/Controllers/ScoreActionsController.ts'
import SongBookController, { isOfflineScoreArchive } from '../../../../App/Controllers/SongBookController'
import { updateSpotlightIndex } from '../../../../App/Controllers/SpotlightController.ts'
import { fromExtasyMetaData } from '../../../../App/Model/MSOfflineScore.ts'
import type { MSScoreT } from '../../../../App/Model/MSScore.ts'
import { showFetchScoreInfoErrorsPopup } from '../../../../App/Score/scoreErrorPopups.ts'
import { copyFile, exists, getFileExtension } from '../../../../App/Services/FilesProvider.ts'
import * as ScoreInfoProvider from '../../../../App/Services/ScoreInfoProvider.ts'
import {
    downloadScore,
    performGetScoreInfoRequest,
} from '../../../../App/Services/ScoreInfoProvider.ts'
import reportEvent from '../../../../App/Utils/Analytics.ts'
import SentryUtils from '../../../../App/Utils/Sentry.ts'
import Utils from '../../../../App/Utils/Utils.ts'
import { createLatestOnly } from '../../helpers/latestOnly'
import { navigateToScore } from '../../hooks/useOpenScore'

import { annotationThunks } from './annotationThunks.ts'
import { commonScoreThunks } from './commonScoreThunks.ts'
import { metronomeThunks } from './metronomeThunks.ts'
import { mixerThunks } from './mixerThunks.ts'
import { scoreMutationThunks } from './scoreMutationThunks.ts'
import { soundfontThunks } from './soundfontThunks.ts'

function openOfflineScore(score: MSScoreT) {
    return async (dispatch: DispatchFun) => {
        try {
            dispatch(scoreStoreChunk.actions.setCurrentScore({ ...score, isOffline: true }))
            dispatch(scoreStoreChunk.actions.setArePdfAnnotationsReady(true))
            if (score.webScoreSaved || score.importedFromArchive) return
            const scoreInfo = await performGetScoreInfoRequest(score.id, 'OFFLINE', true, false)
            if (scoreInfo?.score) {
                dispatch(updateInSongbook(scoreInfo.score))
                dispatch(
                    scoreStoreChunk.actions.setCurrentScore({
                        ...scoreInfo.score,
                        isOffline: true,
                    }),
                )
            }
        } catch (e: any) {
            /* empty */
        }
    }
}

/**
 * One-time default layout applied the first time a user opens a score; afterwards
 * the user's own choice is respected (guarded by hasAppliedProVerticalDefault).
 *
 * - Pro users (and users who purchased the score) default to Vertical scrolling
 *   — a paid layout they have access to.
 * - Non-Pro users in the Score Info experiment (phones, interactive scores)
 *   default to Single Line — a free layout. Vertical is paywalled, so defaulting
 *   free users into it re-paywalls someone who has already been using it, and
 *   defaulting to Portrait would kill the landscape playing experience the
 *   experiment is testing.
 */
function applyDefaultPageLayout(score: MSScoreT) {
    return (dispatch: DispatchFun, getState: GetStateFun) => {
        const state = getState()
        if (
            Platform.OS === 'android' &&
            (!score.isPdf || scoreStoreChunk.props.getHasInitializedAndroidReaderLayout(state))
        ) {
            return
        }
        const alreadyApplied = scoreStoreChunk.props.getHasAppliedProVerticalDefault(state)

        if (alreadyApplied) return

        const isPro = marketingStoreChunk.props.getIsPro(state)

        if (isPro || score.isPurchased) {
            dispatch(scoreStoreChunk.actions.setPageLayoutType('vertical'))
            dispatch(scoreStoreChunk.actions.setHasAppliedProVerticalDefault(true))
            return
        }

        if (!platform.isTablet && !score.isPdf && getScoreInfoScreenFeatureFlag()) {
            dispatch(scoreStoreChunk.actions.setPageLayoutType('single-line'))
            dispatch(scoreStoreChunk.actions.setHasAppliedProVerticalDefault(true))
        }
    }
}

/**
 * Both openScore and openScoreInfo write the current score after awaiting the
 * network, and nothing cancels them when the user leaves. One counter for both:
 * whichever score the user asked for last is the one allowed to write
 * (MUP-14313).
 */
const scoreOpens = createLatestOnly()

function openScore(score: MSScoreT) {
    return async (dispatch: DispatchFun) => {
        const run = async () => {
            const open = scoreOpens.claim()
            reportEvent('Dev: openScore call', getScoreMetaEvent(score))
            dispatch(applyDefaultPageLayout(score))
            dispatch(commonScoreThunks.saveScoreCommentsCount(score))
            await dispatch(soundfontThunks.applySoundfontSettings())

            const webScoreSaved = !score.isPdf && !!await findSavedWebScoreFile(score.id)
            if (score.isOffline || webScoreSaved) {
                if (scoreOpens.isStale(open)) return false
                await dispatch(openOfflineScore({ ...score, webScoreSaved }))
                return true
            }

            score.isFavorite = FavoritesProvider.isFavorite(score)
            let loadedScore = score
            if (Platform.OS === 'android' && !score.isPdf) {
                // The open engine uses public viewer media, not the mobile renderer payload.
                await downloadWebScore(score)
            } else {
                const scoreInfo = await performGetScoreInfoRequest(score.id, 'ONLINE', false)
                await downloadScore(scoreInfo)
                loadedScore = scoreInfo.score
            }
            // The file stays in the cache either way — only the screen state is
            // no longer ours to set.
            if (scoreOpens.isStale(open)) return false
            dispatch(scoreStoreChunk.actions.setCurrentScore(loadedScore))
            if (loadedScore.annotation?.url) {
                dispatch(annotationThunks.loadAnnotations(loadedScore.annotation.url))
            } else {
                dispatch(scoreStoreChunk.actions.setArePdfAnnotationsReady(true))
            }
            updateSpotlightIndex([score])
            return false
        }

        try {
            return await run()
        } catch (error) {
            // The popup waits for the device-verification sheet, so a successful
            // retry answers here with the open the screen is still waiting for.
            const retried = await showFetchScoreInfoErrorsPopup(error, {
                retry: run,
                source: 'openScore',
            })
            return retried
        }
    }
}

/**
 * Lightweight load for the Score Info screen: fetches the full score metadata
 * (rating, description, comments, publisher profile) and stores it as the
 * current score, WITHOUT downloading the heavy renderer file. The file is
 * downloaded only once the user taps "Play" and the player screen runs
 * {@link openScore}.
 */
function openScoreInfo(score: MSScoreT) {
    return async (dispatch: DispatchFun) => {
        // Render immediately from the list data, then enrich with full info.
        dispatch(scoreStoreChunk.actions.setCurrentScore(score))
        dispatch(commonScoreThunks.saveScoreCommentsCount(score))

        const run = async () => {
            const open = scoreOpens.claim()
            const usage = score.isOffline ? 'OFFLINE' : 'ONLINE'
            const scoreInfo = await performGetScoreInfoRequest(score.id, usage, false)
            if (scoreOpens.isStale(open)) return
            dispatch(scoreStoreChunk.actions.setCurrentScore(scoreInfo.score))
            dispatch(commonScoreThunks.saveScoreCommentsCount(scoreInfo.score))
            updateSpotlightIndex([scoreInfo.score])
        }

        try {
            await run()
        } catch (error) {
            // Catalog metadata is already displayed. Preview/Play resolves the actual
            // file through the alternative source when mobile attestation fails.
            if (await isDeviceVerificationError(error)) return
            await showFetchScoreInfoErrorsPopup(error, { retry: run, source: 'openScoreInfo' })
        }
    }
}

function handleOpenDeepLinkURL(url: string) {
    return async () => {
        const run = async () => {
            const scoreId = url.split('/').pop()
            if (!scoreId) return
            const scoreData = await ScoreInfoProvider.performGetScoreInfoRequest(
                parseInt(scoreId, 10),
                'ONLINE',
            )

            const { score } = scoreData
            await ScoreInfoProvider.downloadScoreFile(score, 'ONLINE')
            navigateToScore(score, { isDeepLink: true })
        }

        try {
            await run()
        } catch (error) {
            await showFetchScoreInfoErrorsPopup(error, {
                retry: run,
                source: 'deepLinkUrl',
                // Nothing to go back from — the user is not on a score screen.
                onDismiss: () => undefined,
            })
        }
    }
}

function openOfflineFile(url: string, isShowNotification?: boolean, fileName?: string) {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        try {
            reportEvent(MetricaEvents.SCORE_LOAD_OFFLINE, { url })
            const realURI = Platform.OS === 'android' ? url : decodeURI(url)
            const name = fileName ?? realURI
            if (Platform.OS === 'android' && isOfflineScoreArchive(name)) {
                const score = await SongBookController.importOffline(
                    realURI.startsWith('/') ? `file://${encodeURI(realURI)}` : realURI,
                )
                navigateToScore(score)
                return
            }
            const fileType = getFileExtension(name).toLowerCase()
            if (fileType !== 'mscz' && fileType !== 'mscze') return
            const isPro = marketingStoreChunk.props.getIsPro(getState())

            if (!isPro) {
                dispatch(
                    marketingStoreChunk.actions.setPartialFieldsCustom({
                        featureText: 'marketing_text.open_file',
                        source: sources.local,
                    }),
                )

                NavigationService.navigate(Screen.featuresLandingScreen)

                return
            }

            dispatch(scoreStoreChunk.actions.setIsSuccessLoading(false))

            dispatch(
                offlineScoresStoreChunk.actions.updateFileProcessingState({
                    progress: 0.1,
                    status: 'start',
                }),
            )

            const newScoreId = Utils.hashCode(realURI)
            const fullFilePath = ScoreInfoProvider.getOfflineScoreFileUrl(newScoreId, 0, 'mscz')
            const isAlreadyExists = await exists(fullFilePath)

            dispatch(
                offlineScoresStoreChunk.actions.updateFileProcessingState({
                    progress: 0.2,
                    status: 'copy',
                }),
            )

            if (!isAlreadyExists) await copyFile(realURI, fullFilePath)

            dispatch(
                offlineScoresStoreChunk.actions.updateFileProcessingState({
                    progress: 1,
                    status: 'open',
                }),
            )

            if (isShowNotification) {
                navigateToScore({ id: newScoreId, isOffline: true, isAiScan: true })
            } else {
                navigateToScore({ id: newScoreId, isOffline: true })
            }
        } catch (error: any) {
            SentryUtils.sendMessage('openOfflineFile', error)
            const message = error ? error.message : ''
            Alert.alert(translate('native.score.error_opening_file'), message)
        } finally {
            dispatch(
                offlineScoresStoreChunk.actions.updateFileProcessingState({
                    progress: 0,
                    status: null,
                }),
            )
        }
    }
}

function prepareParts(parts: readonly TPart[]) {
    if (!parts || !parts?.length) {
        return []
    }

    return parts?.map((part, index) => ({
        ...part,
        partName:
            part.partName || translate('native.score.part_number', { number: String(index + 1) }),
        id: index,
    }))
}

export function onScoreMetaLoaded(scoreMetaData: TMeta & { bpm?: number }) {
    return async (
        dispatch: (...args: Array<any>) => any,
        getState: (...args: Array<any>) => any,
    ) => {
        const score = scoreStoreChunk.props.getCurrentScore(getState())
        if (!score) return

        const offlineScore = fromExtasyMetaData(score?.id, {
            ...scoreMetaData,
            isPurchased: score?.isPurchased,
            previewImageUrl: score?.previewImageUrl,
            isAiScan: !!score?.isAiScan,
        })

        if (score?.isOffline) {
            dispatch(ScoreActionsController.addIntoSongBook(offlineScore, true))
            // For manually uploaded .mscz scores
            if (!score.title) {
                dispatch(
                    scoreStoreChunk.actions.setCurrentScore(offlineScore as unknown as MSScoreT),
                )
            }
        }

        const { keysig } = score
        dispatch(scoreStoreChunk.actions.setTotalPages(scoreMetaData.totalPages))

        const parts = prepareParts(scoreMetaData.parts)
        const originalTranspose = keysig
            ? transpositionHelpers.getOriginalTransposeByKeySignature(keysig)
            : // @ts-ignore
              transpositionHelpers.getOriginalTransposeByCode(scoreMetaData.key)
        const noteSizeState = {
            min: scoreMetaData.minNoteSize,
            max: scoreMetaData.maxNoteSize,
        }

        dispatch(
            scoreStoreChunk.actions.loadMeta({
                scoreId: score.id,
                meta: {
                    parts,
                    originalTranspose,
                    noteSizeState,
                    bpm: scoreMetaData.bpm,
                },
            }),
        )
        dispatch(applySavedSettings())
    }
}

function applySavedSettings() {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        const settings = getCurrentScoreSettings(getState())
        dispatch(scoreMutationThunks.setTranspose(settings.transposeDiff, true))
        dispatch(metronomeThunks.setTempo(settings.tempo))
        dispatch(metronomeThunks.setCountdownEnabled(settings.isCountdownEnabled))
        dispatch(metronomeThunks.setIsMetronomeEnabled(settings.isMetronomeEnabled))
        dispatch(metronomeThunks.setMetronomeVolume(settings.metronomeVolume))

        const { partVolumeMap } = settings
        Object.entries(partVolumeMap).forEach(([partId, volume]) => {
            dispatch(mixerThunks.setPartVolume(parseInt(partId, 10), volume))
        })

        await dispatch(hqSoundfontThunkActions.initializeSoundfont())
    }
}

export const loadingThunks = {
    openScore,
    openScoreInfo,
    openOfflineFile,
    handleOpenDeepLinkURL,
    onScoreMetaLoaded,
}
