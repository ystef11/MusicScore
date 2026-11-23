import type { TTreeKey } from '../init'
import { ValueOf } from '../types/storeInjectTypes'

import type { TStorageEngine } from './createPersistenceStorageManager'
import {
    applyParsedPersistConfig,
    parsePersistConfig,
    TParsedPersistConfig,
} from './normalizePersistConfig'
import { storePersistenceConfigService } from './services/storePersistConfigService'

export type TRecordEngine<TState> = Partial<Record<keyof TState, Record<string, unknown>>>

export type TArrayLikeConfig<TState> = Array<keyof TState>
export type TRecordLikeConfig<TState> = Record<
    string,
    TArrayLikeConfig<TState> | TRecordEngine<TState>
>

export type TPersistConfig<TState> = TArrayLikeConfig<TState> | TRecordLikeConfig<TState>

type TExtractQueryFromEngine<TEngine extends TStorageEngine<string | Record<string, unknown>>> =
    TEngine extends TStorageEngine<infer TQuery>
        ? TQuery extends string
            ? string
            : Omit<TQuery, 'storeKey'>
        : never

export type TCustomConfig<
    TState,
    TStorageEngines extends
        | TArrayLikeConfig<TState>
        | Record<string, TStorageEngine<string | Record<string, unknown>>>,
> =
    TStorageEngines extends TArrayLikeConfig<TState>
        ? TArrayLikeConfig<TState>
        : {
              [TEngine in keyof TStorageEngines]?: TStorageEngines[TEngine] extends TStorageEngine<
                  string | Record<string, unknown>
              >
                  ? TExtractQueryFromEngine<TStorageEngines[TEngine]> extends string
                      ? TArrayLikeConfig<TState>
                      : Partial<
                            Record<keyof TState, TExtractQueryFromEngine<TStorageEngines[TEngine]>>
                        >
                  : never
          }

const getKey = (chunkKey: string, treeKey: TTreeKey) => `${chunkKey}_${treeKey}`

/** legacy public entry point, kept for external callers/tests — thin wrapper over the parsed path */
export const writeToPersistStorage = <TState>(
    diff: Partial<TState>,
    chunkKey: string,
    treeKey: TTreeKey,
    defaultValues: Partial<Record<keyof TState, ValueOf<TState>>>,
    config: TPersistConfig<TState> | null,
) =>
    writeToPersistStorageParsed<TState>(
        diff,
        chunkKey,
        treeKey,
        defaultValues,
        config ? parsePersistConfig<TState>(config) : null,
    )

/** legacy public entry point, kept for external callers/tests — thin wrapper over the parsed path */
export const readFromPersistStorage = <TState>(
    chunkKey: string,
    treeKey: TTreeKey,
    config: TPersistConfig<TState> | null,
) =>
    readFromPersistStorageParsed<TState>(
        chunkKey,
        treeKey,
        config ? parsePersistConfig<TState>(config) : null,
    )

/**
 * Same as writeToPersistStorage, but takes a config pre-parsed once via parsePersistConfig
 * (see storeChunk.ts) instead of re-normalizing the raw config on every call.
 */
export const writeToPersistStorageParsed = <TState>(
    diff: Partial<TState>,
    chunkKey: string,
    treeKey: TTreeKey,
    defaultValues: Partial<Record<keyof TState, ValueOf<TState>>>,
    parsedConfig: TParsedPersistConfig<TState> | null,
) => {
    const key = getKey(chunkKey, treeKey)

    if (
        !parsedConfig ||
        !storePersistenceConfigService.storageManager ||
        !storePersistenceConfigService.defaultStorageEngine
    )
        return

    const persistConfig = applyParsedPersistConfig<TState>(
        parsedConfig,
        storePersistenceConfigService.defaultStorageEngine,
        diff,
    )

    Object.entries(persistConfig).forEach(([storageType, params]) => {
        if (!params.length) {
            return
        }

        // eslint-disable-next-line no-unused-expressions
        storePersistenceConfigService.storageManager?.set(storageType, params, key, defaultValues)
    })
}

/** same idea as writeToPersistStorageParsed, for the read path */
export const readFromPersistStorageParsed = <TState>(
    chunkKey: string,
    treeKey: TTreeKey,
    parsedConfig: TParsedPersistConfig<TState> | null,
) => {
    const key = getKey(chunkKey, treeKey)

    if (
        !storePersistenceConfigService.storageManager ||
        !storePersistenceConfigService.defaultStorageEngine
    )
        return null

    if (!parsedConfig) {
        return null
    }

    const persistConfig = applyParsedPersistConfig<TState>(
        parsedConfig,
        storePersistenceConfigService.defaultStorageEngine,
    )

    return Object.entries(persistConfig).reduce<null | Record<keyof TState, unknown>>(
        (acc, [storageType, query]) => {
            return {
                ...acc,
                ...storePersistenceConfigService.storageManager?.get(storageType, query, key),
            } as Record<keyof TState, ValueOf<TState>>
        },
        null,
    )
}

export const clearChunkPersist = (chunkKey: string, treeKey: TTreeKey) => {
    const key = getKey(chunkKey, treeKey)

    if (
        !storePersistenceConfigService.storageManager ||
        !storePersistenceConfigService.defaultStorageEngine
    )
        return

    storePersistenceConfigService.storageManager.clearChunk(key)
}
