import { useInjectStoreChunk } from '@ug/store'
import { tourInstallScreenStoreChunk } from './tourInstallScreenStoreChunk'

export const useLoadTourInstallScreenStore = () => {
    useInjectStoreChunk(
        tourInstallScreenStoreChunk,
        'screens',
        tourInstallScreenStoreChunk.getInitialState(),
    )
}
