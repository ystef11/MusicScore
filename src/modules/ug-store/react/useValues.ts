import { useCallback } from 'react'
import { useSelector } from 'react-redux'

type TUnknownFn = (...rest: any[]) => any

type TReturn<T> = {
    [P in keyof T]: T[P] extends TUnknownFn ? ReturnType<T[P]> : never
}

const shallowEqualArrays = (arrA?: unknown[], arrB?: unknown[]) => {
    if (arrA === arrB) return true
    if (!arrA || !arrB) return false

    const len = arrA.length

    if (arrB.length !== len) return false

    for (let i = 0; i < len; i++) {
        if (arrA[i] !== arrB[i]) return false
    }
    return true
}

/**
 * хук для извлечения значений из store, по селекторам store
 * @param values массив селекторов
 * @param deps массив зависимостей, которые приведут к обновлению селектора
 *
 */
const useValues = <T extends any[]>(values: T, deps: unknown[] = []) => {
    const selector = useCallback((state: any) => values.map(fn => fn(state)), deps)
    return useSelector(selector, shallowEqualArrays) as TReturn<typeof values>
}

export default useValues
