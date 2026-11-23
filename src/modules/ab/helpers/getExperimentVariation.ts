import { store } from '@mu-native/common'

import { abStoreChunk } from '../store/abStoreChunk'

export const getExperimentVariation = (experimentId: number, state = store.getState()) => {
    const experiments = abStoreChunk.props.getExperiments(state)

    return experiments?.find(item => item.id === experimentId)?.variation
}
