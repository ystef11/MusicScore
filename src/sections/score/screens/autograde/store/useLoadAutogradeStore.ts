import { useInjectStoreChunk } from '@ug/store'

import autogradeScreenStoreChunk from './autogradeScreenStoreChunk.ts'

const useLoadAutogradeScreenStore = () => {
    useInjectStoreChunk(autogradeScreenStoreChunk, 'screens')
}

export default useLoadAutogradeScreenStore
