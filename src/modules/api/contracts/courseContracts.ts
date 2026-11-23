import { apiEndpoints } from '../../muse-native-api/apiMethods'
import type {
    TCourseCommentPayloadDto,
    TCourseCommentsDto,
    TCourseContentDto,
    TCourseFeedbackPayloadDto,
    TCourseFilterOptionsDto,
    TCourseInfoDto,
    TCourseListDto,
    TCourseSearchParamsDto,
    TCourseSectionsDto,
    TPurchasedCoursesDto,
} from '../dto/courseDto'

import { defineContract } from './defineContract'

export const courseContracts = {
    /** Curated carousels of the courses landing. */
    sections: defineContract.get<TCourseSectionsDto>(apiEndpoints.courseSection, {
        version: null,
    }),
    /** Available filter values for the course search. */
    filterOptions: defineContract.options<TCourseFilterOptionsDto>(apiEndpoints.courseSearch, {
        version: null,
    }),
    search: defineContract.get<TCourseListDto, TCourseSearchParamsDto>(apiEndpoints.courseSearch, {
        version: '1.1',
        paginated: true,
    }),
    /** Same shape and filters as `search`, restricted to the user's favourites. */
    favorites: defineContract.get<TCourseListDto, TCourseSearchParamsDto>(
        apiEndpoints.courseFavorite,
        { version: '1.2', paginated: true },
    ),
    addFavorite: defineContract.post<unknown, { course_id: string }>(apiEndpoints.courseFavorite, {
        version: '1.1',
    }),
    removeFavorite: defineContract.delete<unknown, { course_id: string }>(
        apiEndpoints.courseFavorite,
        { version: '1.1' },
    ),
    /** Responds 404 (`global.not_found`) instead of an empty list when the user bought nothing. */
    purchased: defineContract.get<TPurchasedCoursesDto>(apiEndpoints.coursePurchased, {
        version: '1.1',
    }),
    info: defineContract.get<TCourseInfoDto, { id: string; usage: 'online' | 'offline' }>(
        apiEndpoints.courseInfo,
        { version: '1.1' },
    ),
    /** Signed download link of one lesson material. */
    content: defineContract.get<TCourseContentDto, { material_id: string }>(
        apiEndpoints.courseContent,
        { version: '1.1' },
    ),
    /** Paginated via `X-Pagination-*` headers (the app reads page 1 only); 404 when the course has no comments. */
    comments: defineContract.get<TCourseCommentsDto, { course_id: string; page: number }>(
        apiEndpoints.courseComment,
        { version: '1.1' },
    ),
    addComment: defineContract.post<unknown, TCourseCommentPayloadDto>(apiEndpoints.courseComment, {
        version: '1.1',
    }),
    removeComment: defineContract.delete<unknown, { comment_id: number }>(
        apiEndpoints.courseComment,
        { version: '1.1' },
    ),
    /** Marks a lesson as started. */
    startProgress: defineContract.post<unknown, { material_id: string }>(
        apiEndpoints.courseProgressLesson,
        { version: null },
    ),
    /** Reports how far (seconds) the user got in a lesson. */
    updateProgress: defineContract.put<unknown, { material_id: string; duration: number }>(
        apiEndpoints.courseProgressLesson,
        { version: '1.1' },
    ),
    /** Rejects with 422 when the user already voted. */
    rate: defineContract.post<unknown, { id: string; rating: number }>(apiEndpoints.courseRating, {
        version: '1.1',
    }),
    sendFeedback: defineContract.post<unknown, TCourseFeedbackPayloadDto>(
        apiEndpoints.courseFeedback,
        { version: '1.1' },
    ),
    buyByCredit: defineContract.post<unknown, { course_id: string }>(apiEndpoints.courseBuy, {
        version: '1.1',
    }),
}
