import { TFiltersAPIData } from '../types/searchTypes'

export const convertBrowseFiltersData = (data: TFiltersAPIData) => ({
    instrument: data.instrument,
    genres: data.genres,
    license: data.license,
    complexity: data.complexity,
    instrumentation: data.instrumentation,
    type: data.type,
    recordingType: data.recording_type,
    scoreFormat: data.score_format,
})

export type TBrowseFilters = ReturnType<typeof convertBrowseFiltersData>
