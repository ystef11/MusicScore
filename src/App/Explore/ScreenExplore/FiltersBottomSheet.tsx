import { memo, Ref } from 'react'

import { NativeBottomSheet, NativeBottomSheetRef } from '@mu-native/ds'
import { browseFilterSelections, getBrowseFilters } from '@mu-native/search'
import { useValues } from '@ug/store'

import { exploreScoreListStoreChunk } from '../exploreScoreListStoreChunk.ts'
import { ScreenFilterNew } from '../Filter/ScreenFilterNew.tsx'

export const FiltersBottomSheet = memo(
    ({ sheetRef, onClose }: { sheetRef: Ref<NativeBottomSheetRef>; onClose: () => void }) => {
        const [filters] = useValues([getBrowseFilters])

        return (
            <NativeBottomSheet ref={sheetRef}>
                <ScreenFilterNew
                    onClose={onClose}
                    storeChunk={exploreScoreListStoreChunk}
                    filters={filters}
                    selections={browseFilterSelections}
                />
            </NativeBottomSheet>
        )
    },
)
