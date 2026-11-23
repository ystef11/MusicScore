import { memo, useEffect, useRef } from 'react'
import { Alert, Platform, StyleSheet, View } from 'react-native'

import { scoreTestIds } from '@mu/mu-mobile-test-id'
import {
    MuseButton,
    NativeBottomSheet,
    NativeBottomSheetRef,
    SheetTitle,
    useAppSafeArea,
} from '@mu-native/ds'
import { getCurrentLocaleCode, translate } from '@mu-native/locale'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { scoreStoreChunk } from '@mu-native/score'
import { useActions, useValues } from '@ug/store'
import { getScoreMetaEvent } from '../../../../../../App/constants/scoreAnalytic'
import type { MSScoreT } from '../../../../../../App/Model/MSScore'
import {
    exportToMIDI,
    exportToMP3,
    exportToOfflineArchive,
    exportToPDF,
} from '../../../../../../App/Controllers/ScoreActionsController'
import { usesWebScoreCache } from '../../../../../../App/Services/WebScoreProvider'
import reportEvent from '../../../../../../App/Utils/Analytics'

export const DownloadScoreSheet = memo(
    ({
        maxWidth,
        centerOnTablet,
        offscreenExport,
        score,
        viewerPath,
    }: {
        maxWidth?: number
        centerOnTablet?: boolean
        offscreenExport?: boolean
        score: MSScoreT
        viewerPath?: string
    }) => {
        const sheetRef = useRef<NativeBottomSheetRef>(null)
        const pendingExport = useRef<(() => Promise<unknown>) | null>(null)

        const dismissForExport = (run: () => Promise<unknown>) => {
            if (!sheetRef.current || pendingExport.current) return
            pendingExport.current = run
            sheetRef.current.dismiss()
        }

        const onDismiss = async () => {
            const run = pendingExport.current
            pendingExport.current = null
            try {
                await run?.()
            } catch {
                Alert.alert(translate('native.alerts.error_title'), translate('native.alerts.download_failed'))
            }
        }

        return (
            <NativeBottomSheet
                ref={sheetRef}
                name="downloadScoreSheet"
                maxWidth={maxWidth}
                centerOnTablet={centerOnTablet}
                onDismiss={onDismiss}
            >
                <DownloadModalComponent
                    score={score}
                    viewerPath={viewerPath}
                    dismissForExport={dismissForExport}
                    offscreenExport={offscreenExport}
                />
            </NativeBottomSheet>
        )
    },
)

const DownloadModalComponent = ({
    score,
    viewerPath,
    dismissForExport,
    offscreenExport,
}: {
    score: MSScoreT
    viewerPath?: string
    dismissForExport: (run: () => Promise<unknown>) => void
    offscreenExport?: boolean
}) => {
    const insets = useAppSafeArea({ bottom: 16 })
    const [checkingPDFRestriction] = useValues([
        scoreStoreChunk.props.getCheckingPDFExportRestriction,
    ])
    const actions = useActions({
        exportPDF: exportToPDF,
        exportMIDI: exportToMIDI,
        exportMP3: exportToMP3,
    })

    const onDownload = (format: 'pdf' | 'midi' | 'audio' | 'offline_archive', run: () => Promise<unknown>) => {
        reportEvent(RT_EVENTS.SCORE_DOWNLOAD_CLICK, {
            ...getScoreMetaEvent(score),
            'params.key': ['export_type', 'placement'],
            'params.str_value': [format, 'score'],
            'params.value': [0, 0],
        })
        dismissForExport(run)
    }

    useEffect(() => {
        reportEvent(RT_EVENTS.SCORE_DOWNLOAD_SHOW, getScoreMetaEvent(score))
    }, [])

    return (
        <>
            <View testID={scoreTestIds.scoreDetailsDownloadSheetTitle}>
                <SheetTitle
                    title={translate('native.score_details_sheet.download_title')}
                    subtitle={translate('native.score_details_sheet.download_description')}
                />
            </View>

            <View style={[styles.buttonsWrapper, { paddingBottom: insets.bottom }]}>
                <MuseButton
                    isLoading={checkingPDFRestriction}
                    title="PDF"
                    type="primary"
                    style={styles.button}
                    onPress={() => onDownload('pdf', () => actions.exportPDF(score, offscreenExport, viewerPath))}
                    testID={scoreTestIds.scoreDetailsDownloadPdfButton}
                />
                {!score.isPdf && (
                    <MuseButton
                        title="MIDI"
                        type="secondary"
                        style={styles.button}
                        onPress={() => onDownload('midi', () => actions.exportMIDI(score, viewerPath))}
                        testID={scoreTestIds.scoreDetailsDownloadMidiButton}
                    />
                )}
                {usesWebScoreCache(score) && (
                    <MuseButton
                        title="Audio"
                        type="secondary"
                        style={styles.button}
                        onPress={() => onDownload('audio', () => actions.exportMP3(score, viewerPath))}
                    />
                )}
                {Platform.OS === 'android' && (
                    <MuseButton
                        title={getCurrentLocaleCode() === 'ru' ? 'Офлайн-архив (ZIP)' : 'Offline archive (ZIP)'}
                        type="secondary"
                        style={styles.button}
                        onPress={() => onDownload('offline_archive', () => exportToOfflineArchive(score, viewerPath))}
                        testID="scoreDetailsDownloadOfflineArchiveButton"
                    />
                )}
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    buttonsWrapper: {
        paddingHorizontal: 16,
        marginTop: 16,
        width: '100%',
    },
    button: {
        width: '100%',
        justifyContent: 'center',
        marginVertical: 4,
    },
})
