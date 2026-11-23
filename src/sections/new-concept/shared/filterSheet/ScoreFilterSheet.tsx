import React from 'react'

import { NativeBottomSheet, NativeBottomSheetRef } from '@mu-native/ds'
import { browseFilterSelections, FilterSelectionsSource, TRenderFilters } from '@mu-native/search'

import { exploreScoreListStoreChunk } from '../../../../App/Explore/exploreScoreListStoreChunk'

import { ScoreFilterSheetContent } from './ScoreFilterSheetContent'

type TSearchThunk = (
    chunk: typeof exploreScoreListStoreChunk,
    searchTerm: string,
) => (dispatch: any, getState?: any) => Promise<unknown> | unknown

type Props = {
    sheetRef: React.RefObject<NativeBottomSheetRef | null>
    chunk: typeof exploreScoreListStoreChunk
    filters: TRenderFilters | undefined
    onClose: () => void
    // Defaults to the global Browse selection; pass an encapsulated source to
    // keep the sheet's edits scoped to a single screen.
    selections?: FilterSelectionsSource
    onSearch?: TSearchThunk
}

export const ScoreFilterSheet = ({
    sheetRef,
    chunk,
    filters,
    onClose,
    selections = browseFilterSelections,
    onSearch,
}: Props) => (
    <NativeBottomSheet ref={sheetRef}>
        <ScoreFilterSheetContent
            onClose={onClose}
            storeChunk={chunk}
            filters={filters}
            selections={selections}
            onSearch={onSearch}
        />
    </NativeBottomSheet>
)
