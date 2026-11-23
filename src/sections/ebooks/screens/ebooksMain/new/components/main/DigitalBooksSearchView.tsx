import React, { memo, useCallback, useRef, useState } from 'react'
import { StyleProp, ViewStyle } from 'react-native'

import { getStoreValue } from '@mu-native/common'
import { NativeBottomSheet, NativeBottomSheetRef } from '@mu-native/ds'
import { useActions, useValues } from '@ug/store'

import NavHeaderSearchBar from '../../../../../../../App/Components/NavHeader/headerSearchBar/NavHeaderSearchBar'
import { digitalEbooksThunk } from '../../api/digitalEbooksThunk.ts'
import { digitalEbooksStore } from '../../stores/DigitalEbooksStore'

import { DigitalEbooksFiltersView } from './DigitalEbooksFiltersView'
import { DigitalEbooksSuggestionsList } from './DigitalEbooksSuggestionsList.tsx'

type TProps = {
    /** Overrides the search bar container style (e.g. tighter top padding). */
    searchBarStyle?: StyleProp<ViewStyle>
}

export const DigitalBooksSearchView: React.FC<TProps> = memo(({ searchBarStyle }) => {
    const searchBarHeight = useRef(0)
    const [isFocused, setFocused] = useState(false)
    const sheetRef = useRef<NativeBottomSheetRef>(null)
    const [hasAnySelectedFilter, isSearching, searchText] = useValues([
        digitalEbooksStore.props.getHasAnySelectedFilter,
        digitalEbooksStore.props.getIsSearching,
        digitalEbooksStore.props.getSearchText,
    ])
    const actions = useActions({
        setSearchText: digitalEbooksStore.actions.setSearchText,
        clearSearchText: digitalEbooksStore.actions.clearSearch,
        searchEbooks: digitalEbooksThunk.searchEbooks,
        resetPagination: digitalEbooksStore.actions.resetPagination,
        clearFilters: digitalEbooksStore.actions.clearFilters,
        fetchFilters: digitalEbooksThunk.fetchInitialFilters,
    })

    const onOpenFilters = useCallback(() => {
        sheetRef.current?.present()
    }, [])

    const onCloseFilters = useCallback(() => {
        sheetRef.current?.dismiss()
    }, [])

    const onSearch = useCallback(
        (closeSheet = true) => {
            actions.resetPagination()
            if (!getStoreValue(digitalEbooksStore.props.getSearchText)) {
                actions.clearSearchText()
                actions.clearFilters()
            } else {
                actions.searchEbooks()
            }
            if (closeSheet) sheetRef.current?.dismiss()
        },
        [actions],
    )

    const onFiltersSearch = useCallback(() => {
        actions.resetPagination()
        actions.searchEbooks()
        sheetRef.current?.dismiss()
    }, [actions])

    const onClear = useCallback(() => {
        if (getStoreValue(digitalEbooksStore.props.getHasAnySelectedFilter)) {
            actions.setSearchText('')
            onSearch()
            return
        }
        actions.clearSearchText()
        sheetRef.current?.dismiss()
    }, [actions, onSearch])

    const onClearFilters = useCallback(async () => {
        await actions.fetchFilters(false)
        actions.resetPagination()
        actions.searchEbooks()
    }, [actions])

    const onSearchFocus = useCallback(() => setFocused(true), [])
    const onSearchBlur = useCallback(() => setFocused(false), [])

    return (
        <>
            <NavHeaderSearchBar
                testID="Ebooks search"
                style={searchBarStyle}
                searchTerm={searchText}
                openFilterScreen={onOpenFilters}
                isSearching={isSearching}
                moduleKey="ebooks"
                isFilterWasOpen={!hasAnySelectedFilter}
                onChangeText={actions.setSearchText}
                clearInputValue={onClear}
                onSubmitEditing={onSearch}
                onSearchFocus={onSearchFocus}
                onSearchBlur={onSearchBlur}
                onLayout={e => {
                    searchBarHeight.current = e.nativeEvent.layout.height + e.nativeEvent.layout.y
                }}
            />

            {isFocused && (
                <DigitalEbooksSuggestionsList onSearch={onSearch} top={searchBarHeight.current} />
            )}
            <NativeBottomSheet ref={sheetRef}>
                <DigitalEbooksFiltersView
                    onClear={onClearFilters}
                    onSearch={onFiltersSearch}
                    onDismiss={onCloseFilters}
                />
            </NativeBottomSheet>
        </>
    )
})
