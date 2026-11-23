import { createExtendedStoreChunk } from '@ug/store'

type TOfflineScoresModuleState = {
    fileProcessingState: {
        progress: number
        status: 'start' | 'open' | 'copy' | 'load_fonts' | null
    }
}

export const offlineScoresStoreChunk = createExtendedStoreChunk<TOfflineScoresModuleState>({
    treeKey: 'modules',
    storeKey: 'offlineScores',
})({
    initialState: {
        fileProcessingState: {
            progress: 0,
            status: null,
        },
    },
    actions: {
        updateFileProcessingState: ({
            progress,
            status,
        }: TOfflineScoresModuleState['fileProcessingState']) => {
            return {
                fileProcessingState: { progress, status },
            }
        },
    },
})
