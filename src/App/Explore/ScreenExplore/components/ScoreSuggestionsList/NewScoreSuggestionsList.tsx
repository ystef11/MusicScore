import { memo, useCallback, useEffect, useRef } from 'react'
import { FlatList, Keyboard, ListRenderItemInfo, StyleSheet } from 'react-native'
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated'

import { apiRequest, commonContracts } from '@mu-native/api'
import {
    brandColors,
    TOP_BAR_ROW_HEIGHT,
    useScrollableHeader,
    useTopBarScrollOffset,
} from '@mu-native/ds'
import { searchStoreChunk } from '@mu-native/search'
import { useActions, useValues } from '@ug/store'

import { useEnhanceSearchWithApostrophesExp } from '../../../../../modules/ab/experiments/enhanceSearchWithApostrophesExp.ts'
import MetricaEvents from '../../../../constants/MetricaEvents'
import MSScore from '../../../../Model/MSScore.ts'
import reportEvent from '../../../../Utils/Analytics'
import { exploreScoreListStoreChunk } from '../../../exploreScoreListStoreChunk.ts'
import { requestSuggestions } from '../../../Search/asyncSearchActions'
import { SuggestionsListItem } from '../../../Search/Components/SuggestionsListElement'
import { screenExploreThunks } from '../../thunks/thunks'

import { SuggestionsRecentSearchList } from './SuggestionsRecentSearchList.tsx'

const keyExtractor = (_item: string, index: number) => index.toString()

export const NewScoreSuggestionsList = memo(() => {
    useEnhanceSearchWithApostrophesExp()
    const suggestionTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const { contentPaddingTop } = useScrollableHeader()
    const scrollOffset = useTopBarScrollOffset()

    const [suggestions, searchTerm, trendingSearchSuggestions] = useValues([
        searchStoreChunk.props.getSuggestions,
        searchStoreChunk.props.getSearchTerm,
        searchStoreChunk.props.getTrendingSearchSuggestions,
    ])

    const actions = useActions({
        requestSuggestions,
        search: screenExploreThunks.search,
        changeSuggestions: searchStoreChunk.actions.setSuggestions,
        setTrendingSearchSuggestions: searchStoreChunk.actions.setTrendingSearchSuggestions,
    })

    useEffect(() => {
        if (trendingSearchSuggestions) return
        apiRequest(commonContracts.hello).then(response => {
            actions.setTrendingSearchSuggestions({
                suggestions: response.trendingSearchSuggestions,
                trendingScores: MSScore.processSuggestionScores(response.trendingScores),
            })
        })
    }, [actions, trendingSearchSuggestions])

    useEffect(() => {
        if (suggestionTimer?.current) clearTimeout(suggestionTimer.current)

        suggestionTimer.current = setTimeout(() => {
            if (searchTerm) actions.requestSuggestions(searchTerm)
        }, 300)
        // if (!searchTerm) {
        //     actions.changeSuggestions([])
        // }
    }, [actions, searchTerm])

    const onPressSuggestion = useCallback(
        (suggestion: string) => {
            reportEvent(MetricaEvents.BROWSE_SUGGESTION_CLICK, { suggestion })

            actions.changeSuggestions([])

            actions.search(exploreScoreListStoreChunk, suggestion)
            Keyboard.dismiss()
        },
        [actions],
    )

    const onPressHistoryItem = useCallback(
        (item: string) => {
            console.log('[ScoreSuggestionsList.onPressHistoryItem]', item)
            reportEvent(MetricaEvents.BROWSE_HISTORY_CLICK, { item })

            actions.changeSuggestions([])
            actions.search(exploreScoreListStoreChunk, item)
            Keyboard.dismiss()
        },
        [actions],
    )

    const isSuggestions = suggestions?.length > 0 && !!searchTerm

    const renderItem = useCallback(
        (info: ListRenderItemInfo<string>) => (
            <SuggestionsListItem suggestion={info.item} onPress={onPressSuggestion} />
        ),
        [onPressSuggestion],
    )

    const animatedContainerStyle = useAnimatedStyle(() => {
        const value = scrollOffset?.value ?? 0
        const translate = interpolate(
            value,
            [0, TOP_BAR_ROW_HEIGHT],
            [0, -TOP_BAR_ROW_HEIGHT],
            'clamp',
        )
        return {
            top: contentPaddingTop + translate,
        }
    })

    return (
        <Animated.View style={[styles.container, animatedContainerStyle]}>
            <FlatList
                keyboardShouldPersistTaps="always"
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                data={isSuggestions ? suggestions : (trendingSearchSuggestions?.suggestions ?? [])}
                ListHeaderComponent={
                    isSuggestions ? undefined : (
                        <SuggestionsRecentSearchList
                            isTrendingSearchesPresent={!isSuggestions}
                            onSuggestPress={onPressHistoryItem}
                        />
                    )
                }
            />
        </Animated.View>
    )
})

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: brandColors.backgroundDefault,
    },
})
