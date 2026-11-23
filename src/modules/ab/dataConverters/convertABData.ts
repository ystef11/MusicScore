/* eslint-disable camelcase */
import { platform } from '@mu-native/common'
import { abStorage } from '../storages/abStorage'
import { TAbState } from '../store/abStoreChunk'
import type { TABResponse, TExperiment } from '../types/abTypes'

import { convertAbSession } from './convertAbSession'

export const convertABData = (
    {
        closed_experiments,
        experiments: incomeExperiments,
        experiments_files,
        experiments_names,
        experiments_variations_count,
        override_bundle,
        override_cache,
        session,
    }: TABResponse,
    state: TAbState,
) => {
    const closedEntries = !Array.isArray(closed_experiments)
        ? Object.entries(closed_experiments).map(([key, variation]) => ({
              id: +key,
              variation,
              file: null,
              name: key,
              variationsCount: variation,
          }))
        : []
    const entries = (!Array.isArray(incomeExperiments) && Object.entries(incomeExperiments)) || []
    const persistedExperiments = state.experiments

    const experiments: TExperiment[] = entries?.map(([key, value]) => {
        let result: TExperiment = {
            file: !Array.isArray(experiments_files)
                ? experiments_files[key]?.[platform.isTablet ? 'file_tablet' : 'file_phone'] || null
                : null,
            id: +key,
            name: experiments_names?.[key] || key,
            variation: value,
            variationsCount: !Array.isArray(experiments_variations_count)
                ? experiments_variations_count[key]
                : 0,
        }

        if (!override_cache) {
            if (!result.file && !override_bundle) {
                result = persistedExperiments.find(item => item.id === +key) || result
            }
        }

        return result
    })

    return {
        ...state,
        experiments: [...experiments, ...closedEntries],
        session: convertAbSession(session),
    }
}
