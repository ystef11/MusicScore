import { createExtendedStoreChunk } from '@ug/store'
import { createSelector } from 'reselect'

import { convertABData } from '../dataConverters/convertABData'
import type { TExperiment } from '../types/abTypes'

export type TAbState = {
    experimentIndex: number
    experiments: TExperiment[]
    experimentsLoaded: boolean
    session: { expireDuration: number; id: string; number: number | null }
    unifiedId: string | null
    isUnifiedIdLoading: boolean
    tourQuizBasedFeedVariation: number | null
}

export const abStoreChunk = createExtendedStoreChunk<TAbState>({
    treeKey: 'modules',
    storeKey: 'ab',
})({
    persist: ['experiments', 'session', 'unifiedId', 'tourQuizBasedFeedVariation'],
    initialState: {
        experimentIndex: 0,
        experiments: [],
        experimentsLoaded: false,
        session: { expireDuration: 0, id: '', number: null },
        unifiedId: null,
        isUnifiedIdLoading: true,
        tourQuizBasedFeedVariation: null,
    },
    actions: {
        setPartialFieldsCustom: (abPartialsFields: Partial<TAbState>) => ({
            ...abPartialsFields,
        }),
        setABData: convertABData,
        setSession: (updatedSession: { session: TAbState['session'] }) => {
            return {
                session: updatedSession.session,
            }
        },
        setUnifiedId: (updatedUnifiedId: { unifiedId: TAbState['unifiedId'] }) => {
            return {
                unifiedId: updatedUnifiedId.unifiedId,
            }
        },
        setVariation: (variation: TExperiment['variation'], state) => {
            const experiments = state.experiments?.map((item, index) => {
                if (state.experimentIndex === index) {
                    return { ...item, variation }
                }

                return item
            })

            return { ...state, experiments }
        },
        resetAllVariations: (_, state) => {
            const experiments = state.experiments?.map(item => ({ ...item, variation: 1 }))

            return { ...state, experiments }
        },
    },
})

export const getExperimentsIds = createSelector(abStoreChunk.props.getExperiments, experiments => {
    if (!experiments) {
        return ''
    }

    const experimentsIds = experiments.reduce(
        (acc, item) => ({ ...acc, [item.id]: item.variation }),
        {},
    )

    return JSON.stringify(experimentsIds)
})
