import { useCallback, useMemo, useRef } from 'react'
import { StyleSheet, View } from 'react-native'

import { shazamTestIds } from '@mu/mu-mobile-test-id'
import { brandColors, NativeBottomSheetRef } from '@mu-native/ds'
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

export const ShazamMatchedView = ({ match, onBackPress }: Props) => {
    const sheetRef = useRef<NativeBottomSheetRef>(null)

    const [scores, isLoading] = useValues([
        getShazamScores,
        shazamScoreListStoreChunk.props.getIsLoading,
    ])
    const actions = useActions({
        loadMore: shazamSearchThunks.loadMore,
    })

    const onScorePress = useShazamScorePress('Shazam Song', scores)

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
                <FoundScoresHeader
                    title={translate('native.shazam.matching_scores')}
                    onFilterPress={openFilters}
                />
            </View>
        ),
        [match, onBackPress, openFilters],
    )

    return (
        <View style={styles.container} testID={shazamTestIds.matched.screen}>
            <MSFlashList
                testID={shazamTestIds.matched.scores}
                scores={scores}
                hasSearchFilter={false}
                onItemPress={onScorePress}
                containerStyle={styles.listContent}
                listHeaderComponent={listHeader}
                loadMore={onLoadMore}
                isLoading={isLoading}
                bounces={false}
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
})
