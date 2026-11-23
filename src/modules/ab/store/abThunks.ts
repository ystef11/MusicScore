import { Alert } from 'react-native'

import { TThunkAction } from '@mu-native/common'
import { checkConnection } from '@mu-native/system'

import Sentry from '../../../App/Utils/Sentry'
import { convertAbSession } from '../dataConverters/convertAbSession'
import { abServices } from '../services/abServices'
import { abStorage } from '../storages/abStorage'
import { TABResponse } from '../types/abTypes'

import { abStoreChunk, getExperimentsIds } from './abStoreChunk.ts'

const setUnifiedId: TThunkAction<string | null | undefined> =
    (unifiedId: string | null | undefined) => dispatch => {
        const storageUnifiedId = abStorage.get('unifiedId')
        if (!storageUnifiedId && unifiedId) {
            abStorage.set('unifiedId', unifiedId)
            dispatch(abStoreChunk.actions.setUnifiedId({ unifiedId }))
        }
    }

const recursivelyRequestUnifiedId: TThunkAction<number> = attempt => async dispatch => {
    if (attempt === 10) return

    const storageUnifiedId = abStorage.get('unifiedId')

    if (!storageUnifiedId) {
        try {
            checkConnection(false)
            const { unified_id: unifiedId, session } = await abServices.getExperiments()
            dispatch(setUnifiedId(unifiedId))
            // Keeps the requests that follow on this server session instead of each opening a new one.
            dispatch(abStoreChunk.actions.setSession({ session: convertAbSession(session) }))
        } catch (e) {
            const timeout = 2 ** attempt * 1000 // ms, exponential backoff
            setTimeout(() => dispatch(recursivelyRequestUnifiedId(attempt + 1)), timeout)
        }
    }
}

export const updateUnifiedId: TThunkAction = () => async dispatch => {
    try {
        const storageUnifiedId = abStorage.get('unifiedId')

        if (!storageUnifiedId) {
            const { unified_id: unifiedId, session } = await abServices.getExperiments()
            dispatch(setUnifiedId(unifiedId))
            dispatch(abStoreChunk.actions.setSession({ session: convertAbSession(session) }))
        }
    } catch (error) {
        Sentry.sendMessage('updateUnifiedId', error)
        dispatch(recursivelyRequestUnifiedId(0))
    } finally {
        dispatch(abStoreChunk.actions.setIsUnifiedIdLoading(false))
    }
}

export const getExperiments: TThunkAction<0 | 1 | 2> = resetMode => async dispatch => {
    try {
        const response = await abServices.getExperiments()
        console.log('@@get ab info response', response)
        const experimentsModifier = abServices.rewrittenExperiments
        console.log('@@get ab info experimentsModifier', experimentsModifier)

        let mergedResponse: TABResponse = {
            ...response,
            experiments: {
                ...response.experiments,
                ...experimentsModifier.experiments,
            },
        }

        if (experimentsModifier.reset_all_experiments) {
            const allExperimentsWithVariation1: Record<string, number> = {}

            Object.keys(mergedResponse.experiments || {}).forEach(experimentId => {
                allExperimentsWithVariation1[experimentId] = 1
            })

            mergedResponse = {
                ...mergedResponse,
                experiments: allExperimentsWithVariation1,
            }

            console.log('@@all experiments reset to variation 1', allExperimentsWithVariation1)
        }

        console.log('@@get ab info mergedResponse', mergedResponse)

        const { unified_id: unifiedId } = mergedResponse
        dispatch(setUnifiedId(unifiedId))

        if (resetMode === 1) mergedResponse.override_bundle = true

        if (resetMode === 2) mergedResponse.override_cache = true

        dispatch(abStoreChunk.actions.setABData(mergedResponse))
    } catch (error) {
        console.log('@@get ab info error', error)
    } finally {
        dispatch(abStoreChunk.actions.setExperimentsLoaded(true))
    }
}

export const setVariation: TThunkAction<number> = variation => async (dispatch, getState) => {
    try {
        const state = getState()
        const experiment =
            abStoreChunk.props.getExperiments(state)[abStoreChunk.props.getExperimentIndex(state)]

        dispatch(abStoreChunk.actions.setVariation(variation))

        await abServices.setVariation(experiment.id, variation)
        dispatch(getExperiments(0))
    } catch (error) {
        Alert.alert(JSON.stringify(error))
    }
}

export const updateSession: TThunkAction = () => async () => {}
