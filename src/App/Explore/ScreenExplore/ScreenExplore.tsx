import { forwardRef, memo, useCallback, useEffect, useMemo, useRef } from 'react'
import { Keyboard, View } from 'react-native'

import { AppleWatchMetronomeContainer } from '@mu-native/apple-watch-module'
import { authStoreChunk, getIsAuthorized } from '@mu-native/auth'
import { globalStorage, platform } from '@mu-native/common'
import { NativeBottomSheetRef, ScrollableHeaderProvider, useScrollableHeader } from '@mu-native/ds'
import { CheckSaleSplash, FloatingButtonContainer } from '@mu-native/marketing'
import { getAllSelectedFiltersQuantity, searchStoreChunk } from '@mu-native/search'
import { ScoresAfterTourTrigger } from '@mu-native/scores-after-tour-screen'
import { useActions, useValues } from '@ug/store'

import {
    useRegisterScoreFiltersExp,
    useScoreFiltersExp,
} from '../../../modules/ab/experiments/scoreFiltersExp.ts'
import MetricaEvents from '../../constants/MetricaEvents.ts'
import reportEvent from '../../Utils/Analytics.ts'
import { initScoreFilters } from '../exploreAsyncActions'

import { ExploreHeader } from './components/ExploreHeader/ExploreHeader.tsx'
import { ScoreQuickFiltersView } from './components/quickFilters/ScoreQuickFiltersView.tsx'
import { ScoreList } from './components/ScoreList/ScoreList'
import { ScoreListHeader } from './components/ScoreListHeader/ScoreListHeader'
import { ScoreSuggestionsList } from './components/ScoreSuggestionsList/ScoreSuggestionsList'
import { styles } from './components/styles'
import { CorrectQueryView } from './CorrectQueryView'
import { FiltersBottomSheet } from './FiltersBottomSheet.tsx'
import { useExploreScreenScroll } from './hooks/useExploreScreenScroll'
import { useReferralScoreLogic } from './hooks/useReferralScoreLogic.ts'
import { useSearchSession } from './hooks/useSearchSession'
import type { TScoreList } from '../../MSComponents/MSFlashList'

type ScoreListWithPaddingProps = {
    listHeader: React.ReactNode
}

const ScoreListWithPadding = forwardRef<TScoreList, ScoreListWithPaddingProps>(
    ({ listHeader }, ref) => {
        const { contentPaddingTop } = useScrollableHeader()
        return (
            <ScoreList
                ref={ref}
                listHeaderComponent={listHeader}
                contentPaddingTop={contentPaddingTop}
            />
        )
    },
)

const ScreenExploreInternal = memo(() => {
    const exp = useScoreFiltersExp()
    const sheetRef = useRef<NativeBottomSheetRef>(null)
    const actions = useActions({
        setIsVisible: authStoreChunk.actions.setIsVisible,
        initFilters: initScoreFilters,
    })

    const [selectedFilterParamsQuantity, searchTerm, isFocused, isAuth, sort] = useValues([
        getAllSelectedFiltersQuantity,
        searchStoreChunk.props.getSearchTerm,
        searchStoreChunk.props.getIsSearchInputFocused,
        getIsAuthorized,
        searchStoreChunk.props.getSelectedSort,
    ])

    const { listRef } = useExploreScreenScroll()
    useSearchSession()

    useReferralScoreLogic()
    useRegisterScoreFiltersExp()
    useEffect(() => {
        actions.initFilters()
        if (!globalStorage.get('authShowedAfterMigration')) {
            globalStorage.set('authShowedAfterMigration', true)
            if (!isAuth) actions.setIsVisible(true)
        }
    }, [actions, isAuth])

    const onOpenFiltersPress = useCallback(() => {
        Keyboard.dismiss()
        reportEvent(MetricaEvents.BROWSE_FILTERS_SHOW)
        reportEvent(MetricaEvents.BROWSE_SEARCH_BADGE_CLICK, { type: 'official' })
        sheetRef.current?.present()
    }, [])
    const onClose = useCallback(() => sheetRef.current?.dismiss(), [])

    const isSearchActive = !!(selectedFilterParamsQuantity || searchTerm || sort !== 'relevance')
    const listHeader = useMemo(
        () => (
            <>
                <CorrectQueryView />
                <ScoreListHeader isSearchActive={isSearchActive} />
            </>
        ),
        [isSearchActive],
    )

    const headerContent = (
        <>
            <ExploreHeader onOpenFiltersPress={onOpenFiltersPress} />
        </>
    )

    return (
        <ScrollableHeaderProvider headerContent={headerContent}>
            <View style={styles.container}>
                <ScoreListWithPadding ref={listRef} listHeader={listHeader} />
                <ScoreSuggestionsList />
                <FloatingButtonContainer isShowLearnPlan={false} />
                <CheckSaleSplash />
                {platform.isIos && <AppleWatchMetronomeContainer />}
                <FiltersBottomSheet sheetRef={sheetRef} onClose={onClose} />
                <ScoresAfterTourTrigger />
            </View>
        </ScrollableHeaderProvider>
    )
})

export const ScreenExplore = memo(() => {
    return <ScreenExploreInternal />
})
