import { useEffect } from 'react'

import { useBindTopBarScroll } from '@mu-native/ds'
import { exploreCommonStoreChunk } from '@mu-native/explore-common'
import { getFlattenedSelectedFilters, searchStoreChunk } from '@mu-native/search'
import { useActions, useValues } from '@ug/store'
import { useAnimatedRef } from 'react-native-reanimated'

import type { TScoreList } from '../../../MSComponents/MSFlashList'
import reportEvent from '../../../Utils/Analytics'

export const useExploreScreenScroll = () => {
    const listRef = useAnimatedRef<TScoreList>()
    useBindTopBarScroll(listRef)
    const actions = useActions({ setScrollToTop: exploreCommonStoreChunk.actions.setScrollToTop })
    const [filtersApplied, sortOrder] = useValues([
        getFlattenedSelectedFilters,
        searchStoreChunk.props.getSelectedSort,
    ])

    const scrollToTop = () => {
        if (listRef.current) {
            try {
                listRef?.current?.scrollToOffset({ animated: true, offset: 0 })
            } catch (error) {
                reportEvent('Dev: scroll to top', {
                    error,
                })
            }
        }
    }

    useEffect(() => {
        actions.setScrollToTop(scrollToTop)
        return () => {
            actions.setScrollToTop(null)
        }
    }, [])

    useEffect(() => {
        scrollToTop()
    }, [filtersApplied, sortOrder])

    return {
        listRef,
    }
}
