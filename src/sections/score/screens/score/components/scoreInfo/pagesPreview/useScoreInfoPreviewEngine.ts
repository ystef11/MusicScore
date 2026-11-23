import { useCallback, useEffect, useRef, useState } from 'react'

import { TFitMode, TScrollMode } from '@mu-native/score'
import { getDefaultStyle, metaStatus, TMeta, xtz } from '@mu-native/xtz'

import { deleteCachedScoreFile } from '../../../../../../../App/Services/ScoreInfoProvider'
import Sentry from '../../../../../../../App/Utils/Sentry'

const format = 'MUSESCORE_ANY' as const

export const PREVIEW_PAGES_COUNT = 5

/** 0 = engine hasn't reported a count yet; its page-set event corrects us later. */
const previewPages = (total: number) =>
    Number.isFinite(total) ? Math.min(total, PREVIEW_PAGES_COUNT) : 0

/**
 * Opens a score in the XTZ engine for the preview and tracks its paging while
 * `active` holds the engine slot. Playback, cursor, camera and soundfont are all
 * off — the preview only renders and pages.
 */
export const useScoreInfoPreviewEngine = (
    uri: string | null,
    active: boolean,
    pagesCount: number,
) => {
    const [isLoaded, setIsLoaded] = useState(false)
    const [pages, setPages] = useState({ current: 0, total: previewPages(pagesCount) })
    // Read through a ref so turnPage stays stable — the gesture handlers holding
    // it are attached to the native view once.
    const pagesRef = useRef(pages)
    pagesRef.current = pages

    useEffect(() => {
        if (!active || !uri) return undefined
        // Teardown can free the native surface before a queued event callback
        // runs, and calling in then segfaults the engine's render thread.
        let disposed = false
        // The engine engraves from the viewport it still holds from the previous
        // session, then reports the size that actually fits this view. When that
        // correction lands after the score is already engraved, the page stays at
        // the wrong scale — re-open so it engraves against the current viewport.
        let hasLoaded = false
        let hasReopened = false
        let lastNoteSize = 0

        // The engine re-shows the play head as it lays the score out, so hiding
        // it once on load isn't enough — the preview never wants one.
        const hidePlayHead = () => {
            if (!disposed) xtz.setPlayHeadVisible(false)
        }

        const unsubscribeLayout = xtz.addListenerOnLayoutDidHappen(hidePlayHead)
        const unsubscribeNoteSize = xtz.addListenerOnNoteSizeSet(noteSize => {
            if (disposed) return
            const corrected = hasLoaded && lastNoteSize !== 0 && noteSize !== lastNoteSize
            lastNoteSize = noteSize
            if (!corrected || hasReopened) return
            hasReopened = true
            openScore()
        })

        const unsubscribeLoaded = xtz.addListenerOnLoaded(
            ({ data: meta, status }: { data: TMeta; status: number }) => {
                if (disposed) return
                if (status !== metaStatus.noError) {
                    Sentry.sendMessage(
                        'ScoreInfoPagesPreview.open',
                        new Error('FAILED_OPEN_SCORE_FOR_PREVIEW', { cause: status }),
                    )
                    // Same as Score Play: a file the engine can't open is most
                    // likely a corrupted download, so drop it and let the next
                    // open fetch it again. Only touches the cache directory —
                    // offline scores are left alone.
                    deleteCachedScoreFile(scoreUri)
                    return
                }
                // A pinch in Score Play zooms the engine camera, which is neither
                // note size nor view state: it survives clearScore + open and the
                // preview would inherit it. Put the camera back.
                xtz.moveCameraToDefaultZ()
                hasLoaded = true
                hidePlayHead()
                setPages(prev => ({
                    current: 0,
                    total: previewPages(meta.totalPages) || prev.total,
                }))
                setIsLoaded(true)
            },
        )
        const unsubscribePageSet = xtz.addListenerOnPageSetChanged(({ current, total }) => {
            if (disposed) return
            const capped = previewPages(total)
            // The engine counts every page of the score, the preview only its
            // first few. A page past that window would be stored as a position
            // `turnPage` can leave in neither direction, so send the engine back
            // into the window instead of recording where it actually is.
            if (capped && current >= capped) {
                xtz.setPage(0)
                return
            }
            setPages({ current, total: capped })
        })

        const scoreUri = uri
        async function openScore() {
            const notationStylePath = await getDefaultStyle()
            if (disposed) return
            xtz.open(scoreUri, format, {
                needDecrypted: true,
                practiceMode: false,
                showTitle: true,
                pageBreaksEnabled: true,
                notationStylePath,
                scrollMode: TScrollMode.PAGE,
                // ORIGINAL scales the score's own page geometry into the box, so a
                // page matches the static preview image. FIT_SCREEN re-engraves it
                // and would need a noteSize override to stay legible here.
                fitMode: TFitMode.ORIGINAL,
                margins: { top: 8, bottom: 8, left: 8, right: 8 },
                playHeadParams: {
                    style: 'simple',
                    allowMove: false,
                    widthToNoteSizeRatioDefault: 0,
                    widthToNoteSizeRatioIfPressed: 0,
                    shouldSetPositionOnTouch: false,
                },
                cameraParams: { allowMove: false, userInputPostponeSeconds: 0 },
                resetLoopOnOutOfRegionClick: false,
            })
        }

        openScore()

        return () => {
            disposed = true
            unsubscribeNoteSize?.()
            unsubscribeLayout?.()
            unsubscribeLoaded?.()
            unsubscribePageSet?.()
            setIsLoaded(false)
            // The count survives releasing the slot (Score Play, PDF export);
            // only the position goes back to the first page.
            setPages(prev => ({ current: 0, total: prev.total }))
            xtz.clearScore()
        }
    }, [active, uri])

    const turnPage = useCallback((delta: number) => {
        const { current, total } = pagesRef.current
        const next = current + delta
        if (next < 0 || next >= (total || PREVIEW_PAGES_COUNT)) return
        xtz.setPage(next)
    }, [])

    return { isLoaded, pages, turnPage }
}
