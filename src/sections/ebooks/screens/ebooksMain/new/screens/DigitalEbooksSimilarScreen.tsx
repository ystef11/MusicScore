import { useCallback, useEffect } from 'react'

import { BrandAppLoader } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { Screen, useAppNavigation, useNavHeader } from '@mu-native/navigation'
import { useActions, useValues } from '@ug/store'

import { digitalEbooksThunk } from '../api/digitalEbooksThunk.ts'
import { DigitalEbooksSimpleListView } from '../components/favorites/DigitalEbooksSimpleListView.tsx'
import { useDigitalEbooksSimilarChunk } from '../stores/DigitalEbooksSimilarStore.ts'

export const DigitalEbooksSimilarScreen = () => {
    useNavHeader(translate('native.ebooks.you_may_also_like'))
    const navigation = useAppNavigation()
    const chunk = useDigitalEbooksSimilarChunk()
    const actions = useActions({ fetchSimilar: digitalEbooksThunk.fetchSimilar })
    const [state, isFetchingMore] = useValues([chunk.props.getState, chunk.props.getIsFetchingMore])

    useEffect(() => {
        actions.fetchSimilar(chunk)
    }, [actions, chunk])

    const onEndReached = useCallback(() => {
        actions.fetchSimilar(chunk)
    }, [actions, chunk])

    if (state.type === 'initialLoading') {
        return <BrandAppLoader />
    }

    if (state.type === 'error') {
        navigation.goBack()
        return <BrandAppLoader />
    }

    return (
        <DigitalEbooksSimpleListView
            emptyTitle={translate('native.ebooks.favorites_empty_title')}
            emptySubtitle={translate('native.ebooks.favorites_empty_subtitle')}
            isFavorite={false}
            onEndReached={onEndReached}
            isFetchingMore={isFetchingMore}
            ebooks={state.data}
            screen={Screen.ebooksSimilarScreen}
        />
    )
}
