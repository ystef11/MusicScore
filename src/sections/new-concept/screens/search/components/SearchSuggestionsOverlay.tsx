import { useCallback, useState } from 'react'
import { Keyboard, ScrollView, StyleSheet, View } from 'react-native'

import {
    AppText,
    brandColors,
    CommonTouchable,
    layout,
    SearchField,
    useAppSafeArea,
} from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { reportSuggestionSelected } from '@mu-native/new-concept-shared'
import { type TRecentSearchFilter } from '@mu-native/search'

import { useRecentSearches, useSearchSuggestions } from '../store/useSearchSuggestions'
import { useShazamSearchEntry } from '../store/useShazamSearchEntry'

import { RecentSearchRow } from './RecentSearchRow'
import { SuggestionRow } from './SuggestionRow'

// Filter names arrive lowercase from the server; present them sentence-cased
// ("Piano, Beginner") in the recent-search subtitle.
const capitalizeFirst = (text: string) =>
    text ? text.charAt(0).toUpperCase() + text.slice(1) : text

type TProps = {
    onClose: () => void
    onSubmit: (query: string, filters?: TRecentSearchFilter[]) => void
}

// Rendered over the Search screen (not a separate route). The white sheet always
// covers the underlying screen while the search is active, even with no recent
// searches or suggestions to show.
export const SearchSuggestionsOverlay = ({ onClose, onSubmit }: TProps) => {
    const insets = useAppSafeArea()

    const [query, setQuery] = useState('')

    const suggestions = useSearchSuggestions(query)
    const recentSearches = useRecentSearches()

    // Android keeps the keyboard up when the focused input merely unmounts,
    // so dismiss it explicitly before leaving the overlay.
    const handleClose = useCallback(() => {
        Keyboard.dismiss()
        onClose()
    }, [onClose])

    const submitQuery = useCallback(
        (term: string, filters?: TRecentSearchFilter[]) => {
            // An empty query is a valid search — it opens unfiltered results.
            Keyboard.dismiss()
            onSubmit(term.trim(), filters)
        },
        [onSubmit],
    )

    const handleSuggestionPress = useCallback(
        (suggestion: string, index: number) => {
            const prefixAtTap = query
            const shownSize = suggestions.length
            submitQuery(suggestion)
            // submitQuery → onSubmit has synchronously dispatched setSearchTerm,
            // so the store already holds the search_query_id the results screen
            // will report with — the event below must carry the same id.
            reportSuggestionSelected({
                prefixAtTap,
                shownSize,
                tappedIndex: index + 1,
                finalText: suggestion.trim(),
            })
        },
        [query, suggestions, submitQuery],
    )

    const { trailingButton: shazamButton, briefingSheet: shazamBriefingSheet } =
        useShazamSearchEntry(handleClose)

    const isTyping = !!query.trim()

    return (
        <View style={styles.root}>
            <View style={[styles.header, { paddingTop: insets.top + layout.marginSm }]}>
                <SearchField
                    style={styles.searchField}
                    autoFocus
                    value={query}
                    onChangeText={setQuery}
                    onClear={() => setQuery('')}
                    onSubmitEditing={() => submitQuery(query)}
                    trailingButton={shazamButton}
                />
                <CommonTouchable onPress={handleClose} style={styles.cancelButton}>
                    <AppText font="f15w400" rawText={translate('native.search.cancel_button')} />
                </CommonTouchable>
            </View>
            <ScrollView
                style={styles.list}
                contentContainerStyle={styles.listContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {isTyping ? (
                    suggestions.map((suggestion, index) => (
                        <SuggestionRow
                            key={suggestion}
                            text={suggestion}
                            index={index}
                            onPress={handleSuggestionPress}
                        />
                    ))
                ) : (
                    <>
                        {recentSearches.length > 0 && (
                            <AppText
                                font="f13w400"
                                brandColor="contentSecondary"
                                rawText={translate('native.new_concept.search.recent_searches')}
                                style={styles.sectionLabel}
                            />
                        )}
                        {recentSearches.map(item => (
                            <RecentSearchRow
                                key={item.query}
                                title={item.query}
                                subtitle={item.filters
                                    .map(filter => capitalizeFirst(filter.name))
                                    .join(', ')}
                                onPress={() => submitQuery(item.query, item.filters)}
                            />
                        ))}
                    </>
                )}
            </ScrollView>
            {shazamBriefingSheet}
        </View>
    )
}

const styles = StyleSheet.create({
    root: {
        ...StyleSheet.absoluteFill,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: layout.marginXm,
        paddingHorizontal: layout.baseMarginFromEdges,
        paddingBottom: layout.marginSm,
        backgroundColor: brandColors.backgroundDefault,
    },
    searchField: {
        flex: 1,
    },
    cancelButton: {
        paddingVertical: layout.marginXs,
    },
    list: {
        flex: 1,
        backgroundColor: brandColors.backgroundDefault,
    },
    listContent: {
        paddingHorizontal: layout.baseMarginFromEdges,
    },
    sectionLabel: {
        marginTop: layout.marginSm,
        marginBottom: layout.marginXs,
    },
})
