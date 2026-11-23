import { AnyAction } from 'redux'
import { ThunkAction } from 'redux-thunk'

import { TCommonState } from './state'

/**
 * создает shared action creator, который может быть использован более чем в одном reducer
 *
 * @typeparam TProps  параметр action creator, который попадет потом в payload самого action
 * @param {String} type  имя action
 */
export const createAction = <T = void>(type: string) => {
    const execute = (payload: T) => ({
        type,
        payload,
    })
    execute.toString = () => `${type}`
    return execute
}

export const resetStoreState = createAction('global/resetState')

export const reloadPersistedState = createAction('global/resetPersistedState')

type TUnknownObject = Record<string, unknown>

/**
 * базовый тип для thunk action
 *
 * @typeparam T  параметр action
 * @typeparam TInjected - все заинжекченые сущности
 */
type ThunkActionResult = Promise<void> | void

export type TThunkAction<TState = TCommonState, TInjected = TUnknownObject> = ThunkAction<
    ThunkActionResult,
    TState,
    TInjected,
    AnyAction
>

export type TAsyncAction = TThunkAction

export type TThunkBaseAction<TProp, TInjected = TUnknownObject> = (
    prop: TProp,
) => TThunkAction<TCommonState, TInjected>

export type TThunkBaseActionR<TReturn, TProp = void, TInjected = TUnknownObject> = (
    prop: TProp,
) => ThunkAction<Promise<TReturn>, TCommonState, TInjected, AnyAction>

export type TBaseAsyncAction<TProp, TInjected = TUnknownObject> = TThunkBaseAction<TProp, TInjected>

export const getLoadableActionCreator = <T extends Record<string, TBaseAsyncAction<any, any>>>(
    getLoader: () => Promise<T>,
) => {
    return <X extends keyof T>(name: X) => {
        type TFirstParam = Parameters<T[X]>[0]
        type TProps = TFirstParam extends undefined ? void : TFirstParam

        return (props: TProps): TThunkAction => {
            return async dispatch => {
                const { [name]: action } = await getLoader()

                dispatch(action(props))
            }
        }
    }
}
