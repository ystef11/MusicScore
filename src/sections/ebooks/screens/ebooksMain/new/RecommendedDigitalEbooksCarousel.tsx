import { useCallback, useEffect } from 'react'
import { FlatList, ListRenderItemInfo, StyleSheet, View } from 'react-native'

import { songbookTestIds } from '@mu/mu-mobile-test-id'
import { layout, SectionHeader } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { Screen, useAppNavigation } from '@mu-native/navigation'
import { useActions, useInjectDynamicStoreChunk, useValues } from '@ug/store'

import MetricaEvents from '../../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../../App/Utils/Analytics'

import { DigitalEbookModel } from './api/digital.ebooks.models.ts'
import { digitalEbooksThunk } from './api/digitalEbooksThunk.ts'
import { NewConceptSongbookCard } from './components/NewConceptSongbookCard.tsx'
import {
    createDigitalEbooksCategoryChunkStore,
    DigitalEbooksCategoryContext,
    useDigitalEbooksCategoryChunk,
} from './stores/digital.ebooks.category.store.ts'

// Seed uri for the dynamic chunk; replaced at runtime with the uri of the
// catalog section the carousel actually renders (see fetchRecommendedSection).
const RECOMMENDED_CATEGORY_ID = 'most-popular-without-favorite'
const MIN_ITEMS = 6

type TProps = { title?: string }

const keyExtractor = (item: DigitalEbookModel) => item.id

const RecommendedDigitalEbooksCarouselInternal = ({
    title = translate('native.bottom_bar.books_tab'),
}: TProps) => {
    const navigation = useAppNavigation()
    const storeChunk = useDigitalEbooksCategoryChunk()
    const [ebooks, categoryId] = useValues([
        storeChunk.props.getEbooks,
        storeChunk.props.getCategoryId,
    ])

    const actions = useActions({
        setInitialLoading: storeChunk.actions.setIsInitialLoading,
        fetchRecommended: digitalEbooksThunk.fetchRecommendedSection,
    })

    useEffect(() => {
        actions.setInitialLoading(true)
        actions.fetchRecommended(storeChunk)
    }, [])

    const onViewAllPress = useCallback(() => {
        navigation.navigate(Screen.ebooksCategoryMain, { id: categoryId, title })
    }, [navigation, categoryId, title])

    const onItemPress = useCallback(
        (item: DigitalEbookModel) => {
            reportEvent(MetricaEvents.SONGBOOK_CLICK, {
                screen: Screen.ebooksMain,
                songbook_id: item.id,
            })
            navigation.navigate(Screen.ebookDetailsStack, { id: item.id })
        },
        [navigation],
    )

    const renderItem = useCallback(
        ({ item }: ListRenderItemInfo<DigitalEbookModel>) => (
            <NewConceptSongbookCard item={item} onPress={onItemPress} />
        ),
        [onItemPress],
    )

    const eligibleItems = ebooks.filter(item => !item.is_favorite)

    if (eligibleItems.length < MIN_ITEMS) return null

    return (
        <View style={styles.container}>
            <SectionHeader title={title} onViewAllPress={onViewAllPress} style={styles.header} />
            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={eligibleItems}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                testID={songbookTestIds.feedSection}
            />
        </View>
    )
}

export const RecommendedDigitalEbooksCarousel = ({ title }: TProps) => {
    const { chunk } = useInjectDynamicStoreChunk(
        RECOMMENDED_CATEGORY_ID,
        key => createDigitalEbooksCategoryChunkStore(key, RECOMMENDED_CATEGORY_ID),
        'screens',
    )

    return (
        <DigitalEbooksCategoryContext.Provider value={chunk}>
            <RecommendedDigitalEbooksCarouselInternal title={title} />
        </DigitalEbooksCategoryContext.Provider>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: layout.marginLg,
    },
    header: {
        marginHorizontal: layout.baseMarginFromEdges,
        marginBottom: layout.marginXm,
    },
    list: {
        paddingHorizontal: layout.baseMarginFromEdges,
        gap: layout.marginSm,
    },
})
