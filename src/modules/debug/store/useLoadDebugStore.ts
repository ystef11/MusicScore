import { useInjectStoreChunk } from '@ug/store'

import { debugStore } from './debugStoreChunk'

export const useLoadDebugStore = () => {
    useInjectStoreChunk(debugStore, 'modules', debugStore.getInitialState())
}
