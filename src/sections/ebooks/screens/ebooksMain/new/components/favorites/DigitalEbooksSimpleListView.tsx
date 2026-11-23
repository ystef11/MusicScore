import { memo, useCallback } from 'react'
import { FlatList, ListRenderItemInfo, StyleSheet } from 'react-native'

import { libraryTestIds } from '@mu/mu-mobile-test-id'
import { ebooksLayout, layout, staticSafeArea, BaseEmptyStateView } from '@mu-native/ds'
import { brokenHeart } from '@mu-native/icons/brokenHeart'
import { Screen, useAppNavigation } from '@mu-native/navigation'

import MetricaEvents from '../../../../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../../../../App/Utils/Analytics'
import { isTablet } from '../../../../../../../App/Utils/Platform'
import { DigitalEbookModel } from '../../api/digital.ebooks.models'
import { DigitalEbooksCategoryListItem } from '../DigitalEbooksCategoryListItem'
import { ListFooterLoadingMore } from '../ListFooterLoadingMore.tsx'

type TProps = {
    ebooks: DigitalEbookModel[]
    isFavorite: boolean

    emptyTitle: string
    emptySubtitle: string
    onEndReached?: () => void
    isFetchingMore?: boolean
    screen: string
    onRemoveFromFavoritePress?: (id: string) => void
}

const getItemLayout = (_: any, index: number) => ({
    index,
    length: ebooksLayout.categoryItemHeight,
    offset: ebooksLayout.categoryItemHeight * index,
})

export const DigitalEbooksSimpleListView = memo(
    ({
        ebooks,
        isFavorite,
        emptySubtitle,
        emptyTitle,
        onEndReached,
        isFetchingMore,
        screen,
        onRemoveFromFavoritePress,
    }: TProps) => {
        const navigation = useAppNavigation()

        const onItemPress = useCallback(
            (item: DigitalEbookModel) => {
                reportEvent(MetricaEvents.SONGBOOK_CLICK, { screen, songbook_id: item.id })
                navigation.push(Screen.ebookDetailsStack, { id: item.id })
            },
            [navigation, screen],
        )

        const renderItem = useCallback(
            (info: ListRenderItemInfo<DigitalEbookModel>) => {
                return (
                    <DigitalEbooksCategoryListItem
                        isInFavorites={isFavorite}
                        item={info.item}
                        onPress={onItemPress}
                        onRemoveFromFavoritePress={onRemoveFromFavoritePress}
                    />
                )
            },
            [isFavorite, onItemPress, onRemoveFromFavoritePress],
        )

        if (ebooks.length === 0) {
            return (
                <BaseEmptyStateView
                    title={emptyTitle}
                    description={emptySubtitle}
                    icon={brokenHeart}
                />
            )
        }

        return (
            <FlatList
                testID={libraryTestIds.lists.ebooksFavoritesList}
                data={ebooks}
                getItemLayout={getItemLayout}
                showsHorizontalScrollIndicator={false}
                numColumns={isTablet ? 2 : 1}
                onEndReached={onEndReached}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.contentContainer}
                renderItem={renderItem}
                columnWrapperStyle={isTablet ? styles.columnWrapper : undefined}
                ListFooterComponent={isFetchingMore ? <ListFooterLoadingMore /> : undefined}
            />
        )
    },
)

const styles = StyleSheet.create({
    contentContainer: {
        paddingHorizontal: layout.baseMarginFromEdges,
        paddingBottom: staticSafeArea().bottom,
        paddingTop: 20,
        rowGap: 12,
    },

    columnWrapper: {
        columnGap: 40,
    },
})
