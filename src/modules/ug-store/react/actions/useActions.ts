/* eslint-disable no-param-reassign */
import { useMemo } from 'react'
// eslint-disable-next-line
// @ts-ignore
import { useDispatch } from 'react-redux'

// any не трогать, иначе не будут на лету подхватываться аргументы оригинальных экшенов
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ITFunction = (...args: any[]) => any
type TObject = Record<string, ITFunction>

const useActions = <T extends TObject>(actions: T): typeof actions => {
    const dispatch = useDispatch()

    return useMemo(() => {
        return Object.keys(actions).reduce<typeof actions>((result, actionName) => {
            const action = actions[actionName]
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            result[actionName] = (...props: Parameters<typeof action>) => dispatch(action(...props))
            return result
        }, {} as typeof actions)
    }, [])
}

export default useActions
