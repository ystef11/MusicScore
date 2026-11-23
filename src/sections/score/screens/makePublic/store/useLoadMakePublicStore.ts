import { useInjectStoreChunk } from '@ug/store'

import makePublicStoreChunk from './makePublicStoreChunk.ts'

const useLoadMakePublicStore = () => {
    useInjectStoreChunk(makePublicStoreChunk, 'screens')
}

export default useLoadMakePublicStore
