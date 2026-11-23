import { useEffect } from 'react'
import { useAppNavigation, useAppRoute } from '@mu-native/navigation'
import type { MSScoreT } from '../../../../App/Model/MSScore'

export const AutoGradeOnboardingScreen = () => {
    const navigation = useAppNavigation()
    const params = useAppRoute<{ uri: string; score: MSScoreT }>()
    useEffect(() => {
        navigation.replace('AutogradeScreen', params)
    }, [])
    return null
}

export { autoGradeOnboardingScreenStoreChunk } from './store/autoGradeOnboardingScreenStoreChunk'
