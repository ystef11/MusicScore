import React, { memo, useCallback } from 'react'

import { useActions, useValues } from '@ug/store'

import NavHeaderSearchBar from '../../../../../../../App/Components/NavHeader/headerSearchBar/NavHeaderSearchBar'
import { digitalEbooksThunk } from '../../api/digitalEbooksThunk.ts'
import { useDigitalEbookFavoritesChunk } from '../../stores/DigitalEbookFavoritesStore'

export const DigitalBooksFavoritesSearchView: React.FC = memo(() => {
    const chunk = useDigitalEbookFavoritesChunk()
    const [isSearching, searchText] = useValues([
        chunk.props.getIsSearching,
        chunk.props.getSearchText,
    ])
    const actions = useActions({
        setSearchText: chunk.actions.setSearchText,
        clearSearchText: chunk.actions.clearSearch,
        searchFavorites: digitalEbooksThunk.fetchFavorites,
    })

    const onSearch = useCallback(() => {
        actions.searchFavorites(chunk)
    }, [chunk, actions])

    const onClearPress = useCallback(() => {
        actions.clearSearchText()
        actions.searchFavorites(chunk)
    }, [actions, chunk])

    return (
        <NavHeaderSearchBar
            searchTerm={searchText}
            testID="Ebooks search"
            moduleKey="favorites_ebooks"
            isSearching={isSearching}
            onChangeText={actions.setSearchText}
            clearInputValue={onClearPress}
            onSubmitEditing={onSearch}
        />
    )
})
