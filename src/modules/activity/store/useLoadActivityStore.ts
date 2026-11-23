import { useInjectStoreChunk } from '@ug/store'
import { activityModuleStoreChunk } from './activityStoreChunk'

export const useLoadActivityStore = () => {
    useInjectStoreChunk(activityModuleStoreChunk, 'modules')
}
