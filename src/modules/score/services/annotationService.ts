import type { AnnotationPage } from 'react-native-pdf-light'

import { apiRequest, scoreContracts } from '@mu-native/api'

export const ANNOTATION_SCHEMA_VERSION = 1

/**
 * Download annotations from the signed S3 URL supplied by `/score/info`.
 * The link is short-lived (~15 min) and does not go through the API layer.
 * Returns null on any failure (404, expired signature, malformed JSON).
 */
export const fetchAnnotationsFromUrl = async (url: string): Promise<AnnotationPage[] | null> => {
    try {
        const response = await fetch(url)
        if (!response.ok) return null
        const data = await response.json()
        return Array.isArray(data) ? (data as AnnotationPage[]) : null
    } catch (e) {
        return null
    }
}

/**
 * Upsert the current user's annotations for a score.
 */
export const saveScoreAnnotation = async (
    scoreId: number,
    annotations: AnnotationPage[],
): Promise<void> => {
    await apiRequest(scoreContracts.saveAnnotation, {
        payload: {
            score_id: scoreId,
            json: JSON.stringify(annotations),
            version: ANNOTATION_SCHEMA_VERSION,
        },
    })
}
