import { useRef } from 'react'
import { Platform, View } from 'react-native'
import { PdfViewer, type NativeZoomablePdfScrollViewRef } from 'react-native-pdf-light'

import { platform } from '@mu-native/common'
import { globalStyles, staticSafeArea } from '@mu-native/ds'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { scoreStoreChunk, TScoreSourceFile } from '@mu-native/score'
import { useIsLandscape } from '@mu-native/system'
import { useActions, useValues } from '@ug/store'
import type { PagingPdfLoadCompleteEvent } from 'react-native-pdf-light/src/NativePagingPdfView'

import { getScoreMetaEvent } from '../../../../../App/constants/scoreAnalytic.ts'
import reportEvent from '../../../../../App/Utils/Analytics.ts'
import { useCurrentScore } from '../hooks/useCurrentScore.ts'

type Props = {
    source: TScoreSourceFile
}

export const PdfScoreViewerContainer = ({ source }: Props) => {
    const score = useCurrentScore()
    const [pageLayoutType, isFullscreen, pdfAnnotations, arePdfAnnotationsReady] = useValues([
        scoreStoreChunk.props.getPageLayoutType,
        scoreStoreChunk.props.getIsFullScreen,
        scoreStoreChunk.props.getPdfAnnotations,
        scoreStoreChunk.props.getArePdfAnnotationsReady,
    ])
    const actions = useActions({
        setIsFullscreen: scoreStoreChunk.actions.setIsFullScreen,
        setPage: scoreStoreChunk.actions.setCurrentPage,
        setIsLoaded: scoreStoreChunk.actions.setIsSuccessLoading,
    })
    const ref = useRef<NativeZoomablePdfScrollViewRef>(null)

    const onMiddleTap = () => {
        actions.setIsFullscreen(!isFullscreen)
        reportEvent(RT_EVENTS.SCORE_FULLSCREEN_CLICK, getScoreMetaEvent(score))
    }

    const onLoaded = (_event: PagingPdfLoadCompleteEvent) => {
        // Android renders annotations via DrawingOverlayView (loadAnnotations
        // imperatively) to avoid the bitmap-letterbox mismatch seen when
        // baking into the page bitmap. iOS keeps the bake path via the
        // `annotations` prop.
        if (Platform.OS === 'android' && pdfAnnotations && pdfAnnotations.length > 0) {
            ref.current?.loadAnnotations(pdfAnnotations)
        }
        actions.setIsLoaded(true)
    }

    const isLandscape = useIsLandscape()
    const usePaging = pageLayoutType === 'horizontal' && (!platform.isAndroid || platform.isTablet)
    const topMargin = staticSafeArea().top + (isLandscape ? 0 : 56)
    return (
        <View style={globalStyles.flex1}>
            {arePdfAnnotationsReady && (
                <PdfViewer
                    ref={ref}
                    viewerType={usePaging ? 'paging' : 'zoomable'}
                    source={source.uri}
                    style={globalStyles.flex1}
                    minZoom={1}
                    maxZoom={2}
                    backgroundColor="#ffffff"
                    edgeTapZone={30}
                    annotations={Platform.OS === 'ios' ? (pdfAnnotations ?? undefined) : undefined}
                    pdfPaddingTop={topMargin}
                    pdfPaddingBottom={isFullscreen ? 0 : 200}
                    onLoadComplete={onLoaded}
                    onMiddleClick={onMiddleTap}
                />
            )}
        </View>
    )
}
