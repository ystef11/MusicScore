import { showAlertNotification } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { scoreStoreChunk } from '@mu-native/score'

import { performGetScoreInfoRequest } from '../../../../../App/Services/ScoreInfoProvider.ts'
import reportEvent from '../../../../../App/Utils/Analytics'
import {
    fetchReferenceData,
    mapLicense,
    searchSongs,
    updateScore,
} from '../services/makePublicApi.ts'

import makePublicStoreChunk from './makePublicStoreChunk.ts'

function getFormEventParams(getState: any) {
    const access = makePublicStoreChunk.props.getAccess(getState())
    const basedOnExisting = makePublicStoreChunk.props.getBasedOnExisting(getState())
    const songId = makePublicStoreChunk.props.getSongId(getState())
    const copyright = makePublicStoreChunk.props.getCopyright(getState())
    const showParts = makePublicStoreChunk.props.getShowParts(getState())
    const enableDownload = makePublicStoreChunk.props.getEnableDownload(getState())
    const genres = makePublicStoreChunk.props.getGenres(getState())
    const placement = makePublicStoreChunk.props.getPlacement(getState())

    let compositionType = 'none'
    if (basedOnExisting) {
        compositionType = songId ? 'existing_id' : 'custom_name'
    }

    return {
        'params.key': [
            'placement',
            'access',
            'based_on_existing',
            'composition_type',
            'copyright',
            'show_parts',
            'enable_download',
            'genres_count',
        ],
        'params.str_value': [placement ?? '', '', '', compositionType, copyright, '', '', ''],
        'params.value': [
            0,
            access,
            basedOnExisting ? 1 : 0,
            0,
            0,
            showParts ? 1 : 0,
            enableDownload ? 1 : 0,
            genres.length,
        ],
    }
}

export function loadReferenceData() {
    return async (dispatch: any) => {
        dispatch(makePublicStoreChunk.actions.setIsLoadingReference(true))

        try {
            const data = await fetchReferenceData()
            dispatch(makePublicStoreChunk.actions.setReferenceGenres(data.genres.all))
        } catch {
            dispatch(
                makePublicStoreChunk.actions.setError(
                    translate('native.make_public.error_generic'),
                ),
            )
        } finally {
            dispatch(makePublicStoreChunk.actions.setIsLoadingReference(false))
        }
    }
}

export function searchSongsByQuery(query: string) {
    return async (dispatch: any) => {
        if (query.length < 2) {
            dispatch(makePublicStoreChunk.actions.setSongResults([]))
            return
        }

        try {
            const results = await searchSongs(query)
            dispatch(makePublicStoreChunk.actions.setSongResults(results))
        } catch {
            dispatch(makePublicStoreChunk.actions.setSongResults([]))
        }
    }
}

export function submitMakePublic() {
    return async (dispatch: any, getState: any) => {
        const scoreId = makePublicStoreChunk.props.getScoreId(getState())
        const title = makePublicStoreChunk.props.getTitle(getState())
        const description = makePublicStoreChunk.props.getDescription(getState())
        const genres = makePublicStoreChunk.props.getGenres(getState())
        const basedOnExisting = makePublicStoreChunk.props.getBasedOnExisting(getState())
        const songId = makePublicStoreChunk.props.getSongId(getState())
        const composition = makePublicStoreChunk.props.getComposition(getState())
        const access = makePublicStoreChunk.props.getAccess(getState())
        const copyright = makePublicStoreChunk.props.getCopyright(getState())

        if (!scoreId) return false

        dispatch(makePublicStoreChunk.actions.setIsSubmitting(true))
        dispatch(makePublicStoreChunk.actions.setError(null))

        reportEvent(RT_EVENTS.SCORE_MAKE_PUBLIC_SUBMIT, {
            score_id: String(scoreId),
            ...getFormEventParams(getState),
        })

        try {
            await updateScore({
                scoreId,
                title,
                description,
                privacy: access,
                license: mapLicense(copyright),
                genres,
                songId: basedOnExisting ? songId : null,
                songName:
                    basedOnExisting && !songId && composition.trim() ? composition.trim() : null,
                isOrigin: !basedOnExisting,
            })

            try {
                const scoreInfo = await performGetScoreInfoRequest(scoreId, 'ONLINE', false, false)
                dispatch(scoreStoreChunk.actions.setCurrentScore(scoreInfo.score))
            } catch {
                // Score was updated successfully, metadata refetch is best-effort
            }

            showAlertNotification({
                title: translate('native.make_public.success_toast'),
                expiresIn: 3000,
            })

            dispatch(makePublicStoreChunk.actions.reset())
            return true
        } catch {
            reportEvent(RT_EVENTS.SCORE_MAKE_PUBLIC_ERROR, {
                score_id: String(scoreId),
                ...getFormEventParams(getState),
            })
            dispatch(
                makePublicStoreChunk.actions.setError(
                    translate('native.make_public.error_generic'),
                ),
            )
            return false
        } finally {
            dispatch(makePublicStoreChunk.actions.setIsSubmitting(false))
        }
    }
}
