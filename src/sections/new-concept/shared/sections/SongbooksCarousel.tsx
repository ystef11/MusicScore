import { useCallback } from 'react'
import { FlatList, ListRenderItemInfo, StyleSheet, View } from 'react-native'

import { songbookTestIds } from '@mu/mu-mobile-test-id'
import { layout, SectionHeader } from '@mu-native/ds'
import { Screen, useAppNavigation } from '@mu-native/navigation'
import { getScreenParams } from '@mu-native/rt-analytics'

import MetricaEvents from '../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../App/Utils/Analytics'
import type { DigitalEbookModel } from '../../../ebooks/screens/ebooksMain/new/api/digital.ebooks.models'
import { NewConceptSongbookCard } from '../../../ebooks/screens/ebooksMain/new/components/NewConceptSongbookCard'

const keyExtractor = (item: DigitalEbookModel) => item.id

type TProps = {
    title: string
    items: DigitalEbookModel[]
    onViewAllPress?: () => void
}

/** Presentational songbook carousel — data comes from a screen controller (§3/§5). */
export const SongbooksCarousel = ({ title, items, onViewAllPress }: TProps) => {
    const navigation = useAppNavigation()

    const onItemPress = useCallback(
        (item: DigitalEbookModel) => {
            reportEvent(MetricaEvents.SONGBOOK_CLICK, {
                screen: getScreenParams().screen ?? undefined,
                songbook_id: item.id,
                block_name: title,
                position: items.indexOf(item),
            })
            navigation.navigate(Screen.ebookDetailsStack, { id: item.id })
        },
        [navigation, title, items],
    )

    const renderItem = useCallback(
        ({ item }: ListRenderItemInfo<DigitalEbookModel>) => (
            <NewConceptSongbookCard item={item} onPress={onItemPress} />
        ),
        [onItemPress],
    )

    if (!items.length) return null

    return (
        <View style={styles.container}>
            <SectionHeader title={title} onViewAllPress={onViewAllPress} style={styles.header} />
            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={items}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                testID={songbookTestIds.feedSection}
            />
        </View>
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
