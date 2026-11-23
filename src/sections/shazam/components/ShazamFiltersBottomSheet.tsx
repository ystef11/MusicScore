import { LegacyRef, memo } from 'react'

import { NativeBottomSheet, NativeBottomSheetRef } from '@mu-native/ds'
import {
    getShazamFilterParams,
    shazamFilterSelections,
    shazamScoreListStoreChunk,
    shazamSearchThunks,
} from '@mu-native/shazam'
import { useValues } from '@ug/store'

import { ScreenFilterNew } from '../../../App/Explore/Filter/ScreenFilterNew.tsx'

type Props = {
    sheetRef: LegacyRef<NativeBottomSheetRef>
    onClose: () => void
}

export const ShazamFiltersBottomSheet = memo(({ sheetRef, onClose }: Props) => {
    const [filters] = useValues([getShazamFilterParams])
    return (
        <NativeBottomSheet ref={sheetRef}>
            <ScreenFilterNew
                onClose={onClose}
                storeChunk={shazamScoreListStoreChunk}
                filters={filters}
                selections={shazamFilterSelections}
                onSearch={shazamSearchThunks.search}
            />
        </NativeBottomSheet>
    )
})
