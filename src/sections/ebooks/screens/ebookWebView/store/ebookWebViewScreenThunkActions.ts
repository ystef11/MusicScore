import { TThunkAction } from '@mu-native/common'
import { translate } from '@mu-native/locale'

import { showAlertNotification } from '../../../../../App/Elements/NewAlertNotifications'
import reportEvent from '../../../../../App/Utils/Analytics'
import { ebookContentService } from '../services/ebookWebViewService'

import { ebookWebViewScreenStoreChunk } from './ebookWebViewScreenStoreChunk'

const getEbookPreviewThunk: TThunkAction<{ id: string; isFullAccess: boolean }> =
    ({ id, isFullAccess }) =>
    async (dispatch: any) => {
        try {
            dispatch(ebookWebViewScreenStoreChunk.actions.setIsLoading(true))

            const ebookPreview = await ebookContentService({ id, isFullAccess })

            dispatch(ebookWebViewScreenStoreChunk.actions.setEbookUrl(ebookPreview.url))
        } catch (error: any) {
            showAlertNotification({
                expiresIn: 5000,
                text: error?.message || translate('native.new_search.not_found'),
            })

            reportEvent('getCurrentEbookThunkError', error)
        } finally {
            dispatch(ebookWebViewScreenStoreChunk.actions.setIsLoading(false))
        }
    }

export { getEbookPreviewThunk }
