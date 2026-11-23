import { memo } from 'react'
import { StyleSheet, View } from 'react-native'

import { scoreTestIds } from '@mu/mu-mobile-test-id'
import { AppText, brandColors, Icon, layout } from '@mu-native/ds'
import { search } from '@mu-native/icons/search'
import { translate } from '@mu-native/locale'
import { searchStoreChunk } from '@mu-native/search'
import { useValues } from '@ug/store'

import { SuggestionScoresListView } from '../ScoreSuggestionsList/SuggestionScoresListView.tsx'

export const EmptyListWithTrendingScores = memo(() => {
    const [searchTerm] = useValues([searchStoreChunk.props.getSearchTerm])

    return (
        <>
            <View testID={scoreTestIds.searchEmptyState} style={styles.emptyContainer}>
                <Icon
                    source={search}
                    size={48}
                    tint={brandColors.contentPrimary}
                />
                <AppText
                    testID={scoreTestIds.searchNoResultsTitle}
                    rawText={translate('native.search.no.results_for_query', {
                        query: `'${searchTerm}'`,
                    })}
                    font="f20w600"
                    textAlign="center"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={styles.title}
                />
                <AppText
                    testID={scoreTestIds.searchNoResultsMessage}
                    rawText={translate('native.search.empty')}
                    style={styles.lh20}
                    font="f15w400"
                    textAlign="center"
                />
            </View>
            <SuggestionScoresListView maxCount={10} />
        </>
    )
})

const styles = StyleSheet.create({
    emptyContainer: {
        flex: 1,
        alignSelf: 'center',
        width: layout.baseMaxWidth,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 32,
        marginBottom: 56,
    },

    title: {
        marginTop: 12,
        marginBottom: 8,
    },

    lh20: {
        lineHeight: 20,
    },
})
