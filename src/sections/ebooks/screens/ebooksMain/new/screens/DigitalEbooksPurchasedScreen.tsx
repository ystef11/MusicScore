import { useEffect } from 'react'

import { BrandAppLoader } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { Screen, useAppNavigation, useNavHeader } from '@mu-native/navigation'
import { useActions, useValues } from '@ug/store'

import { digitalEbooksThunk } from '../api/digitalEbooksThunk.ts'
import { DigitalEbooksSimpleListView } from '../components/favorites/DigitalEbooksSimpleListView.tsx'
import { useDigitalEbookPurchasedChunk } from '../stores/DigitalEbookPurchasedStore.ts'

export const DigitalEbooksPurchasedScreen = () => {
    const navigation = useAppNavigation()
    useNavHeader(translate('native.ebooks.favorites_title'))
    const chunk = useDigitalEbookPurchasedChunk()

    const [state] = useValues([chunk.props.getState])
    const actions = useActions({ fetchInitial: digitalEbooksThunk.fetchPurchased })

    useEffect(() => {
        return navigation.addListener('focus', () => {
            actions.fetchInitial(chunk)
        })
    }, [actions, chunk, navigation])

    if (state.type === 'initialLoading') {
        return <BrandAppLoader />
    }

    if (state.type === 'ebooks') {
        return (
            <DigitalEbooksSimpleListView
                emptyTitle={translate('native.ebooks.orders_empty_title')}
                emptySubtitle={translate('native.ebooks.orders_empty_subtitle')}
                isFavorite={false}
                ebooks={state.data}
                screen={Screen.ebooksPurchasedScreen}
            />
        )
    }

    if (state.type === 'error') {
        navigation.goBack()
        return null
    }

    return null
}
