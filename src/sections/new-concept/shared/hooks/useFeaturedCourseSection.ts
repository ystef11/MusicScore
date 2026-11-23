import { useEffect, useMemo } from 'react'

import { courseBrowseStoreChunk } from '@mu-native/course-browse'
import { useActions, useValues } from '@ug/store'

import { loadSections } from '../../../../App/Courses/coursesActionsAsync'
import type { TSection } from '../../../../App/Courses/coursesTypes'

// The course catalog section featured on Home/Search: "top music courses" or
// "editor's picks" when present, the first catalog section otherwise.
export const useFeaturedCourseSection = (): TSection | undefined => {
    const [sections] = useValues([courseBrowseStoreChunk.props.getSections])
    const actions = useActions({ loadSections })

    useEffect(() => {
        if (!sections?.length) actions.loadSections()
    }, [actions, sections?.length])

    return useMemo<TSection | undefined>(() => {
        if (!sections?.length) return undefined
        return (
            sections.find(
                (section: TSection) =>
                    section.title === 'top music courses' || section.title === "editor's picks",
            ) ?? sections[0]
        )
    }, [sections])
}
