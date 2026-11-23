/* eslint-disable no-underscore-dangle */
import { useStore } from 'react-redux'

import {
    applyMiddleware,
    combineReducers,
    compose,
    createStore,
    Store,
    StoreCreator,
    Middleware,
} from 'redux'
import thunk from 'redux-thunk'

import {
    storePersistenceConfigService,
    TStoreGlobalPersistenceConfig,
} from './persist/services/storePersistConfigService'
import type { TCommonState } from './state'
import type { TStoreChunk } from './storeChunk'
import type { TStoreChunkInjectParams, TUnknownFn } from './types/storeInjectTypes'

const isStoreChunk = (chunk: TStoreChunk | TUnknownFn): chunk is TStoreChunk => {
    return 'getInitialState' in chunk && 'setInitialState' in chunk
}

export type TTreeKey = 'db' | 'common' | 'modules' | 'screens' | 'old'

const treeKeys: TTreeKey[] = ['common', 'db', 'modules', 'screens']

type TStoreTree = {
    db: TStoreChunk[]
    common: TStoreChunk[]
    modules: TStoreChunk[]
    screens: TStoreChunk[]
    old: TStoreChunk[]
    [key: string]: unknown
}

const createStoreTree = (config: TStoreTree) => {
    type TTree = Record<TTreeKey, Record<TStoreChunk['key'], TStoreChunk>>
    return {
        ...config,
        ...treeKeys.reduce<TTree>((result, key) => {
            // eslint-disable-next-line no-param-reassign
            result[key] = {}

            config[key].forEach(chunk => {
                // eslint-disable-next-line no-param-reassign
                result[key][chunk.key] = chunk

                chunk.setTreeKey(key)
            })

            return result
        }, {} as TTree),
    }
}

type TInjectedStoreTree = ReturnType<typeof createStoreTree>
type CombinedReducer = ReturnType<typeof combineReducers>

const combineStoreTree = (storeTree: TInjectedStoreTree) => {
    type TTree = Record<TTreeKey, CombinedReducer>

    return combineReducers({
        ...storeTree,
        ...treeKeys.reduce<TTree>((result, key) => {
            if (Object.keys(storeTree[key]).length) {
                // eslint-disable-next-line no-param-reassign
                result[key] = combineReducers(storeTree[key]) as unknown as CombinedReducer
            }

            return result
        }, {} as TTree),
    })
}

type TCombineTreeReturn = ReturnType<typeof combineStoreTree>

type AppStoreProps<TState, TContext> = {
    storeTree: TStoreTree
    initialState: TState
    context?: TContext
    storeWrapper?: (combinedStoreTree: TCombineTreeReturn) => TCombineTreeReturn
    persistConfig?: Omit<TStoreGlobalPersistenceConfig, 'setConfig'>
    externalMiddlewares?: Middleware[]
}

export const createAppStore = <
    TContext extends Record<string, unknown>,
    TState extends TCommonState = TCommonState,
>({
    storeTree,
    initialState,
    context = {} as TContext,
    storeWrapper = t => t,
    persistConfig,
    externalMiddlewares = [],
}: AppStoreProps<TState, TContext>) => {
    const composeMiddlewares = [thunk.withExtraArgument(context)]

    const middlewares = [applyMiddleware(...composeMiddlewares)]

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const runExtention = global.__REDUX_DEVTOOLS_EXTENSION__
    if (__DEV__ && runExtention) {
        middlewares.push(
            runExtention({
                serialize: {
                    options: false,
                },
            }),
        )
    }

    const injectedStoreTree = createStoreTree(storeTree)

    const createStoreWithMiddleware = compose<StoreCreator>(
        ...middlewares,
        ...externalMiddlewares,
    )(createStore)

    type TStore = Store & Record<'chunks' | 'asyncChunks', TInjectedStoreTree>

    const wrappedStoreTree = storeWrapper(combineStoreTree(injectedStoreTree))

    const store: TStore = createStoreWithMiddleware(wrappedStoreTree, initialState)

    store.chunks = injectedStoreTree

    if (persistConfig) {
        storePersistenceConfigService.setConfig(persistConfig)
    }

    treeKeys.forEach(key => {
        storeTree[key].forEach(chunk => {
            const initialState = chunk.getInitialState()

            if (initialState) {
                chunk.setInitialState(initialState, key)
            }
        })
    })

    store.asyncChunks = {
        common: {},
        db: {},
        modules: {},
        screens: {},
        old: {},
    } as Record<TTreeKey, Record<TStoreChunk['key'], TStoreChunk>>

    return store
}

type TStore = ReturnType<typeof createAppStore>

export const useAppStore: (...args: Parameters<typeof useStore>) => TStore = (...args) =>
    useStore(...args) as unknown as TStore

export type TStoreChunkProps = {
    treeKey?: TTreeKey
    chunk: TStoreChunk
}

export const createStoreChunkManager = (store: TStore) => ({
    getIsChunkIjected({ chunk, treeKey }: TStoreChunkProps) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return !!store.asyncChunks[treeKey][chunk.key]
    },
    injectChunk<T>({
        storeChunk,
        treeKey,
        initialState,
        onBeforeInject,
        isRemoteInjected,
    }: TStoreChunkInjectParams<T>) {
        const getIsInjected = () => {
            if (typeof isRemoteInjected === 'boolean') return isRemoteInjected

            return this.getIsChunkIjected({
                chunk: storeChunk as TStoreChunk,
                treeKey,
            })
        }

        let chunkInitialState = initialState

        if (isStoreChunk(storeChunk) && !chunkInitialState) {
            chunkInitialState = storeChunk.getInitialState() as T
        }

        if (onBeforeInject) {
            onBeforeInject(store, chunkInitialState)
        }

        if (!getIsInjected()) {
            if (isStoreChunk(storeChunk) && chunkInitialState) {
                storeChunk.setInitialState(chunkInitialState, treeKey)
            }
            this.addOne({
                chunk: storeChunk,
                treeKey,
            })
        }
    },
    addOne({ chunk, treeKey }: TStoreChunkProps) {
        if (treeKey) {
            // eslint-disable-next-line no-param-reassign
            store.asyncChunks[treeKey][chunk.key] = chunk
            chunk.setTreeKey(treeKey)
        } else {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            // eslint-disable-next-line no-param-reassign
            store.asyncChunks.old[chunk.key] = chunk
        }

        const { common, db, modules, screens, ...oldChunks } = store.chunks

        store.replaceReducer(
            combineStoreTree({
                ...oldChunks,
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                ...store.asyncChunks.old,
                common: {
                    ...common,
                    ...store.asyncChunks.common,
                },
                db: {
                    ...db,
                    ...store.asyncChunks.db,
                },
                modules: {
                    ...modules,
                    ...store.asyncChunks.modules,
                },
                screens: {
                    ...screens,
                    ...store.asyncChunks.screens,
                },
            }),
        )
    },

    removeOne({ chunkKey, treeKey }: { treeKey?: TTreeKey; chunkKey: string }) {
        if (treeKey) {
            // eslint-disable-next-line no-param-reassign
            delete store.asyncChunks[treeKey][chunkKey]
        }

        const { common, db, modules, screens, ...oldChunks } = store.chunks

        store.replaceReducer(
            combineStoreTree({
                ...oldChunks,
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                ...store.asyncChunks.old,
                common: {
                    ...common,
                    ...store.asyncChunks.common,
                },
                db: {
                    ...db,
                    ...store.asyncChunks.db,
                },
                modules: {
                    ...modules,
                    ...store.asyncChunks.modules,
                },
                screens: {
                    ...screens,
                    ...store.asyncChunks.screens,
                },
            }),
        )
    },
})
