import { useCallback } from 'react'

import { fetchMyCourses, usePaginatedList, type TApiTabs } from '@mu-native/new-concept-shared'

import type { TCourse } from '../../../../../App/Courses/coursesTypes'

export type TMyCoursesTab = 'all' | 'saved' | 'purchased'

type TMyCourses = {
    courses: TCourse[]
    /** Tab-availability flags (§10) — same on every request; drive which chips show. */
    tabs: TApiTabs | undefined
    isLoading: boolean
    loadMore: () => void
}

// `all` is the default tab — sent with no `tab` param (§10).
const toTabParam = (tab: TMyCoursesTab) => (tab === 'all' ? undefined : tab)

/**
 * My Courses unified list (§10, `GET /v2/library/courses`): server-tabbed
 * (`all`/`saved`/`purchased`) with `_meta` pagination. Works for guests too —
 * a device-bound purchaser sees only `purchased`. Switching tab resets to
 * page 1 and invalidates in-flight pages of the previous tab. Shared by the
 * Learn landing "My courses" carousel (tab `all`) and the My Courses screen.
 */
export const useMyCourses = (tab: TMyCoursesTab): TMyCourses => {
    const fetchPage = useCallback(
        (page: number) => fetchMyCourses({ tab: toTabParam(tab), page }),
        [tab],
    )
    const { items, tabs, isLoading, loadMore } = usePaginatedList<TCourse>(fetchPage)

    return { courses: items, tabs, isLoading, loadMore }
}
