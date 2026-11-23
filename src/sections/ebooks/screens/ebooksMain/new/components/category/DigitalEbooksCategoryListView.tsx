import { memo, useCallback } from 'react'
import { FlatList, ListRenderItemInfo, StyleSheet } from 'react-native'

import { ebooksLayout, layout, staticSafeArea } from '@mu-native/ds'
import { Screen, useAppNavigation } from '@mu-native/navigation'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../../../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../../../../App/Utils/Analytics'
import { isTablet } from '../../../../../../../App/Utils/Platform'
import { DigitalEbookModel } from '../../api/digital.ebooks.models'
import { digitalEbooksThunk } from '../../api/digitalEbooksThunk.ts'
import { useDigitalEbooksCategoryChunk } from '../../stores/digital.ebooks.category.store'
import { DigitalEbooksCategoryListItem } from '../DigitalEbooksCategoryListItem'
import { ListFooterLoadingMore } from '../ListFooterLoadingMore'

const getItemLayout = (_: any, index: number) => ({
    index,
    length: ebooksLayout.categoryItemHeight,
    offset: ebooksLayout.categoryItemHeight * index,
})

export const DigitalEbooksCategoryListView = memo(() => {
    const navigation = useAppNavigation()
    const chunk = useDigitalEbooksCategoryChunk()
    const [ebooks, isFetchingMore] = useValues([
        chunk.props.getEbooks,
        chunk.props.getIsFetchingMore,
    ])

    const actions = useActions({ fetchMore: digitalEbooksThunk.fetchCategory })

    const onItemPress = useCallback(
        (item: DigitalEbookModel) => {
            reportEvent(MetricaEvents.SONGBOOK_CLICK, {
                screen: Screen.ebooksCategoryMain,
                songbook_id: item.id,
            })
            navigation.navigate(Screen.ebookDetailsStack, { id: item.id })
        },
        [navigation],
    )

    const renderItem = useCallback(
        (info: ListRenderItemInfo<DigitalEbookModel>) => {
            return <DigitalEbooksCategoryListItem item={info.item} onPress={onItemPress} />
        },
        [onItemPress],
    )

    return (
        <FlatList
            key={isTablet ? 'tablet2' : 'mobile1'}
            data={ebooks}
            getItemLayout={getItemLayout}
            showsHorizontalScrollIndicator={false}
            numColumns={isTablet ? 2 : 1}
            contentContainerStyle={styles.contentContainer}
            renderItem={renderItem}
            columnWrapperStyle={isTablet ? styles.columnWrapper : undefined}
            onEndReached={() => actions.fetchMore(chunk)}
            ListFooterComponent={isFetchingMore ? ListFooterLoadingMore : undefined}
        />
    )
})

const styles = StyleSheet.create({
    contentContainer: {
        paddingHorizontal: layout.baseMarginFromEdges,
        paddingBottom: staticSafeArea().bottom,
        paddingTop: 16,
        rowGap: 12,
    },

    columnWrapper: {
        columnGap: 40,
    },
})
