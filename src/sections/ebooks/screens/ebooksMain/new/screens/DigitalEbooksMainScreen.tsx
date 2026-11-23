import { memo, useEffect } from 'react'
import { StyleProp, View, ViewStyle } from 'react-native'

import { ScrollableHeaderProvider, useScrollableHeader, BrandAppLoader } from '@mu-native/ds'
import { useActions, useValues } from '@ug/store'

import { digitalEbooksThunk } from '../api/digitalEbooksThunk.ts'
import { DigitalEbooksFeedListView } from '../components/DigitalEbooksFeedListView'
import { DigitalBooksSearchView } from '../components/main/DigitalBooksSearchView'
import { DigitalEbooksSearchListView } from '../components/search/DigitalEbooksSearchListView'
import { digitalEbooksStore } from '../stores/DigitalEbooksStore'

import { DigitalEbookSearchEmptyResult } from './DigitalEbookSearchEmptyResult'

const DigitalEbooksMainContent = memo(() => {
    const [uiData] = useValues([digitalEbooksStore.props.getUiListResult])
    const { contentPaddingTop } = useScrollableHeader()

    if (uiData.type === 'initialLoading' || uiData.type === 'searching') {
        return (
            <View style={{ flex: 1, paddingTop: contentPaddingTop }}>
                <BrandAppLoader />
            </View>
        )
    }

    if (uiData.type === 'feed') {
        return <DigitalEbooksFeedListView contentPaddingTop={contentPaddingTop} />
    }

    if (uiData.type === 'search') {
        return (
            <View style={{ flex: 1, paddingTop: contentPaddingTop }}>
                <DigitalEbooksSearchListView ebooks={uiData.data} />
            </View>
        )
    }

    if (uiData.type === 'searchEmpty') {
        return (
            <View style={{ flex: 1, paddingTop: contentPaddingTop }}>
                <DigitalEbookSearchEmptyResult />
            </View>
        )
    }
    return <DigitalEbookSearchEmptyResult />
})

type TProps = {
    /** Overrides the search bar container style (e.g. tighter top padding). */
    searchBarStyle?: StyleProp<ViewStyle>
}

export const DigitalEbooksMainScreen = memo(({ searchBarStyle }: TProps) => {
    const actions = useActions({
        setInitialLoading: digitalEbooksStore.actions.setIsInitialLoading,
        fetchInitial: digitalEbooksThunk.fetchInitial,
    })

    useEffect(() => {
        actions.fetchInitial()
    }, [])

    return (
        <ScrollableHeaderProvider
            headerContent={<DigitalBooksSearchView searchBarStyle={searchBarStyle} />}
        >
            <DigitalEbooksMainContent />
        </ScrollableHeaderProvider>
    )
})
