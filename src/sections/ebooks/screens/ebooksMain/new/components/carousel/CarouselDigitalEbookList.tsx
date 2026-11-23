import { useCallback } from 'react'
import { FlatListProps, ListRenderItemInfo, StyleSheet } from 'react-native'

import { songbookTestIds } from '@mu/mu-mobile-test-id'
import { CarouselList, ebooksLayout, DigitalEbookSkeletonItem } from '@mu-native/ds'
import { Screen, useAppNavigation } from '@mu-native/navigation'

import MetricaEvents from '../../../../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../../../../App/Utils/Analytics'
import { DigitalEbookModel } from '../../api/digital.ebooks.models.ts'
import { DigitalEbooksFeedListItem } from '../DigitalEbooksFeedListItem.tsx'

const renderLoadingItem = () => <DigitalEbookSkeletonItem />

type Props = { title: string; onTitlePress: () => void; isLoading?: boolean } & Pick<
    FlatListProps<DigitalEbookModel>,
    'data'
>

export const CarouselDigitalEbookList = ({ title, onTitlePress, data, isLoading }: Props) => {
    const navigation = useAppNavigation()

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
        (info: ListRenderItemInfo<DigitalEbookModel>) => {
            return <DigitalEbooksFeedListItem item={info.item} onPress={onItemPress} />
        },
        [onItemPress],
    )

    return (
        <CarouselList
            testID={songbookTestIds.feedSection}
            titleTestID={songbookTestIds.feedSectionTitle}
            title={title}
            onTitlePress={onTitlePress}
            style={styles.sectionList}
            contentContainerStyle={styles.sectionContentContainer}
            renderItem={renderItem}
            data={data}
            isLoading={isLoading}
            renderLoadingItem={renderLoadingItem}
        />
    )
}

const styles = StyleSheet.create({
    sectionList: {
        height: ebooksLayout.listSectionHeight,
    },

    sectionContentContainer: {
        columnGap: 8,
    },
})
