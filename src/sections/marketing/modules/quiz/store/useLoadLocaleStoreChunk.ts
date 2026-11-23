import { useInjectStoreChunk } from '@ug/store'

import { quizStoreChunk } from './quizStoreChunk'

export const useLoadQuizStoreChunk = () => {
    useInjectStoreChunk(quizStoreChunk, 'modules', quizStoreChunk.getInitialState())
}
