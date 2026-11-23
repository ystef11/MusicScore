import { useCallback, useMemo, useRef } from 'react'
import { StyleSheet, View } from 'react-native'

import { AppText, brandColors, Icon, layout, NativeBottomSheetRef } from '@mu-native/ds'
import { brokenHeart } from '@mu-native/icons/brokenHeart'
import { translate } from '@mu-native/locale'
import {
    getShazamScores,
    shazamScoreListStoreChunk,
    shazamSearchThunks,
    type ShazamMatch,
} from '@mu-native/shazam'
import { useActions, useValues } from '@ug/store'

import MSFlashList from '../../../App/MSComponents/MSFlashList.tsx'
import { useShazamScorePress } from '../useShazamScorePress.ts'

import { FoundScoresHeader } from './FoundScoresHeader.tsx'
import { ShazamFiltersBottomSheet } from './ShazamFiltersBottomSheet.tsx'
import { ShazamMatchHeader } from './ShazamMatchHeader.tsx'
import { ShazamScrolledNavBar, useShazamScrolledNavBar } from './ShazamScrolledNavBar.tsx'

type Props = {
    match: ShazamMatch
    onBackPress: () => void
}

export const ShazamArtistFallbackView = ({ match, onBackPress }: Props) => {
    const sheetRef = useRef<NativeBottomSheetRef>(null)

    const [scores, isLoading] = useValues([
        getShazamScores,
        shazamScoreListStoreChunk.props.getIsLoading,
    ])
    const actions = useActions({
        loadMore: shazamSearchThunks.loadMore,
    })

    const onScorePress = useShazamScorePress('Shazam Artist', scores)

    const onLoadMore = useCallback(() => {
        actions.loadMore(shazamScoreListStoreChunk)
    }, [actions])

    const openFilters = useCallback(() => sheetRef.current?.present(), [])
    const closeFilters = useCallback(() => sheetRef.current?.dismiss(), [])

    const { visible: navBarVisible, onScroll } = useShazamScrolledNavBar()

    const listHeader = useMemo(
        () => (
            <View>
                <ShazamMatchHeader match={match} onBackPress={onBackPress} />
                <View style={styles.notFoundBlock}>
                    <Icon source={brokenHeart} tint={brandColors.contentPrimary} size={40} />
                    <AppText
                        rawText={translate('native.shazam.no_scores.title')}
                        font="f20w600"
                        brandColor="contentPrimary"
                        textAlign="center"
                        lineHeight={24}
                    />
                </View>
                <FoundScoresHeader
                    title={translate('native.shazam.more_from_artist')}
                    onFilterPress={openFilters}
                />
            </View>
        ),
        [match, onBackPress, openFilters],
    )

    return (
        <View style={styles.container}>
            <MSFlashList
                scores={scores}
                hasSearchFilter={false}
                onItemPress={onScorePress}
                containerStyle={styles.listContent}
                listHeaderComponent={listHeader}
                loadMore={onLoadMore}
                isLoading={isLoading}
                onScroll={onScroll}
            />
            <ShazamScrolledNavBar visible={navBarVisible} />
            <ShazamFiltersBottomSheet sheetRef={sheetRef} onClose={closeFilters} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: brandColors.backgroundDefault,
    },
    listContent: {
        paddingTop: 0,
    },
    notFoundBlock: {
        alignItems: 'center',
        gap: 16,
        paddingHorizontal: layout.baseMarginFromEdges,
        paddingTop: 64,
        paddingBottom: 40,
    },
})
