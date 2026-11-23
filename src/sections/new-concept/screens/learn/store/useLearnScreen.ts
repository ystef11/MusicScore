import { useMemo } from 'react'

import { fetchLearnScreen, readBlock, useScreenController } from '@mu-native/new-concept-shared'

import type { TCourse, TSection } from '../../../../../App/Courses/coursesTypes'

export type TLearnScreen = {
    isLoading: boolean
    isError: boolean
    hasData: boolean
    refresh: () => Promise<void>
    /** Started courses with progress (§9); guest → empty. */
    continueStudying: TCourse[]
    /** Catalog sections in legacy `course/section` shape (§9), continue-studying excluded. */
    sections: TSection[]
}

/**
 * Learn controller (§9): one `GET /screen/learn` returns `courses_continue_studying`
 * (a flat block) plus `sections` — the latter reuses the legacy `course/section`
 * array shape as-is (server-ordered, server-localized titles). Progress changes as
 * the user studies, so the screen re-fetches on focus.
 */
export const useLearnScreen = (): TLearnScreen => {
    const { response, isLoading, isError, hasData, refresh } = useScreenController(fetchLearnScreen)

    const continueStudying = useMemo(
        () => readBlock(response?.courses_continue_studying).items,
        [response],
    )
    const sections = useMemo(() => response?.sections ?? [], [response])

    return { isLoading, isError, hasData, refresh, continueStudying, sections }
}
