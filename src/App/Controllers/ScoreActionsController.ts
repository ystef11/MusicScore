import FavoritesProvider, { usesLocalFavorites } from '../Services/FavoritesProvider'
import { Alert, NativeModules, Platform } from 'react-native'
import * as RNFS from '@dr.pogodin/react-native-fs'

import { APIStatusCodes, apiRequest, isResponse, scoreContracts } from '@mu-native/api'
import { authStoreChunk, getIsAuthorized, getCanUseFavorites } from '@mu-native/auth'
import { Clipboard, DispatchFun, platform, RNShare, store } from '@mu-native/common'
import { showAlertNotification } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { billingThunks, marketingConstants, marketingStoreChunk } from '@mu-native/marketing'
import { NavigationService, Screen } from '@mu-native/navigation'
import { getScoreShareUrl, scoreStoreChunk, scoreThunks } from '@mu-native/score'
import {
    appEventsEmitter,
    checkConnection,
    ensureNetwork,
} from '@mu-native/system'

import type { MSScoreT } from '../Model/MSScore'
import '../Model/MSScore'
import { State } from '../Reducers/Types'
import { isExportToPdfRestrictedWithinTrial } from '../Score/scoreActionsAsync'
import { showFetchScoreInfoErrorsPopup } from '../Score/scoreErrorPopups'
import { exists, unlink } from '../Services/FilesProvider'
import {
    createOfflineScoreModel,
    getExistingScoreUrl,
    performGetScoreInfoRequest,
} from '../Services/ScoreInfoProvider'
import UserScoresProvider from '../Services/UserScoresProvider'
import { saveCachedWebScore, usesWebScoreCache, type WebScoreExportFormat } from '../Services/WebScoreProvider'
import reportEvent from '../Utils/Analytics'
import Sentry from '../Utils/Sentry'

import FavoritesController from './FavoritesController'
import SongBookController from './SongBookController'

import MetricaEvents from '../constants/MetricaEvents'
import { getScoreMetaEvent } from '../constants/scoreAnalytic'
import { MSOfflineScoreT } from '../Model/MSOfflineScore.ts'

let isRateModalShown = false

const FAVORITES_TOAST_MARGIN = 60

const { sources } = marketingConstants

type Dispatch = (...args: Array<any>) => any
type GetState = () => State
type Thunk = (dispatch: Dispatch, getState: GetState) => any

export const ActionSheetContexts = {
    EXPORT: 'export',
    SHARE: 'share',
    LIBRARY: 'library',
    FAVORITE: 'favorite',
    PLAYBACK: 'playback',
    SCORE_DETAILS: 'score_details',
    ADD_TO_SONGBOOK: 'songbook',
} as const
export type TActionSheetContext = (typeof ActionSheetContexts)[keyof typeof ActionSheetContexts]

function doShowRateScore(score: MSScoreT, context: TActionSheetContext) {
    appEventsEmitter.emit('presentScoreRate', score, context)
}

function canShowRateModal(getState: GetState, score: MSScoreT) {
    const isAuthorized = getIsAuthorized(getState())
    if (!isAuthorized) return false

    const ownId = authStoreChunk.props.getUser(getState())?.id
    if (score.authorId === ownId) return false

    if (isRateModalShown) return false

    return !score.userRating
}

export function showRateScore(score: MSScoreT, context: TActionSheetContext) {
    try {
        if (!canShowRateModal(store.getState, score)) return
        isRateModalShown = true
        doShowRateScore(score, context)
    } catch (error) {
        Sentry.sendMessage('showRateScore', error)
    }
}

function showAddedToFavoritesAlert(score: MSScoreT): Thunk {
    return (dispatch: DispatchFun) => {
        const title = translate('native.score_actions.can_be_made_offline')
        const actionTitle = translate('native.action.try')
        showAlertNotification({
            margin: FAVORITES_TOAST_MARGIN,
            title,
            actionTitle,
            action: () => {
                dispatch(addIntoSongBook(score, false))
            },
            expiresIn: 3000,
        })
    }
}

export function addIntoFavorites(score: MSScoreT, preventRateScoreModal = false): Thunk {
    return async (dispatch: DispatchFun, getState: GetState): Promise<boolean> => {
        reportEvent(MetricaEvents.SCORE_FAVORITES_ADD_OLD, { ...getScoreMetaEvent(score) })
        reportEvent(MetricaEvents.SCORE_LIKE, { ...getScoreMetaEvent(score) })
        try {
            await dispatch(FavoritesController.addToFavorites(score))
            dispatch(scoreStoreChunk.actions.toggleFavorite(true))
            if (!getIsAuthorized(getState())) return true
            if (preventRateScoreModal || !canShowRateModal(getState, score)) {
                dispatch(showAddedToFavoritesAlert(score))
                return true
            }
            showRateScore(score, ActionSheetContexts.FAVORITE)
            return true
        } catch (error) {
            Alert.alert('Избранное', error instanceof Error ? error.message : String(error))
            Sentry.sendMessage('addToFavorites', error)
            return false
        }
    }
}

export function removeFromFavorites(score: MSScoreT): Thunk {
    return async (dispatch: DispatchFun): Promise<boolean> => {
        reportEvent(MetricaEvents.SCORE_UNLIKE, getScoreMetaEvent(score))

        reportEvent(MetricaEvents.SCORE_FAVORITES_REMOVE_OLD, getScoreMetaEvent(score))
        reportEvent(MetricaEvents.SCORE_FAVORITE_REMOVE, getScoreMetaEvent(score))
        try {
            await dispatch(FavoritesController.removeFromFavorites(score))
            dispatch(scoreStoreChunk.actions.toggleFavorite(false))
            showAlertNotification({
                title: translate('native.alertNotifications.favorites.remove_exp'),
                margin: FAVORITES_TOAST_MARGIN,
            })
            return true
        } catch (error) {
            Alert.alert('Избранное', error instanceof Error ? error.message : String(error))
            Sentry.sendMessage('removeFromFavorites', error)
            return false
        }
    }
}

function addIntoSongBook(
    currentScore: MSScoreT | MSOfflineScoreT | null,
    isOffline: boolean,
): Thunk {
    return async () => {
        if (!currentScore) return

        const score = currentScore as MSScoreT

        const run = async () => {
            if (!isOffline) {
                await SongBookController.saveOffline(score)
                reportEvent(MetricaEvents.SCORE_SONGBOOK_ADD, getScoreMetaEvent(score))
                reportEvent(MetricaEvents.SCORE_ADD_TO_LIBRARY, getScoreMetaEvent(score))
                showAlertNotification({ title: translate('native.alertNotifications.songbook.add_exp') })
                return
            }

            if (!SongBookController.isInSongBookOrder(score) && !SongBookController.isInSongBook(score)) {
                SongBookController[
                    score.isPurchased ? 'addIntoToOrdersSongBook' : 'addIntoSongBook'
                ](score)
            }
        }

        try {
            await run()
        } catch (error) {
            await showFetchScoreInfoErrorsPopup(error, { retry: run, source: 'addIntoSongBook' })
        }
    }
}

export function removeFromMyScores(score: MSScoreT, isScoreScreen = false): Thunk {
    return () => {
        checkConnection()
        const removeAlertTitle = translate('native.song_book_remove.title_with_score', {
            title: score.title,
        })
        const removeAlertSubTitle = translate('native.song_book_remove.subtitle')
        const submitButton = translate('native.search.submit_button')
        const cancelButton = translate('native.search.cancel_button')

        const removeAlertButtons = [
            {
                text: submitButton,
                onPress: async () => {
                    try {
                        await UserScoresProvider.deleteUserScoreRequest(score?.id)
                    } catch (error) {
                        // 404: the score is already gone, which is what the user asked for.
                        if (!isResponse(error) || error.status !== APIStatusCodes.notFound) {
                            Sentry.sendMessage('removeFromMyScores', error)
                            return
                        }
                    }

                    if (isScoreScreen) {
                        NavigationService.goBack()
                    }
                },
            },
            {
                text: cancelButton,
                style: 'cancel' as const,
            },
        ]
        Alert.alert(removeAlertTitle, removeAlertSubTitle, removeAlertButtons)
    }
}

let isSharing = false

export function share(score: MSScoreT): Thunk {
    return async () => {
        if (isSharing) return
        isSharing = true
        try {
            const url = await getScoreShareUrl(score)
            if (!url) return

            Clipboard.setString(url)
            const { title } = score
            const options = Platform.select({
                ios: {
                    activityItemSources: [
                        {
                            placeholderItem: { type: 'url', content: url },
                            item: { default: { type: 'url' as const, content: url } },
                            subject: { default: title },
                            linkMetadata: { originalUrl: url, url, title },
                        },
                    ],
                    failOnCancel: false,
                },
                default: {
                    title,
                    subject: title,
                    message: url,
                    failOnCancel: false,
                },
            })
            await RNShare.open(options as any)
            reportEvent(MetricaEvents.SCORE_SHARE, getScoreMetaEvent(score))
            showRateScore(score, ActionSheetContexts.SHARE)
        } catch (error: any) {
            // The sheet did open and the user closed it — nothing failed.
            if (error?.message?.includes('User did not share')) {
                showRateScore(score, ActionSheetContexts.SHARE)
                return
            }
            // The daily cap on /score/share is global, so a user can be refused on
            // their very first share. Sentry drops 4xx responses, which is why this
            // never showed up anywhere — report it as a message to size the problem.
            if (isResponse(error) && error.status === APIStatusCodes.rateLimit) {
                showAlertNotification({
                    title: translate('native.alertNotifications.tooManyRequests'),
                })
                Sentry.sendMessage('share', 'score share rate limited', { scoreId: score.id })
                return
            }
            showAlertNotification({ title: translate('native.new_concept.common.error_title') })
            Sentry.sendMessage('share', error)
        } finally {
            isSharing = false
        }
    }
}

function downloadFile(score: MSScoreT, type: string): Thunk {
    return async () => {
        const run = async () => {
            const scoreInfo = await performGetScoreInfoRequest(score.id, 'ONLINE', true)
            const { title } = score
            const formattedTitle = title.replace(/[^a-zA-Z ]/g, '').replace(/ /g, '_')
            const url = `${RNFS.CachesDirectoryPath}/${formattedTitle}.${type}`
            const downloaded = RNFS.downloadFile({
                fromUrl: scoreInfo.urls[type],
                toFile: url,
            })
            const result = await downloaded.promise
            if (result.statusCode === 200) {
                const fileUrl = `file://${url}`
                const isExist = await RNFS.exists(fileUrl)

                if (isExist) {
                    reportEvent(MetricaEvents.SCORE_DOWNLOAD, {
                        ...getScoreMetaEvent(score),
                        'params.key': ['export_type'],
                        'params.str_value': [type === 'mid' ? 'midi' : type],
                        'params.value': [0],
                    })

                    if (platform.isAndroid) {
                        const { SaveDocumentModule } = NativeModules
                        await SaveDocumentModule.saveDocuments([fileUrl])
                        return
                    }

                    const options = {
                        url: fileUrl,
                        type: `application/${type}`,
                        title,
                        subject: title,
                        saveToFiles: true,
                        failOnCancel: false,
                    }
                    await RNShare.open(options)
                } else {
                    Alert.alert(
                        translate('native.alerts.error_title'),
                        translate('native.alerts.download_failed'),
                    )
                }
            } else {
                Alert.alert(
                    translate('native.alerts.error_title'),
                    translate('native.alerts.download_failed'),
                )
            }
        }

        try {
            await run()
        } catch (error: any) {
            if (error?.error?.domain === 'CANCELLED' || error?.code === 'CANCELLED') return
            await showFetchScoreInfoErrorsPopup(error, { retry: run, source: 'downloadFile' })
        }
    }
}

async function exportScoreFile(
    score: MSScoreT,
    format: WebScoreExportFormat | 'offline_archive',
    viewerPath?: string,
) {
    if (score.score_blocked_by_country ||
        ((score.isOfficial || score.isPdf) && !score.isPurchased && !score.isPublicDomain)) {
        Alert.alert(translate('native.score.download_restricted_title'))
        return false
    }
    try {
        if (format === 'pdf') showAlertNotification({ title: 'Подготовка PDF…', expiresIn: 3000 })
        if (format === 'offline_archive') {
            await SongBookController.exportOffline(score, { includeCache: true, viewerPath })
        } else {
            await saveCachedWebScore(score, format, viewerPath)
        }
        return true
    } catch (error: any) {
        if (error?.code === 'CANCELLED') return false
        Alert.alert(translate('native.alerts.error_title'), error?.message || translate('native.alerts.download_failed'))
        return false
    }
}

export function exportToOfflineArchive(score: MSScoreT, viewerPath?: string) {
    return exportScoreFile(score, 'offline_archive', viewerPath)
}

function downloadPDFScore(score: MSScoreT, filepath: string, title: string) {
    return async () => {
        try {
            let finalFilepath: string = filepath
            if (score.isPdf) {
                if (!score.isPurchased && !score.isPublicDomain) {
                    throw new Error("Score isn't purchased")
                }
                const pdfFileUrl = await getExistingScoreUrl(score.id, false)
                if (!pdfFileUrl) {
                    throw new Error('downloadPDFScore', {
                        cause: `PDF file URL is null at downloading. Score ID: ${score.id}`,
                    })
                }
                finalFilepath = pdfFileUrl
            } else {
                const response = await apiRequest(scoreContracts.download, {
                    params: { score_id: score.id },
                })

                const { pdf: url } = response.urls

                const downloaded = RNFS.downloadFile({
                    fromUrl: url,
                    toFile: filepath,
                })
                const result = await downloaded.promise
                if (result.statusCode !== 200) {
                    throw new Error('downloadPDFScore', {
                        cause: `HTTP status error code: ${result.statusCode}. Score ID: ${score.id}`,
                    })
                }
            }

            const fileUrl = `file://${finalFilepath}`
            const isExist = await RNFS.exists(fileUrl)

            if (isExist) {
                reportEvent(MetricaEvents.SCORE_DOWNLOAD, {
                    ...getScoreMetaEvent(score),
                    'params.key': ['export_type'],
                    'params.str_value': ['pdf'],
                    'params.value': [0],
                })

                if (platform.isAndroid) {
                    const { SaveDocumentModule } = NativeModules
                    await SaveDocumentModule.saveDocuments([fileUrl])
                    return true
                }

                const base64 = await RNFS.readFile(fileUrl, 'base64')

                const options = {
                    url: `data:application/pdf;base64,${base64}`,
                    type: 'application/pdf',
                    title,
                    filename: `${title}.pdf`,
                    failOnCancel: false,
                    showAppsToView: true,
                }

                setTimeout(() => {
                    RNShare.open(options)
                }, 500)
                return true
            } else {
                throw new Error('downloadPDFScore', {
                    cause: `File not found after downloading. Score ID: ${score.id}`,
                })
            }
        } catch (e: any) {
            // The save picker was closed, or a second save replaced this one.
            if (e?.code === 'CANCELLED') return
            Sentry.sendMessage('downloadPDFScore', e)
            Alert.alert(
                translate('native.alerts.error_title'),
                translate('native.alerts.download_failed'),
            )
            return false
        }
    }
}

export function exportToPDF(score: MSScoreT, offscreenExport = false, viewerPath?: string) {
    return async (dispatch: DispatchFun, getState: GetState) => {
        if (usesWebScoreCache(score)) {
            if (await exportScoreFile(score, 'pdf', viewerPath)) showRateScore(score, ActionSheetContexts.EXPORT)
            return
        }

        checkConnection()
        const isPro = marketingStoreChunk.props.getIsPro(getState())
        const isTrial = marketingStoreChunk.props.getIsTrialPro(getState())

        dispatch(scoreStoreChunk.actions.setCheckingPDFExportRestriction(true))
        let isExportToPdfRestricted = true
        try {
            isExportToPdfRestricted =
                (isPro && !isTrial) || score?.isPublicDomain
                    ? false
                    : await isExportToPdfRestrictedWithinTrial(score.id)
            if (isPro && isExportToPdfRestricted) {
                Alert.alert(
                    translate('native.score.download_restricted_title'),
                    translate('native.score.download_restricted_trial_message'),
                )
                return
            }
        } catch (e) {
            Sentry.sendMessage('checkPDFRestriction', e)
            showAlertNotification({
                title: translate('native.alerts.error_occurred'),
                expiresIn: 5000,
            })
            return
        } finally {
            dispatch(scoreStoreChunk.actions.setCheckingPDFExportRestriction(false))
        }

        if (!isPro && !score?.isPurchased && !score?.isPublicDomain) {
            dispatch(
                marketingStoreChunk.actions.setPartialFieldsCustom({
                    featureText: 'marketing_text.export_pdf',
                    source: isExportToPdfRestricted ? sources.pdf_trialRestricted : sources.pdf,
                    inAppForSale: { id: score?.id, title: score?.title },
                }),
            )

            dispatch(checkPremiumThunk())
            return
        }

        try {
            showAlertNotification({ title: translate('native.alertNotifications.downloading') })
            const failureAlertTitle = translate('native.alerts.failure_download_pdf_score.title')

            if (!score) {
                Alert.alert(failureAlertTitle)
                return
            }

            const name = score && score?.title

            /**
             * Заменяем символы, так как в iOS начинает формироваться путь с символами, что приводит к крэшу
             * аналогично с midi and mp3
             */
            const formattedTitle = name.replace(/[^a-zA-Z ]/g, '').replace(/ /g, '_')

            const pdfFileName = `${formattedTitle || score?.id}.pdf`
            const pdfFilePath = `${RNFS.CachesDirectoryPath}/${pdfFileName}`
            const isExistsBefore = await exists(pdfFilePath)

            if (isExistsBefore) {
                await unlink(pdfFilePath)
            }

            if (score.isPdf) {
                const isSaved = await dispatch(downloadPDFScore(score, pdfFilePath, formattedTitle))
                if (isSaved) showRateScore(score, ActionSheetContexts.EXPORT)
            } else if (offscreenExport) {
                // Score Info keeps no XTZ engine mounted, and the server
                // /score/download endpoint forbids PDF for official scores (403).
                // Hand off to the offscreen exporter, which mounts XTZ transiently
                // and renders the PDF locally (see ScoreInfoPdfExporter).
                dispatch(
                    scoreStoreChunk.actions.setPendingPdfExport({ score, filePath: pdfFilePath }),
                )
            } else {
                await dispatch(scoreThunks.exportPdf(score, pdfFilePath))
                showRateScore(score, ActionSheetContexts.EXPORT)
            }
        } catch (error) {
            Sentry.sendMessage('exportToPDF', error)
        }
    }
}

export function exportToMIDI(score: MSScoreT, viewerPath?: string): Thunk {
    return async (dispatch: DispatchFun, getState: GetState) => {
        reportEvent(MetricaEvents.SCORE_EXPORT_MIDI_CLICK)
        if (usesWebScoreCache(score)) {
            if (await exportScoreFile(score, 'mid', viewerPath)) {
                reportEvent(MetricaEvents.SCORE_EXPORT_MIDI)
            }
            return
        }

        const isPro = marketingStoreChunk.props.getIsPro(getState())
        if (isPro || score?.isPurchased || score?.isPublicDomain) {
            await dispatch(downloadFile(score, 'mid'))
            reportEvent(MetricaEvents.SCORE_EXPORT_MIDI)
        } else {
            dispatch(
                marketingStoreChunk.actions.setPartialFieldsCustom({
                    inAppForSale: {
                        id: score?.id,
                        title: score?.title,
                    },
                    source: sources.midi,
                    featureText: 'marketing_text.export_midi',
                }),
            )

            dispatch(checkPremiumThunk())
        }
    }
}

export function exportToMP3(score: MSScoreT, viewerPath?: string): Thunk {
    return async (dispatch: DispatchFun, getState: GetState) => {
        reportEvent(MetricaEvents.SCORE_DOWNLOAD_CLICK, {
            ...getScoreMetaEvent(score),
            'params.key': ['export_type'],
            'params.str_value': ['mp3'],
            'params.value': [0],
        })

        if (usesWebScoreCache(score)) {
            if (await exportScoreFile(score, 'audio', viewerPath)) {
                reportEvent(MetricaEvents.SCORE_EXPORT_MP3)
            }
            return
        }

        const isPro = marketingStoreChunk.props.getIsPro(getState())
        if (isPro || score?.isPurchased) {
            await dispatch(downloadFile(score, 'mp3'))
            reportEvent(MetricaEvents.SCORE_EXPORT_MP3)
        } else {
            dispatch(
                marketingStoreChunk.actions.setPartialFieldsCustom({
                    inAppForSale: {
                        id: score?.id,
                        title: score?.title,
                    },
                    source: sources.mp3,
                    featureText: 'marketing_text.export_mp3',
                }),
            )

            NavigationService.navigate(Screen.featuresLandingScreen, { inAppItem: score })
        }
    }
}

export const toggleFavoriteAndRateScore = (score: MSScoreT, preventRatingOffer = false): Thunk => {
    return async (dispatch: DispatchFun) => {
        if (!usesLocalFavorites()) await ensureNetwork()
        const isInFavoritesScore = FavoritesProvider.isFavorite(score)
        if (isInFavoritesScore) {
            return dispatch(removeFromFavorites(score))
        } else {
            return dispatch(addIntoFavorites(score, preventRatingOffer))
        }
    }
}

export const buySingleScore = (
    score: MSScoreT,
    callback?: () => Promise<void> | void,
    funnelStartAction?: string,
): Thunk => {
    return async (dispatch: DispatchFun, getState: GetState) => {
        const creditBalance = marketingStoreChunk.props.getCreditBalance(getState())
        if (creditBalance > 0) {
            reportEvent(MetricaEvents.SPEND_CREDIT_SCORE, {
                value: creditBalance,
            })
            dispatch(billingThunks.buyScoreByCreditThunk({ scoreId: score.id, callback }))
            return
        }

        // Pro+ already covers the subscription part, so only the score itself is left to sell
        if (score?.isOfficial && marketingStoreChunk.props.getIsOffScores(getState())) {
            dispatch(scoreStoreChunk.actions.setIsOpenBuyScoreModal(true))
            return
        }

        dispatch(
            marketingStoreChunk.actions.setPartialFieldsCustom({
                inAppForSale: {
                    id: score?.id,
                    title: score?.title,
                },
                source: score?.isOfficial ? sources.offScoresLanding : sources.pieceSale,
                ...(score?.isOfficial ? {} : { featureText: 'marketing_text.score' }),
            }),
        )

        NavigationService.navigate(Screen.screenLongLanding, {
            planName: score?.isOfficial ? 'offScores' : 'pro',
            inAppItem: score,
            funnelStartAction: score?.isOfficial ? 'official score' : funnelStartAction,
        })
    }
}

export const tryShowExperimentalRateScoreModal = (): Thunk => {
    return async (dispatch: DispatchFun, getState: GetState) => {
        const isAuthorized = getIsAuthorized(getState())

        if (!isAuthorized) {
            reportEvent(MetricaEvents.RATING_AUTORIZATION_SHOW, {
                context: ActionSheetContexts.SCORE_DETAILS,
            })
            setTimeout(() => {
                dispatch(
                    authStoreChunk.actions.presentAuthModal(() => {
                        const score = scoreStoreChunk.props.getCurrentScore(getState())
                        if (!score) return
                        doShowRateScore(score, ActionSheetContexts.SCORE_DETAILS)
                    }),
                )
            }, 150)
        } else {
            const score = scoreStoreChunk.props.getCurrentScore(getState())
            if (!score) return
            doShowRateScore(score, ActionSheetContexts.SCORE_DETAILS)
        }
    }
}

export function updateInSongbook(score: MSScoreT): Thunk {
    return async () => {
        const hasInSongBook = score.isPurchased
            ? SongBookController.isInSongBookOrder(score)
            : SongBookController.isInSongBook(score)

        if (!hasInSongBook) return

        const offlineScore = createOfflineScoreModel(score)
        SongBookController[score.isPurchased ? 'addIntoToOrdersSongBook' : 'addIntoSongBook'](
            offlineScore,
        )
    }
}

export const updateCurrentScore = (score: MSScoreT): Thunk => {
    return async (dispatch: DispatchFun) => {
        const run = async () => {
            const scoreInfo = await performGetScoreInfoRequest(score.id, 'ONLINE')
            dispatch(
                scoreStoreChunk.actions.setCurrentScore({
                    ...scoreInfo.score,
                    isOffline: score.isOffline,
                }),
            )
            if (score.isOffline) {
                dispatch(updateInSongbook(scoreInfo.score))
            }
        }

        try {
            await run()
        } catch (error) {
            await showFetchScoreInfoErrorsPopup(error, { retry: run, source: 'updateCurrentScore' })
        }
    }
}

export const checkPremiumThunk = (): Thunk => {
    return async (dispatch, getState) => {
        try {
            const isOpenScorePremiumModal =
                scoreStoreChunk.props.getIsOpenScorePremiumModal(getState())
            if (isOpenScorePremiumModal) return

            const isPremiumRights = marketingStoreChunk.props.getIsPremiumRights(getState())

            if (isPremiumRights) {
                dispatch(scoreStoreChunk.actions.setIsOpenBuyScoreModal(true))
            } else {
                dispatch(scoreStoreChunk.actions.setIsOpenScoreFeatureModal(true))
            }
        } catch (error) {
            console.error(error)
        }
    }
}

export const exportMp3ForBackgroundPlayback = (): Thunk => {
    return async (dispatch, getState) => {
        try {
            const type = 'mp3'
            const score = scoreStoreChunk.props.getCurrentScore(getState())
            if (!score) return null

            const scoreInfo = await performGetScoreInfoRequest(score.id, 'ONLINE', true)
            const { title } = score
            const formattedTitle = title.replace(/[^a-zA-Z ]/g, '').replace(/ /g, '_')
            const url = `${RNFS.CachesDirectoryPath}/${formattedTitle}.${type}`
            const downloaded = RNFS.downloadFile({
                fromUrl: scoreInfo.urls[type],
                toFile: url,
            })

            const result = await downloaded.promise
            if (result.statusCode === 200) {
                return `file://${url}`
            }

            return null
        } catch (error) {
            console.error(error)
            return null
        }
    }
}

export default { addIntoSongBook }
