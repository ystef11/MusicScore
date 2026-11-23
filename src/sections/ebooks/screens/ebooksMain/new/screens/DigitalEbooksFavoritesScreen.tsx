import { useCallback, useEffect } from 'react'

import { libraryTestIds } from '@mu/mu-mobile-test-id'
import { BaseEmptyStateView, BrandAppLoader } from '@mu-native/ds'
import { brokenHeart } from '@mu-native/icons/brokenHeart'
import { translate } from '@mu-native/locale'
import { Screen, useAppNavigation, useNavHeader } from '@mu-native/navigation'
import { ensureNetwork } from '@mu-native/system'
import { useActions, useValues } from '@ug/store'

import { digitalEbooksThunk } from '../api/digitalEbooksThunk.ts'
import { DigitalBooksFavoritesSearchView } from '../components/favorites/DigitalBooksFavoritesSearchView'
import { DigitalEbooksFavoritesSearchEmptyView } from '../components/favorites/DigitalEbooksFavoritesSearchEmptyView'
import { DigitalEbooksSimpleListView } from '../components/favorites/DigitalEbooksSimpleListView.tsx'
import { useDigitalEbookFavoritesChunk } from '../stores/DigitalEbookFavoritesStore'

export const DigitalEbooksFavoritesScreen = () => {
    const navigation = useAppNavigation()
    useNavHeader(
        translate('native.ebooks.favorites_title'),
        false,
        libraryTestIds.navigation.ebooksBack,
        true,
    )
    const chunk = useDigitalEbookFavoritesChunk()

    const [state, isFetchingMore] = useValues([chunk.props.getState, chunk.props.getIsLoadingMore])
    const actions = useActions({
        fetchInitial: digitalEbooksThunk.fetchFavorites,
        fetchMoreFavorites: digitalEbooksThunk.fetchMoreFavorites,
        removeBookFromFavorite: digitalEbooksThunk.removeBookFromFavorite,
        removeItem: chunk.actions.removeItem,
    })

    useEffect(() => {
        return navigation.addListener('focus', () => {
            actions.fetchInitial(chunk)
        })
    }, [actions, chunk, navigation])

    const onFetchMore = useCallback(() => {
        console.log('[DigitalEbooksFavoritesScreen.onFetchMore]')
        actions.fetchMoreFavorites(chunk)
    }, [actions, chunk])

    const onRemoveFromFavoritePress = useCallback(
        async (id: string) => {
            await ensureNetwork(true)
            // navigation.push(Screen.ebookDetailsStack, { id: item.id })
            actions.removeItem(id)
            actions.removeBookFromFavorite(id)
        },
        [actions],
    )

    const Header = <DigitalBooksFavoritesSearchView />

    if (state.type === 'initialLoading') {
        return (
            <>
                {Header}
                <BrandAppLoader />
            </>
        )
    }

    if (state.type === 'empty') {
        return (
            <BaseEmptyStateView
                title={translate('native.favorite_songbooks.empty_title')}
                description={translate('native.favorite_songbooks.empty_description')}
                icon={brokenHeart}
            />
        )
    }

    if (state.type === 'emptySearch') {
        return (
            <>
                {Header}
                <DigitalEbooksFavoritesSearchEmptyView />
            </>
        )
    }

    if (state.type === 'ebooks') {
        return (
            <>
                {Header}
                <DigitalEbooksSimpleListView
                    emptyTitle={translate('native.ebooks.favorites_empty_title')}
                    emptySubtitle={translate('native.ebooks.favorites_empty_subtitle')}
                    isFavorite
                    ebooks={state.data}
                    isFetchingMore={isFetchingMore}
                    onEndReached={onFetchMore}
                    screen={Screen.ebooksSimilarScreen}
                    onRemoveFromFavoritePress={onRemoveFromFavoritePress}
                />
            </>
        )
    }

    return null
}
