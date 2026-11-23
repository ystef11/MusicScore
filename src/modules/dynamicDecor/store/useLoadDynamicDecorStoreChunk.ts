import { useInjectStoreChunk } from '@ug/store'
import { dynamicDecorStoreChunk } from './dynamicDecorStoreChunk'

export const useLoadDynamicDecorStoreChunk = () => {
    useInjectStoreChunk(dynamicDecorStoreChunk, 'modules', dynamicDecorStoreChunk.getInitialState())
}
