import { memo, useCallback } from 'react'
import { ScrollView } from 'react-native'
import { useAnimatedRef } from 'react-native-reanimated'

import { songbookTestIds } from '@mu/mu-mobile-test-id'
import { useBindTopBarScroll } from '@mu-native/ds'
import { localizeSongBooksSectionTitle } from '@mu-native/locale'
import { Screen, useAppNavigation } from '@mu-native/navigation'
import { useValues } from '@ug/store'

import { DigitalEbooksSectionList } from '../api/digital.ebooks.models'
import { digitalEbooksStore } from '../stores/DigitalEbooksStore'

import { CarouselDigitalEbookList } from './carousel/CarouselDigitalEbookList.tsx'

export const DigitalEbooksFeedListView = memo(
    ({ contentPaddingTop = 0 }: { contentPaddingTop?: number }) => {
        const navigation = useAppNavigation()
        const [ebooks] = useValues([digitalEbooksStore.props.getEbooks])

        const scrollRef = useAnimatedRef<ScrollView>()
        useBindTopBarScroll(scrollRef)

        const onCategoryPress = useCallback(
            (item: DigitalEbooksSectionList) => {
                navigation.navigate(Screen.ebooksCategoryMain, {
                    id: item.uri,
                    title: localizeSongBooksSectionTitle(item.title),
                })
            },
            [navigation],
        )

        return (
            <ScrollView
                ref={scrollRef}
                testID={songbookTestIds.feedList}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: contentPaddingTop }}
            >
                {ebooks.map(section => {
                    if (section.data.length === 0) return null
                    return (
                        <CarouselDigitalEbookList
                            title={localizeSongBooksSectionTitle(section.title)}
                            onTitlePress={() => onCategoryPress(section)}
                            data={section.data}
                            key={section.title}
                        />
                    )
                })}
            </ScrollView>
        )
    },
)
