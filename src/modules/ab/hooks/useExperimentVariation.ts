import { useValues } from '@ug/store'

import { abStoreChunk } from '../store/abStoreChunk'

export const useExperimentVariation = (experimentId: number) => {
    const [experiments] = useValues([abStoreChunk.props.getExperiments])

    return experiments.find(item => item.id === experimentId)?.variation || 1
}
