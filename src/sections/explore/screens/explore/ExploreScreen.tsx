import { useIsNewAppConcept, useRegisterNewAppConceptExp } from '@mu-native/ab'
import { HomeScreen } from '@mu-native/new-concept-home-screen'
import { PerformanceScreen, TrackedScreen, useHasLoaded } from '@mu-native/performance'
import { useValues } from '@ug/store'

import { exploreScoreListStoreChunk } from '../../../../App/Explore/exploreScoreListStoreChunk.ts'
import { ScreenExplore } from '../../../../App/Explore/ScreenExplore/ScreenExplore.tsx'

export const ExploreScreen = () => {
    const isNewConcept = useIsNewAppConcept()
    useRegisterNewAppConceptExp()
    // The chunk is injected at app init, so it is readable above ScreenExplore
    const [isLoading] = useValues([exploreScoreListStoreChunk.props.getIsLoading])
    const hasLoaded = useHasLoaded(isLoading)

    if (isNewConcept) {
        return <HomeScreen />
    }

    return (
        <TrackedScreen screenName={PerformanceScreen.browse} interactive={hasLoaded}>
            <ScreenExplore />
        </TrackedScreen>
    )
}
