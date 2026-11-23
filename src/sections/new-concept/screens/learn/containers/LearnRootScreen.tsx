import { useIsNewAppConcept } from '@mu-native/ab'
import { courseBrowseStoreChunk } from '@mu-native/course-browse'
import { PerformanceScreen, TrackedScreen, useHasLoaded } from '@mu-native/performance'
import { useValues } from '@ug/store'

import ScreenCourses from '../../../../../App/Courses/ScreenCourses'

import { LearnScreen } from './LearnScreen'

// A/B gate: the test group sees the new-concept Learn catalog, the control group
// keeps the legacy ScreenCourses. Both must keep working in parallel.
export const LearnRootScreen = () => {
    const isNewConcept = useIsNewAppConcept()
    const [isLoading] = useValues([courseBrowseStoreChunk.props.getIsLoading])
    const hasLoaded = useHasLoaded(isLoading)

    if (isNewConcept) {
        return <LearnScreen />
    }

    return (
        <TrackedScreen screenName={PerformanceScreen.courses} interactive={hasLoaded}>
            <ScreenCourses />
        </TrackedScreen>
    )
}
