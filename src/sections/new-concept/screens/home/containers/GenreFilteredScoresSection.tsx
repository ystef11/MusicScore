import { useCallback, useMemo } from 'react'
import { FlatList, ListRenderItemInfo, StyleSheet, View } from 'react-native'

import { AppText, layout, MuseButton, SectionHeader } from '@mu-native/ds'
import { localizeGenre, translate } from '@mu-native/locale'
import { Screen, useAppNavigation } from '@mu-native/navigation'
import {
    reportScoreResultClick,
    ScoreMediumGrid,
    ScoreMediumGridSkeleton,
    useResultsViewReporter,
    type TApiFilterChip,
    type TResultsListContext,
} from '@mu-native/new-concept-shared'

import { QuickFilterItemChip } from '../../../../../App/Explore/ScreenExplore/components/quickFilters/QuickFilterItemChip'
import type { MSScoreT } from '../../../../../App/Model/MSScore'
import type { THomeGenres } from '../store/useHomeScreen.ts'

// Genre `name` from the server is the raw stable key — localized
// client-side via `localizeGenre(key)`. Unknown genres fall back to the server
// name in sentence case ("Religious music", "World music") per the design.
const capitalizeFirst = (text: string) =>
    text ? text.charAt(0).toUpperCase() + text.slice(1) : text

const genreChipTitle = (key: string, name: string) => localizeGenre(key, capitalizeFirst(name))

type TProps = {
    title: string
    genres: THomeGenres
    onScorePress: (score: MSScoreT) => void
    onViewAllPress?: () => void
}

export const GenreFilteredScoresSection = ({
    title,
    genres,
    onScorePress,
    onViewAllPress,
}: TProps) => {
    const navigation = useAppNavigation()
    const { chips, activeKey, scores, isLoading, activeParams, selectGenre } = genres

    const analyticsContext = useMemo<TResultsListContext>(
        () => ({
            screen: 'HomeMain',
            blockName: title,
            searchType: 'browse',
            filters: activeKey ? [{ key: 'genre', value: activeKey }] : [],
        }),
        [title, activeKey],
    )

    useResultsViewReporter({ scores, context: analyticsContext, enabled: !isLoading })

    const handleScorePress = useCallback(
        (score: MSScoreT) => {
            reportScoreResultClick(score, scores.indexOf(score), scores.length, analyticsContext)
            onScorePress(score)
        },
        [scores, analyticsContext, onScorePress],
    )

    // "View all" / "View more scores" opens the full Explore screen replaying the
    // active genre chip's params (§3).
    const handleViewAll = useCallback(() => {
        if (onViewAllPress) {
            onViewAllPress()
            return
        }
        navigation.push(Screen.browseExploreScores, { searchParams: activeParams })
    }, [onViewAllPress, navigation, activeParams])

    const renderChip = useCallback(
        ({ item }: ListRenderItemInfo<TApiFilterChip>) => (
            <QuickFilterItemChip
                title={genreChipTitle(item.key, item.name)}
                isSelected={item.key === activeKey}
                showCloseIcon={false}
                onPress={() => selectGenre(item.key)}
                size="small"
            />
        ),
        [activeKey, selectGenre],
    )

    if (chips.length === 0) return null

    const renderBody = () => {
        // Keep the section height while a chip's scores load, instead of
        // collapsing to just the chips row (§1).
        if (isLoading) return <ScoreMediumGridSkeleton />
        if (activeKey !== null && scores.length === 0) {
            return (
                <AppText
                    font="f14w400"
                    brandColor="contentSecondary"
                    rawText={translate('native.new_concept.home.genre_empty')}
                    style={styles.empty}
                />
            )
        }
        return (
            <ScoreMediumGrid
                scores={scores}
                onScorePress={handleScorePress}
                trailingSlot={
                    <View style={styles.viewMoreSlot}>
                        <MuseButton
                            title={translate('native.new_concept.home.view_more_scores')}
                            type="secondary"
                            onPress={handleViewAll}
                            adaptiveTextSize={false}
                        />
                    </View>
                }
            />
        )
    }

    return (
        <View style={styles.container}>
            <SectionHeader title={title} style={styles.header} />
            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={chips}
                keyExtractor={item => item.key}
                renderItem={renderChip}
                contentContainerStyle={styles.chipsRow}
                style={styles.chipsList}
            />
            {renderBody()}
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
    chipsList: {
        flexGrow: 0,
    },
    chipsRow: {
        paddingHorizontal: layout.baseMarginFromEdges,
        gap: layout.marginXs,
        paddingBottom: layout.marginMd,
    },
    viewMoreSlot: {
        // Matches the height of a ScoreMediumItem (square 93px image) so the
        // bottom row stays aligned with the score cards above it.
        height: 93,
        justifyContent: 'center',
    },
    empty: {
        paddingHorizontal: layout.baseMarginFromEdges,
        paddingVertical: layout.marginXm,
    },
})
