import { useValues } from '@ug/store'

import { systemStoreChunk } from '../store/systemStoreChunk.ts'

export const useOrientation = () => {
    const [orientation] = useValues([systemStoreChunk.props.getOrientation])
    return orientation
}
