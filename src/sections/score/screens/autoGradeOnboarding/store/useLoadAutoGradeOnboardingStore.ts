import { useInjectStoreChunk } from '@ug/store'

import { autoGradeOnboardingScreenStoreChunk } from './autoGradeOnboardingScreenStoreChunk'

const useLoadAutoGradeOnboardingScreenStore = () => {
    useInjectStoreChunk(
        autoGradeOnboardingScreenStoreChunk,
        'screens',
        autoGradeOnboardingScreenStoreChunk.getInitialState(),
    )
}

export default useLoadAutoGradeOnboardingScreenStore
