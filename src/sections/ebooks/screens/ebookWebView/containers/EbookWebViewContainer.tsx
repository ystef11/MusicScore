import { useEffect } from 'react'

import { Screen, useAppRoute } from '@mu-native/navigation'
import { useValues, useActions } from '@ug/store'

import MetricaEvents from '../../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../../App/Utils/Analytics'
import { ebookWebViewScreenStoreChunk } from '../store/ebookWebViewScreenStoreChunk'
import { getEbookPreviewThunk } from '../store/ebookWebViewScreenThunkActions'

import EbookWebViewComponent from './components/EbookWebVIewComponent'

export const EbookWebViewContainer = () => {
    const { ebookId, isFullAccess } = useAppRoute<{ ebookId: string; isFullAccess: boolean }>()

    const actions = useActions({
        getEbookPreviewThunk,
    })
    const [ebookUrl] = useValues([ebookWebViewScreenStoreChunk.props.getEbookUrl])

    useEffect(() => {
        if (ebookId) actions.getEbookPreviewThunk({ id: ebookId, isFullAccess })
        return () => {
            reportEvent(MetricaEvents.SONGBOOK_READER_CLOSE_CLICK, {
                screen: Screen.ebookWebView,
                songbook_id: ebookId,
            })
        }
    }, [])

    return <EbookWebViewComponent isFullAccess={isFullAccess} ebookUrl={ebookUrl} />
}
