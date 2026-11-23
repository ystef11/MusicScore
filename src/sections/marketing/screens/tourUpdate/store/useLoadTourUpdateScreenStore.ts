import { useInjectStoreChunk } from '@ug/store'
import { tourUpdateScreenStoreChunk } from './tourUpdateScreenStoreChunk'

export const useLoadTourUpdateScreenStore = () => {
    useInjectStoreChunk(tourUpdateScreenStoreChunk, 'screens')
}
