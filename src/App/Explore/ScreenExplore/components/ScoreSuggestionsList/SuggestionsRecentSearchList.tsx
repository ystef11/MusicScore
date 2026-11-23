import { memo } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'

import { AppText, brandColors, CommonTouchable, layout } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { searchStoreChunk } from '@mu-native/search'
import { useValues } from '@ug/store'

interface Props {
    onSuggestPress: (item: string) => void
    isTrendingSearchesPresent: boolean
}

export const SuggestionsRecentSearchList = memo((props: Props) => {
    const [history] = useValues([searchStoreChunk.props.getSearchHistory])
    return (
        <View style={props.isTrendingSearchesPresent ? styles.mb0 : styles.mb24}>
            {history?.length > 0 && (
                <ScrollView
                    contentContainerStyle={styles.contentContainer}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.scrollView}
                    keyboardShouldPersistTaps="always"
                >
                    {history.map(h => (
                        <CommonTouchable
                            key={h}
                            style={styles.chip}
                            onPress={() => props.onSuggestPress(h)}
                        >
                            <AppText brandColor="exceptionInverseLight" rawText={h} />
                        </CommonTouchable>
                    ))}
                </ScrollView>
            )}
            <AppText
                rawText={translate('native.trending_searches')}
                font="f20w600"
                style={styles.trendingSearches}
            />
        </View>
    )
})
SuggestionsRecentSearchList.displayName = 'SuggestionsRecentSearchList'

const styles = StyleSheet.create({
    contentContainer: {
        gap: 4,
        paddingHorizontal: layout.baseMarginFromEdges,
    },

    scrollView: {
        height: 44,
        marginBottom: 12,
        width: '100%',
    },

    chip: {
        height: 44,
        minWidth: 72,
        alignItems: 'center',
        paddingHorizontal: 20,
        justifyContent: 'center',
        borderRadius: 100,
        backgroundColor: brandColors.backgroundInactive,
        zIndex: 100,
    },

    trendingSearches: {
        height: 44,
        lineHeight: 44,
        marginHorizontal: -4,
        paddingHorizontal: layout.baseMarginFromEdges,
    },

    mb0: {
        marginBottom: 0,
    },

    mb24: {
        marginBottom: 24,
    },
})
