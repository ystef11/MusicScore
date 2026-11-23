import type { AnnotationPage } from 'react-native-pdf-light'

import { DispatchFun, GetStateFun } from '@mu-native/common'
import { scoreStoreChunk } from '@mu-native/score'

import SentryUtils from '../../../../App/Utils/Sentry.ts'
import { fetchAnnotationsFromUrl, saveScoreAnnotation } from '../../services/annotationService.ts'

/**
 * Fetch the annotations JSON file from the signed URL supplied by
 * `/score/info` and push the result into the store. No-op + silent on
 * failure – annotations should not break the score viewing flow.
 */
function loadAnnotations(url: string) {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        const startingScoreId = scoreStoreChunk.props.getCurrentScore(getState())?.id
        const annotations = await fetchAnnotationsFromUrl(url)
        // Bail if the user already navigated to a different score while we waited.
        const currentScoreId = scoreStoreChunk.props.getCurrentScore(getState())?.id
        if (currentScoreId !== startingScoreId) {
            return
        }

        dispatch(scoreStoreChunk.actions.setPdfAnnotations(annotations))
        dispatch(scoreStoreChunk.actions.setArePdfAnnotationsReady(true))
    }
}

/**
 * Persist the supplied annotations to the backend via upsert.
 */
function saveAnnotations(annotations: AnnotationPage[]) {
    return async (_dispatch: DispatchFun, getState: GetStateFun) => {
        const scoreId = scoreStoreChunk.props.getCurrentScore(getState())?.id
        if (!scoreId) return

        try {
            await saveScoreAnnotation(scoreId, annotations)
        } catch (error) {
            SentryUtils.sendMessage('saveAnnotations', error)
            throw error
        }
    }
}

export const annotationThunks = {
    loadAnnotations,
    saveAnnotations,
}
