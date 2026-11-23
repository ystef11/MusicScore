import { memo, useCallback } from 'react'

import { getStoreValue } from '@mu-native/common'
import { globalStyles, MuseButton } from '@mu-native/ds'
import { document as documentIcon } from '@mu-native/icons/document'
import { translate } from '@mu-native/locale'
import { Screen, useAppNavigation } from '@mu-native/navigation'

import MetricaEvents from '../../../../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../../../../App/Utils/Analytics'
import { useEbookPaywall } from '../../hooks/useEbookPaywall'
import { useDigitalEbookDetailsChunk } from '../../stores/DigitalEbookDetailsStore'

export const DigitalEbookDetailsSampleButton = memo(() => {
    const navigation = useAppNavigation()
    const chunk = useDigitalEbookDetailsChunk()
    const { isFullAccess } = useEbookPaywall()
    const onPress = useCallback(() => {
        reportEvent(MetricaEvents.SONGBOOK_SAMPLE_CLICK, {
            screen: Screen.ebookDetails,
            songbook_id: getStoreValue(chunk.props.getEbookId),
        })
        const isFullAccess = getStoreValue(chunk.props.getHasFullAccess)
        const ebook = getStoreValue(chunk.props.getEbook)
        navigation.navigate(Screen.ebookWebView, { ebookId: ebook.id, isFullAccess })
    }, [chunk])

    if (isFullAccess) return null

    return (
        <MuseButton
            type="secondary"
            startIcon={documentIcon}
            title={translate('native.ebooks.sample')}
            style={globalStyles.flex1}
            onPress={onPress}
        />
    )
})
