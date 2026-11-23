/* eslint-disable no-param-reassign */
import { useMemo } from 'react'
// eslint-disable-next-line
// @ts-ignore
import { useDispatch } from 'react-redux'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ITFunction = (...args: any[]) => any
type TObject = Record<string, ITFunction>

/**
 * Если action creator возвращает функцию (ThunkAction),
 * то dispatch вернёт результат вызова этой функции.
 * Иначе — возвращает как есть (plain action).
 */
type DispatchResult<T> = T extends (...args: any[]) => infer R ? R : T

type BoundAction<F extends ITFunction> = (...args: Parameters<F>) => DispatchResult<ReturnType<F>>

type BoundActions<T extends TObject> = {
    [K in keyof T]: BoundAction<T[K]>
}

const useActionsR = <T extends TObject>(actions: T): BoundActions<T> => {
    const dispatch = useDispatch()

    return useMemo(() => {
        return Object.keys(actions).reduce<BoundActions<T>>((result, actionName) => {
            const action = actions[actionName]
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            result[actionName as keyof T] = (...props: any[]) => dispatch(action(...props))
            return result
        }, {} as BoundActions<T>)
    }, [])
}

export default useActionsR