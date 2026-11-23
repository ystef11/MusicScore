import { NativeModules } from 'react-native'

import { DispatchFun, GetStateFun, platform, RNFS, RNShare } from '@mu-native/common'
import { presentAlert } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { scoreStoreChunk, TScrollMode } from '@mu-native/score'
import { xtz } from '@mu-native/xtz'

import MetricaEvents from '../../../../App/constants/MetricaEvents.ts'
import { getScoreMetaEvent } from '../../../../App/constants/scoreAnalytic.ts'
import { MSScoreT } from '../../../../App/Model/MSScore.ts'
import reportEvent from '../../../../App/Utils/Analytics.ts'
import Sentry from '../../../../App/Utils/Sentry.ts'

import { scoreMutationThunks } from './scoreMutationThunks.ts'

const exportPdf = (score: MSScoreT, pdfFilePath: string) => {
    return async () => {
        try {
            xtz.exportPdf(pdfFilePath)

            try {
                reportEvent(MetricaEvents.SCORE_DOWNLOAD, {
                    ...getScoreMetaEvent(score),
                    'params.key': ['export_type'],
                    'params.str_value': ['pdf'],
                    'params.value': [0],
                })
            } catch {
                // Analytics must not fail the export (e.g. "User did not share").
            }
        } catch (e) {
            Sentry.sendMessage('exportPdf', e)
            presentAlert({
                rawTitle: translate('native.alerts.error_title'),
                rawMessage: translate('native.alerts.download_failed'),
            })
        }
    }
}

/**
 * MUP-14079: on iOS, xtz.exportPdf leaves the on-screen view blank when the
 * score is displayed in Single Line — the engine repaginates for the PDF and
 * never restores the horizontal layout (Android re-binds its surface, so it
 * recovers on its own). Re-applying the same scroll mode is a no-op for the
 * engine, and toggling within one tick gets coalesced, so bounce through
 * another mode and restore the real one on the next tick. Remove once the
 * engine restores the pre-export layout itself (XTC).
 */
const restoreLayoutAfterExport = () => {
    return (dispatch: DispatchFun, getState: GetStateFun) => {
        if (!platform.isIos) return

        const state = getState()
        // The offscreen exporter (Score Info) tears the engine down right after
        // the export — nothing to restore there.
        if (scoreStoreChunk.props.getPendingPdfExport(state)) return

        const pageLayoutType = scoreStoreChunk.props.getPageLayoutType(state)
        if (pageLayoutType !== 'single-line') return

        xtz.setScrollMode(TScrollMode.VERTICAL)
        setTimeout(() => dispatch(scoreMutationThunks.setPageLayoutType(pageLayoutType)), 300)
    }
}

const onPdfExported = (path: string, success: boolean) => {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        try {
            if (!success) return

            dispatch(restoreLayoutAfterExport())

            const score = scoreStoreChunk.props.getCurrentScore(getState())
            if (!score) return

            const { title } = score
            const type = 'application/pdf'
            const fileUrl = `file://${path}`

            if (platform.isAndroid) {
                const { SaveDocumentModule } = NativeModules
                await SaveDocumentModule.saveDocuments([fileUrl])
                return
            }

            // Для того, чтобы появилось модальное окно с возможностью поделиться в соц сетях
            // необходимо конвертировать в base64 файл
            const base64 = await RNFS.readFile(fileUrl, 'base64')
            const filename = `${title.replaceAll('/', '')}.pdf`

            if (base64) {
                const options = {
                    url: `data:${type};base64,${base64}`,
                    type,
                    title,
                    filename,
                    failOnCancel: false,
                    showAppsToView: true,
                }

                setTimeout(() => {
                    RNShare.open(options)
                }, 500)
            }
        } catch (error: any) {
            if (error?.code === 'CANCELLED') return
            Sentry.sendMessage(
                'xtz',
                new Error('[xtz] error print', { cause: error?.message ?? '' }),
            )
        }
    }
}

export const exportPdfThunks = {
    exportPdf,
    onPdfExported,
}
