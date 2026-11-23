import { memo, useEffect, useState } from 'react'

import { authStoreChunk, getIsAuthorized } from '@mu-native/auth'
import { getStoreValue } from '@mu-native/common'
import { MuseButton } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { getSaleSubscriptions } from '@mu-native/marketing'
import { Screen, useAppNavigation } from '@mu-native/navigation'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../../../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../../../../App/Utils/Analytics'
import { useEbookPaywall } from '../../hooks/useEbookPaywall'
import { useDigitalEbookDetailsChunk } from '../../stores/DigitalEbookDetailsStore'

export const DigitalEbookGetSongBookButton = memo(() => {
    const navigation = useAppNavigation()
    const chunk = useDigitalEbookDetailsChunk()
    const [subscriptions] = useValues([getSaleSubscriptions])
    const { presentPaywall, isFullAccess } = useEbookPaywall()

    if (!isFullAccess && !subscriptions.length) return null

    return (
        <MuseButton
            title={translate(isFullAccess ? 'native.ebooks.read' : 'native.ebooks.get_songbook')}
            onPress={() => {
                const ebook = getStoreValue(chunk.props.getEbook)
                if (isFullAccess) {
                    reportEvent(MetricaEvents.SONGBOOK_READ_CLICK, {
                        screen: Screen.ebookDetails,
                        songbook_id: ebook.id,
                    })
                    navigation.navigate(Screen.ebookWebView, { ebookId: ebook.id, isFullAccess })
                } else {
                    reportEvent(MetricaEvents.SONGBOOK_GET_CLICK, {
                        screen: Screen.ebookDetails,
                        songbook_id: ebook.id,
                    })
                    presentPaywall()
                }
            }}
        />
    )
})

export const DigitalEbookGetFreeSongBookButton = memo(() => {
    const { presentPaywall, isHasCredit } = useEbookPaywall()
    const actions = useActions({
        setIsVisible: authStoreChunk.actions.setIsVisible,
    })
    const [isLoading, setIsLoading] = useState(false)
    const [isAuth] = useValues([getIsAuthorized])

    const onGetEbook = async () => {
        reportEvent('Temp Checklist Prize Click')

        if (!isAuth) {
            actions.setIsVisible(true)
            return
        }

        setIsLoading(true)
        await presentPaywall()
        setIsLoading(false)
    }

    useEffect(() => {
        if (isHasCredit) {
            reportEvent('Temp Checklist Prize Show')
        }
    }, [isHasCredit])

    if (!isHasCredit) return null

    return (
        <MuseButton
            isLoading={isLoading}
            title={translate('native.getFreeSongBook')}
            onPress={onGetEbook}
        />
    )
})
