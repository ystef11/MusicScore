import { createAction, reloadPersistedState, resetStoreState } from './action'
import { TTreeKey } from './init'
import type { TStorageEngine } from './persist/createPersistenceStorageManager'
import { getDefaultValues } from './persist/getDefaultValues'
import { parsePersistConfig } from './persist/normalizePersistConfig'
import {
    clearChunkPersist,
    readFromPersistStorageParsed,
    TArrayLikeConfig,
    TCustomConfig,
    TPersistConfig,
    writeToPersistStorageParsed,
} from './persist/persist'
import { removePersistDuplicates } from './persist/removePersistDuplicates'
import type { TCommonState } from './state'

type TStoreChunkProps<TState, TActions, TPersist> = {
    /** начальное состояние для редьюсера. его так же можно опставить на лету */
    initialState?: TState
    /** конфиг персистентности, описывает какие поля во внешних хранилищах,
     * должны обновиться вместе с полями состояния */
    persist?: TPersist
    /** набор экшенов конкретного reducer */
    actions?: TActions
    /**
     * тип редьюсера. мы указываем list,
     * в случае когда поставили TState типа Record<TIdType, TListItemType>
     * */
    type?: 'common' | 'list'
}

type TChunkActions<TState> = Record<string, (arg: any, state: TState) => Partial<TState>>
type TPersistEngines<TState> =
    | TArrayLikeConfig<TState>
    | Record<string, TStorageEngine<string> | TStorageEngine<Record<string, unknown>>>

/** создаем "кусок" redux store, сам reducer + набор методов к нему */
export const createStoreChunk = <
    TState extends Record<string | number, unknown>,
    TPersist extends TPersistEngines<TState> = TArrayLikeConfig<TState>,
>({
    storeKey: key,
    treeKey,
}: {
    storeKey: string
    treeKey: TTreeKey
}) => {
    const storeChunkCreator = <
        T extends Record<string, (arg: any, state: TState) => Partial<TState>>,
    >({
        initialState,
        persist,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        actions = {},
        type = 'common',
    }: TStoreChunkProps<TState, T, TCustomConfig<TState, TPersist>>) => {
        const persistConfig = removePersistDuplicates(persist as TPersistConfig<TState>)
        const parsedPersistConfig = persistConfig ? parsePersistConfig(persistConfig) : null
        let computedInitialState = initialState
        let defaultPersistValues = {}
        let storeKey = treeKey
        // recomputed in setTreeKey, since the chunk's branch can change after creation
        let actionPrefix = `${storeKey}/${key}/`

        type TActions = typeof actions
        type TAction<T> = {
            payload: T
            type: string
        }

        type TActionsMapped<T extends TActions> = {
            [TProp in keyof T]: (
                payload: Parameters<T[TProp]>[0] extends null | undefined
                    ? void
                    : Parameters<T[TProp]>[0],
            ) => TAction<Parameters<T[TProp]>[0]>
        }

        type TActionsFinal = TActionsMapped<TActions> & {
            reset(): TAction<undefined | TState>
        }

        const reducer = (
            state: TState,
            actionProps: { type: keyof typeof actions; payload: any },
        ) => {
            const reducerState = state || computedInitialState

            if (actionProps.type === reloadPersistedState.toString()) {
                const persistedData = readFromPersistStorageParsed(
                    key,
                    storeKey,
                    parsedPersistConfig,
                )

                return {
                    ...reducerState,
                    ...(persistedData || defaultPersistValues),
                }
            }

            const resetStoreStateString = resetStoreState.toString()
            if (actionProps.type === resetStoreStateString && !(resetStoreStateString in actions)) {
                return {
                    ...computedInitialState,
                    ...defaultPersistValues,
                }
            }

            let action: ((payload: any, state: TState) => Partial<TState>) | undefined

            if (actionProps.type === resetStoreStateString) {
                /**
                 * Allows the store chunk to override the default handling of the store reset action.
                 */
                action = actions[resetStoreStateString]
            } else {
                if (!(actionProps.type as string).startsWith(actionPrefix)) return reducerState

                const type = (actionProps.type as string).slice(actionPrefix.length)
                action = actions[type]
            }

            if (!action) return reducerState

            const diff = action(actionProps.payload, state)

            writeToPersistStorageParsed(
                diff,
                key,
                storeKey,
                defaultPersistValues,
                parsedPersistConfig,
            )

            return {
                ...reducerState,
                ...diff,
            }
        }

        /** получаем initialstate */
        reducer.getInitialState = () => computedInitialState

        /** выставляем отложено initialState */
        /* TODO: Подумать как избавиться от treeKey
            так как storeKey не актуален при первом вызове в useInjectStoreChunk */
        reducer.setInitialState = (newState: TState, treeKey?: TTreeKey) => {
            const persistedData = readFromPersistStorageParsed(
                key,
                treeKey || storeKey,
                parsedPersistConfig,
            )

            if (persistConfig) {
                defaultPersistValues = getDefaultValues(newState, persistConfig)
            } else if (treeKey) {
                clearChunkPersist(key, treeKey)
            }

            computedInitialState = {
                ...newState,
                ...persistedData,
            }
        }

        /** ключ редьюсера в store */
        reducer.key = `${key}` as const

        /**
         * список экшенов
         * @example
         * dispatch(reducer.actions.someAction(actionProps))
         *  */
        reducer.actions = Object.keys(actions).reduce(
            (result, actionName: keyof typeof actions) => {
                // eslint-disable-next-line no-param-reassign
                result[actionName] = (value: Parameters<TActions[typeof actionName]>[0]) =>
                    createAction(`${storeKey}/${key}/${String(actionName)}`)(value)
                return result
            },
            {} as TActionsMapped<TActions>,
        ) as TActionsFinal

        reducer.actions.reset = () =>
            createAction<TState | undefined>(`${storeKey}/${key}/reset`)(computedInitialState)

        reducer.setTreeKey = (newKey: TTreeKey) => {
            storeKey = newKey
            actionPrefix = `${storeKey}/${key}/`
        }

        /**
         * получение state редьюсера
         * @example
         * useSelector(reducer.getRoot)
         */
        // Chunks come and go at runtime (store.removeOne replaces the reducer),
        // so a thunk or a sibling component awaiting across a screen unmount can
        // read a branch that is no longer mounted. Answer with initialState
        // rather than undefined: consumers destructure the slice
        // (`const { ids } = comments`) and index into it, so handing them
        // undefined only moves the same TypeError one line out of the store and
        // into a render (MUP-14311).
        reducer.getRoot = (state: TCommonState) =>
            (state[storeKey]?.[key] ?? computedInitialState) as TState

        reducer.props = {}

        if (type === 'common') {
            /**
             * получение конкретного ключа reducer по его имени.
             * Возвращает селектотор, который можно потом использовать в useSelector:
             * @example
             * useSelector(reducer.getStateValue('valueKey'))
             * */
            reducer.getProp =
                <T extends keyof TState>(index: T) =>
                (state: TCommonState) =>
                    reducer.getRoot(state)?.[index]
        } else if (type === 'list') {
            /**
             * получение конкретного элемента state, редьюсера типа list
             * @example
             * useSelector(reducer.getItemById(4))
             */
            reducer.getItemById = (index: keyof TState) => (state: TCommonState) => {
                const chunkState = reducer.getRoot(state)
                type TItem = TState extends Record<infer K, infer V> ? V : unknown
                return chunkState?.[index] as TItem
            }
        }

        return reducer
    }

    return storeChunkCreator
}

type TCommonStoreChunkReturn<T extends (...args: any[]) => (...args: any[]) => any> = Omit<
    ReturnType<ReturnType<T>>,
    'setInitialState' | 'actions' | 'getItemById'
> & {
    (state: any, action: any): any
    setInitialState(newState: any, treeKey?: string): void
    actions: Record<string, any>
}

type TCommonStoreChunk = TCommonStoreChunkReturn<typeof createStoreChunk> & {
    getItemById(id: any): any
}

export const createListStoreChunk = <TItem extends { id: string | number }>(
    key: string,
    treeKey: TTreeKey,
) => {
    type TId = TItem['id'] extends string ? string : number
    type TStoreChunkState = Record<TId, TItem>

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return <T extends TChunkActions<TStoreChunkState>>({ actions = {} }: { actions?: T }) => {
        const chunk = createStoreChunk<TStoreChunkState>({ storeKey: key, treeKey })({
            type: 'list',
            initialState: {} as TStoreChunkState,
            actions: {
                ...actions,
                addList(payload: TItem[]) {
                    const items: Partial<TStoreChunkState> = {}
                    payload.forEach(item => {
                        items[item.id as TId] = item
                    })
                    return items
                },
                addMultiple: (payload: TStoreChunkState) => payload,
                addOne: (item: TItem) =>
                    ({
                        [item.id]: item,
                    }) as TStoreChunkState,
                removeOne(id: TId, state) {
                    const newState = { ...state }
                    delete newState[id]
                    return newState
                },
                updateItemProp: (
                    { id, key, value }: { id: TId; key: keyof TItem; value: TItem[typeof key] },
                    state,
                ) => ({
                    ...state,
                    [id]: {
                        ...state[id],
                        [key]: value,
                    },
                }),
            },
        })

        return chunk as Omit<typeof chunk, 'props' | 'getProp'> & {
            (state: any, action: any): any
        }
    }
}

type TExtendedStoreChunkProps<TState, TActions, TPersist> = {
    /** начальное состояние для чанка. его так же можно опставить на лету */
    initialState: TState
    /** набор экшенов конкретного чанка */
    actions?: TActions
    /** конфиг персистентности, описывает какие поля во внешних хранилищах,
     * должны обновиться вместе с полями состояния */
    persist?: TPersist
}

const ucFirst = (str = '') => str[0].toUpperCase() + str.slice(1)

type ObjectKeys<T> =
    T extends Record<string, unknown>
        ? (keyof T)[]
        : T extends number
          ? []
          : T extends Array<any> | string
            ? string[]
            : never

export const createExtendedStoreChunk = <
    TState extends Record<string, unknown>,
    TPersist extends TPersistEngines<TState> = TArrayLikeConfig<TState>,
>({
    storeKey,
    treeKey,
}: {
    storeKey: string
    treeKey: TTreeKey
}) => {
    return <T extends TChunkActions<TState>>({
        initialState,
        persist,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        actions = {},
    }: TExtendedStoreChunkProps<TState, T, TCustomConfig<TState, TPersist>>) => {
        const actionKeys = Object.keys(initialState) as ObjectKeys<typeof initialState>

        type TKeyedActions<Type> = {
            [Property in keyof Type as `set${Capitalize<string & Property>}`]: (
                key: Type[Property],
            ) => Partial<Type>
        }

        const keyedActions = actionKeys.reduce(
            (result, stateKey) => ({
                ...result,
                [`set${ucFirst(stateKey)}`]: (key: typeof stateKey) => ({ [stateKey]: key }),
            }),
            {},
        ) as TKeyedActions<typeof initialState>

        const chunk = createStoreChunk({ storeKey, treeKey })({
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore FIXME - не правильно типы рулит
            persist,
            initialState,
            actions: {
                ...keyedActions,
                ...actions,
            },
        })

        type TKeyedProps<Type> = {
            [Property in keyof Type as `get${Capitalize<string & Property>}`]: (
                state: any,
            ) => Type[Property]
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        chunk.props = actionKeys.reduce(
            (result, stateKey) => ({
                ...result,
                [`get${ucFirst(stateKey)}`]: chunk.getProp(stateKey.toString()),
            }),
            {},
        ) as TKeyedProps<typeof initialState>

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return chunk as Omit<typeof chunk, 'props' | 'getProp' | 'getItemById'> & {
            (state: any, action: any): any
            props: TKeyedProps<typeof initialState>
            getRoot: (state: any) => TState
        }
    }
}

type TExtendedStoreChunk = TCommonStoreChunkReturn<typeof createExtendedStoreChunk>

export type TGenericExtendedStoreChunk<K extends Record<string, unknown>> = ReturnType<
    ReturnType<typeof createExtendedStoreChunk<K>>
>

export type TStoreChunk = TCommonStoreChunk | TExtendedStoreChunk
