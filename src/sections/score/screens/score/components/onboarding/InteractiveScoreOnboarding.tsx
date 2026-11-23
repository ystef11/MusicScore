import { memo, useMemo } from 'react'

import { Rect } from '@mu-native/ds'
import { scoreStoreChunk } from '@mu-native/score'
import { useWindowDimensions } from '@mu-native/system'
import { useValues } from '@ug/store'

import { ScoreOnboardingContainer } from './ScoreOnboardingContainer.tsx'

export const InteractiveScoreOnboarding = memo(() => {
    const { width, height } = useWindowDimensions()
    const onboardingAnchorStep1 = useMemo(() => {
        return new Rect(width / 2, height / 3, 0, 0)
    }, [width, height])
    const onboardingAnchorStep4 = useMemo(() => {
        return new Rect(width / 2, height / 2, 0, 0)
    }, [width, height])

    const [onboarded] = useValues([scoreStoreChunk.props.getOnboarded])
    if (onboarded) return null

    return (
        <>
            <ScoreOnboardingContainer step={0} anchor={onboardingAnchorStep1} />
            <ScoreOnboardingContainer step={3} anchor={onboardingAnchorStep4} />
        </>
    )
})
