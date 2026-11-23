import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { presentAlert } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { scoreStoreChunk, scoreThunks } from '@mu-native/score'
import { getDefaultStyle, metaStatus, TMeta, xtz, XtzView } from '@mu-native/xtz'
import { useActions, useValues } from '@ug/store'

import { getLocalFileUrl } from '../../../../../../App/Score/scoreActionsAsync'
import Sentry from '../../../../../../App/Utils/Sentry'

const format = 'MUSESCORE_ANY' as const

/**
 * Offscreen, on-demand PDF exporter for the Score Info screen (MUP-13932).
 *
 * Score Info keeps no XTZ engine mounted, and the server /score/download
 * endpoint forbids PDF for official scores (403). So when the user downloads
 * an interactive score as PDF here, a pending request is placed in the store;
 * this component then transiently mounts a hidden XTZ view, opens the score,
 * renders the PDF via xtz.exportPdf, shares it, and tears the engine back down.
 * Mirrors the local render the old score screen relied on.
 */
export const ScoreInfoPdfExporter = memo(() => {
    const [pending, scoreSettingsMap] = useValues([
        scoreStoreChunk.props.getPendingPdfExport,
        scoreStoreChunk.props.getScoreSettingsMap,
    ])
    const actions = useActions({
        setPendingPdfExport: scoreStoreChunk.actions.setPendingPdfExport,
        openScore: scoreThunks.openScore,
        onPdfExported: scoreThunks.onPdfExported,
    })

    const [uri, setUri] = useState<string | null>(null)
    // Guard against acting twice if XTZ emits several load events.
    const hasExportedRef = useRef(false)

    const finish = useCallback(() => {
        hasExportedRef.current = false
        setUri(null)
        xtz.clearScore()
        actions.setPendingPdfExport(null)
    }, [actions])

    // 1. Resolve the local (decrypted) score file for the pending request.
    useEffect(() => {
        if (!pending) {
            setUri(null)
            return undefined
        }
        let cancelled = false
        ;(async () => {
            try {
                const isOffline = await actions.openScore(pending.score)
                const fileUrl = await getLocalFileUrl(
                    pending.score,
                    isOffline as unknown as boolean,
                )
                if (cancelled) return
                if (!fileUrl) throw new Error('Local score file URL is null')
                setUri(fileUrl)
            } catch (e) {
                Sentry.sendMessage('ScoreInfoPdfExporter.resolveUri', e)
                presentAlert({
                    rawTitle: translate('native.alerts.error_title'),
                    rawMessage: translate('native.alerts.download_failed'),
                })
                finish()
            }
        })()
        return () => {
            cancelled = true
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pending])

    // 2. Open the score in the hidden engine; once it finishes laying out,
    //    render the PDF. The result (and share sheet) arrives via onPdfExported.
    useEffect(() => {
        if (!uri || !pending) return undefined

        const unsubscribeLoaded = xtz.addListenerOnLoaded(
            ({ status }: { data: TMeta; status: number }) => {
                if (hasExportedRef.current) return
                if (status !== metaStatus.noError) {
                    Sentry.sendMessage(
                        'ScoreInfoPdfExporter.open',
                        new Error('FAILED_OPEN_SCORE_FOR_EXPORT', { cause: status }),
                    )
                    presentAlert({
                        rawTitle: translate('native.alerts.error_title'),
                        rawMessage: translate('native.alerts.download_failed'),
                    })
                    finish()
                    return
                }
                hasExportedRef.current = true
                xtz.exportPdf(pending.filePath)
            },
        )

        const unsubscribeExported = xtz.addListenerOnPdfExported(({ path, success }) => {
            actions.onPdfExported(path, success)
            if (!success) {
                Sentry.sendMessage('ScoreInfoPdfExporter.export', new Error('FAILED_EXPORT_PDF'))
            }
            finish()
        })

        ;(async () => {
            const notationStylePath = await getDefaultStyle()
            xtz.open(uri, format, {
                needDecrypted: true,
                practiceMode: false,
                showTitle: true,
                pageBreaksEnabled: true,
                notationStylePath,
                // The player applies the saved settings after load (see
                // applySavedSettings); this engine is torn down right after the
                // export, so engrave it in the saved key from the start (MUP-14167).
                transpose: scoreSettingsMap[pending.score.id]?.transposeDiff ?? 0,
            })
        })()

        return () => {
            unsubscribeLoaded?.()
            unsubscribeExported?.()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uri])

    if (!uri) return null

    return (
        <View style={styles.offscreen} pointerEvents="none">
            <XtzView style={styles.xtz} />
        </View>
    )
})
ScoreInfoPdfExporter.displayName = 'ScoreInfoPdfExporter'

const styles = StyleSheet.create({
    // Full-size (so XTZ lays the score out for a correct PDF) but transparent
    // and behind the screen content, so it stays invisible to the user.
    offscreen: {
        ...StyleSheet.absoluteFill,
        opacity: 0,
        zIndex: -1,
    },
    xtz: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
})
