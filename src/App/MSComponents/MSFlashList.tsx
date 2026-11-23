import { forwardRef, memo, ReactElement, ReactNode, useState } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'

import { useScoreInfoScreenFeatureFlag } from '@mu-native/ab'
import { useOpenScorePlay } from '@mu-native/score'
import { colors, CommonTouchable, icons, layout, BrandAppLoader } from '@mu-native/ds'
import { ListRenderItemInfo } from '@react-native/virtualized-lists/Lists/VirtualizedList'
import { FlashList, FlashListProps, FlashListRef } from '@shopify/flash-list'

import EmptySearchFilterElement from '../Elements/EmptySearchFilterElement'
import { ScoreListItem } from '../Elements/scoreListItem/ScoreListItem'
import ScoresListHeaderDefaultElement from '../Elements/ScoresListHeaderDefaultElement'
import SectionHeader from '../Elements/SectionHeader'
import { MSOfflineScoreT } from '../Model/MSOfflineScore'
import { MSScoreT } from '../Model/MSScore'
import { isTablet } from '../Utils/Platform'
import { Section } from '../Utils/Search'

const styles = StyleSheet.create({
    section: {
        backgroundColor: colors.white,
        flex: 1,
    },
    item: {
        minHeight: 132,
        marginBottom: 12,
    },
    compositionContainer: {
        width: '100%',
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    compositionTitle: {
        color: colors.text900,
        fontSize: 14,
        lineHeight: 20,
    },
    arrow: {
        height: 17,
        width: 17,
        tintColor: colors.text900,
    },
    loader: {
        alignItems: 'center',
        paddingVertical: layout.marginMd,
    },
})

type Props = {
    scores?: MSScoreT[] | MSOfflineScoreT[]
    sections?: Section[]
    onItemPress?: (score: MSScoreT) => void
    testID?: string
    onRefresh?: () => void
    isLoading?: boolean
    refreshing?: boolean
    loadMore?: () => void
    onCompositionPress?: (composition: { id: number; name: string }) => void
    compositions?: { id: number; name: string }[]
    ListEmptyComponent?: ReactElement<any, any> | ReactNode | null | undefined
    listHeaderComponent?: ReactElement<any, any> | ReactNode | null | undefined
    ListFooterComponent?: ReactElement<any, any> | ReactNode | null | undefined
    hasSearchFilter?: boolean
    scrollDisabled?: boolean
    containerStyle?: FlashListProps<any>['contentContainerStyle']
    renderScoreExtra?: (score: MSScoreT) => ReactNode
    renderScoreTrailing?: (score: MSScoreT) => ReactNode
    scoreVariant?: 'basic' | 'favorites' | 'myScores'
    bounces?: boolean
    onScroll?: FlashListProps<any>['onScroll']
    /** Show the "Play" practice shortcut on each row (library lists, MUP-13932). */
    enablePlayShortcut?: boolean
}

const getKeyExtractor = (item: any, index: number) => {
    return `${item?.id || item}_${index}`
}
const getItemType = (item: any) => (typeof item === 'string' ? 'sectionHeader' : 'row')

export const ListLoaderComponent = () => (
    <View style={styles.loader}>
        <BrandAppLoader size="s" />
    </View>
)

export type TScoreList = FlashListRef<MSScoreT>

const contentContainerStyle = {
    paddingTop: 12,
}

const MSFlashList = forwardRef<TScoreList, Props>(
    (
        {
            scores,
            sections,
            onItemPress,
            testID,
            onRefresh,
            loadMore,
            onCompositionPress,
            compositions,
            listHeaderComponent,
            scrollDisabled,
            hasSearchFilter,
            isLoading = false,
            refreshing: _refreshing,
            ListEmptyComponent = <EmptySearchFilterElement />,
            ListFooterComponent = null,
            containerStyle = contentContainerStyle,
            renderScoreExtra,
            renderScoreTrailing,
            scoreVariant,
            bounces,
            onScroll,
            enablePlayShortcut,
        }: Props,
        ref,
    ) => {
        const [scoresDisabled, setScoresDisabled] = useState(false)
        const playShortcutEnabled = useScoreInfoScreenFeatureFlag()
        const openScorePlay = useOpenScorePlay()
        const onScorePlayPress =
            enablePlayShortcut && playShortcutEnabled ? openScorePlay : undefined

        const initiallyLoaded = Array.isArray(scores)
        const refreshing =
            typeof _refreshing === 'boolean'
                ? _refreshing
                : initiallyLoaded && !hasSearchFilter && isLoading

        const handleCompositionPress = (composition: { id: number; name: string }) =>
            onCompositionPress?.(composition)

        const renderSection = (item: string) => (
            <View style={styles.section}>
                <SectionHeader title={item} />
            </View>
        )

        const renderItem = ({ item, index }: ListRenderItemInfo<MSScoreT | string>) => {
            if (typeof item === 'string') {
                return renderSection(item)
            }

            return (
                <View style={styles.item}>
                    <ScoreListItem
                        score={item}
                        isOdd={index % 2 === 0}
                        onScorePress={onItemPress}
                        onScorePlayPress={onScorePlayPress}
                        disabled={scoresDisabled}
                        testID={
                            testID
                                ? `${testID}_item_${scoreOrdinals.get(index) ?? index}`
                                : undefined
                        }
                        renderExtra={renderScoreExtra}
                        renderTrailing={renderScoreTrailing}
                        variant={scoreVariant}
                    />
                </View>
            )
        }

        const renderComposition = ({ item }: { item: { id: number; name: string } }) => {
            return (
                <CommonTouchable
                    style={styles.compositionContainer}
                    onPress={() => handleCompositionPress(item)}
                >
                    <Text style={styles.compositionTitle}>{item?.name}</Text>
                    <Image style={styles.arrow} source={icons.iosForwardIcon} />
                </CommonTouchable>
            )
        }

        const handleEnabled = () => setScoresDisabled(true)
        const handleDisabled = () => setScoresDisabled(false)

        let sectionsData = [] as any[]
        if (sections?.length) {
            sections?.forEach((item: Section) => {
                // on tablet grid and sections are completely broken, so temporary just remove section titles
                if (isTablet) {
                    sectionsData = [...sectionsData, ...item.data]
                } else {
                    sectionsData = [
                        ...sectionsData,
                        `${item.title} ${item.data.length}`,
                        ...item.data,
                    ]
                }
            })
        }

        const data = sections ? sectionsData : compositions || scores
        // Ordinal counts score rows only, so section titles do not shift the numbering tests rely on.
        const scoreOrdinals = new Map<number, number>()
        ;(data as any[] | undefined)?.forEach((entry, entryIndex) => {
            if (typeof entry !== 'string') scoreOrdinals.set(entryIndex, scoreOrdinals.size)
        })
        const EmptyComponent = isLoading ? <ListLoaderComponent /> : ListEmptyComponent

        return (
            <FlashList
                key={isTablet ? 'tablet2' : 'mobile1'}
                testID={testID}
                ref={ref}
                data={data}
                extraData={scoresDisabled}
                keyboardDismissMode="on-drag"
                renderItem={(compositions ? renderComposition : renderItem) as any}
                ListEmptyComponent={EmptyComponent as any}
                ListHeaderComponent={
                    (listHeaderComponent || <ScoresListHeaderDefaultElement />) as any
                }
                onMomentumScrollBegin={handleEnabled}
                onMomentumScrollEnd={handleDisabled}
                keyExtractor={getKeyExtractor}
                onEndReached={loadMore}
                onEndReachedThreshold={isTablet ? 0.1 : 0.5}
                contentContainerStyle={containerStyle}
                keyboardShouldPersistTaps="handled"
                getItemType={getItemType}
                numColumns={isTablet ? 2 : undefined}
                onRefresh={onRefresh}
                refreshing={refreshing}
                scrollEnabled={!scrollDisabled}
                ListFooterComponent={
                    (ListFooterComponent ||
                        (initiallyLoaded && isLoading && !!scores?.length && (
                            <ListLoaderComponent />
                        ))) as any
                }
                bounces={bounces}
                onScroll={onScroll}
            />
        )
    },
)

export default memo(MSFlashList)
