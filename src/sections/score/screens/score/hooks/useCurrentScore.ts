import { scoreStoreChunk } from '@mu-native/score'
import { useValues } from '@ug/store'

export const useCurrentScore = () => {
    const [score] = useValues([scoreStoreChunk.props.getCurrentScore])
    return score
}
