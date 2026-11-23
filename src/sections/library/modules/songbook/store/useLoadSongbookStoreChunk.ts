import { useInjectStoreChunk } from '@ug/store'
import { songbookStoreChunk } from './songbookStoreChunk'

export const useLoadSongbookStoreChunk = () => {
    useInjectStoreChunk(songbookStoreChunk, 'modules', songbookStoreChunk.getInitialState())
}
