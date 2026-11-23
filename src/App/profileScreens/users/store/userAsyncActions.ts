import { isResponse } from '@mu-native/api'
import { authStoreChunk, getIsAuthorized, getUserId } from '@mu-native/auth'
import { translate } from '@mu-native/locale'
import { NavigationService, navigationThunks, Screen } from '@mu-native/navigation'

import MetricaEvents from '../../../constants/MetricaEvents'
import { getScoreMetaEvent } from '../../../constants/scoreAnalytic'
import { countersStoreChunk } from '../../../Library/countersStoreChunk'
import { MSScoreT } from '../../../Model/MSScore'
import { State } from '../../../Reducers/Types'
import reportEvent from '../../../Utils/Analytics'
import SentryUtils from '../../../Utils/Sentry'
import {
    requestAddScoreToSet,
    requestCreateNewSet,
    requestDeleteScoreToSet,
    requestDeleteSet,
    requestSetUpdate,
} from '../userService'
import { SetT } from '../userTypes'
import {
    createLocalSet, deleteLocalSet, LOCAL_SETS_OWNER, removeLocalScoreFromSet,
    updateLocalScoreMembership, updateLocalSet,
} from '../localScoreSets'

export async function addScoreToSetAsync(setId: number, score: MSScoreT) {
    try {
        reportEvent(MetricaEvents.SET_SCORE_ADD, { item: 'score', item_id: score.id })
        const isSuccess = await requestAddScoreToSet(setId, score.id)
        if (!isSuccess) return false
        reportEvent(MetricaEvents.SET_SCORE_ADD_SUCCESS, getScoreMetaEvent(score))
        return true
    } catch (error) {
        reportEvent(MetricaEvents.SET_SCORE_ADD_FAIL)
        SentryUtils.sendMessage('addScoreToSetAsync', error)
        return false
    }
}

export async function createNewSetAsync(
    title: string,
    description: string,
    isPrivate: boolean,
    score?: MSScoreT,
    ownerId?: number,
): Promise<SetT | string | undefined> {
    try {
        if (ownerId === LOCAL_SETS_OWNER) return createLocalSet(title, description, score)
        const response = await requestCreateNewSet(title, description, isPrivate)
        if (typeof response === 'string') return response
        if (!response) return undefined
        reportEvent(MetricaEvents.SET_NEW_CREATE_SUCCESS, {
            type: isPrivate ? 'private' : 'public',
            item: 'set',
            item_id: response.id,
        })
        if (score) await addScoreToSetAsync(response.id, score)
        return response
    } catch (error) {
        reportEvent(MetricaEvents.SET_NEW_CREATE_FAIL)
        SentryUtils.sendMessage('createNewSetAsync', error)
        if (isResponse(error)) {
            return (await error.json()).message
        }
        return undefined
    }
}

export async function updateSetAsync(
    setId: number,
    title: string,
    description: string,
    isPrivate: boolean,
    scores: number[],
    ownerId: number,
): Promise<SetT | undefined> {
    try {
        if (ownerId === LOCAL_SETS_OWNER) return updateLocalSet(setId, title, description, scores)
        return (await requestSetUpdate(setId, title, description, isPrivate, scores)) ?? undefined
    } catch (error) {
        SentryUtils.sendMessage('updateSetAsync', error)
        return undefined
    }
}

export async function deleteSetAsync(setId: number, ownerId: number) {
    try {
        if (ownerId === LOCAL_SETS_OWNER) return deleteLocalSet(setId)
        await requestDeleteSet(setId)
        reportEvent(MetricaEvents.SET_DELETE_SUCCESS, {
            item: 'set',
            item_id: setId,
        })
        return true
    } catch (error) {
        SentryUtils.sendMessage('deleteSetAsync', error)
        return false
    }
}
export function deleteSet(setId: number | undefined) {
    return async (
        dispatch: (...args: Array<any>) => any,
        getState: (...args: Array<any>) => State,
    ) => {
        try {
            if (!setId) return
            const user = authStoreChunk.props.getUser(getState())
            await requestDeleteSet(setId)
            // await dispatch(fetchSets(user.id!))
            reportEvent(MetricaEvents.SET_DELETE_SUCCESS, {
                item: 'set',
                item_id: setId,
            })
            dispatch(navigationThunks.setScreen('MyProfileSet'))
            NavigationService.navigate(Screen.profileSet, {
                userId: user.id,
                userName: translate('native.user.my'),
            })
        } catch (error) {
            SentryUtils.sendMessage('deleteSet', error)
        }
    }
}
function getSetsOwner(state: State) {
    return (getIsAuthorized(state) && getUserId(state)) || LOCAL_SETS_OWNER
}

export function addIntoSet(score: MSScoreT) {
    return (_dispatch: (...args: Array<any>) => any, getState: () => State) => {
        NavigationService.navigate(Screen.addSet, { score, userId: getSetsOwner(getState()) })
    }
}

export function openMySets() {
    return (dispatch: (...args: Array<any>) => any, getState: () => State) => {
        const state = getState()
        dispatch(navigationThunks.setScreen('MyProfileSet'))
        NavigationService.navigate(Screen.profileSet, {
            userId: getSetsOwner(state),
            userName: translate('native.user.my'),
            customScreenName: 'LibraryMySets',
        })
        reportEvent(MetricaEvents.SETS_OPEN, {
            type: 'my',
            elements: countersStoreChunk.props.getCounters(state).set_count,
        })
    }
}

export async function deleteScoreInSet(setId: number, score_id: number, ownerId: number) {
    try {
        if (ownerId === LOCAL_SETS_OWNER) return removeLocalScoreFromSet(setId, score_id)
        const isSuccess = await requestDeleteScoreToSet(setId, score_id)
        if (!isSuccess) return false
        reportEvent(MetricaEvents.SET_SCORE_DELETE_SUCCESS, {
            item: 'score',
            item_id: score_id,
        })
        return true
    } catch (error) {
        SentryUtils.sendMessage('deleteScoreInSet', error)
    }
    return false
}

export async function updateScoreInSets(
    score: MSScoreT,
    data: { deleted: number[]; added: number[] },
    ownerId: number,
) {
    const { deleted, added } = data
    if (ownerId === LOCAL_SETS_OWNER) return updateLocalScoreMembership(score, deleted, added)
    const promises: Promise<boolean>[] = []
    if (deleted.length > 0) {
        promises.push(...deleted.map(setId => deleteScoreInSet(setId, score.id, ownerId)))
    }
    if (added.length > 0) {
        promises.push(...added.map(setId => addScoreToSetAsync(setId, score)))
    }
    return (await Promise.all(promises)).every(Boolean)
}
