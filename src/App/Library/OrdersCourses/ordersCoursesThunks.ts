import { apiRequest, courseContracts } from '@mu-native/api'
import { getIsAuthorized } from '@mu-native/auth'
import { TCourseListDynamicStoreChunk } from '@mu-native/course-list'

import { State } from '../../Reducers/Types'
import SentryUtils from '../../Utils/Sentry'

export const updateOrdersCoursesThunk = (chunk: TCourseListDynamicStoreChunk) => {
    return async (dispatch: (...args: Array<any>) => any, getState: () => State) => {
        const isAuthorized = getIsAuthorized(getState())
        if (!isAuthorized) return

        dispatch(chunk.actions.setIsLoading(true))

        try {
            const response = await apiRequest(courseContracts.purchased)
            if (!response?.courses?.length) return
            dispatch(chunk.actions.setCourses(response.courses))
        } catch (error) {
            SentryUtils.sendMessage('updateOrdersScoresError', error)
        } finally {
            dispatch(chunk.actions.setIsLoading(false))
        }
    }
}
