import { TPersistConfig } from './persist'
import { TQueryParam } from './createPersistenceStorageManager'

type TNormalizedGetQuery = TQueryParam<string> | TQueryParam<Record<string, unknown>>

type TNormalizedSetQuery =
    | { query: TQueryParam<string>; payload: unknown }
    | { query: TQueryParam<Record<string, unknown>>; payload: unknown }

type TNormalizedPersistConfig<TPersist> = Record<
    keyof TPersist,
    TNormalizedGetQuery[] | TNormalizedSetQuery[]
>

type TParsedKeysEngine<TState> = { kind: 'keys'; keys: Array<keyof TState> }
type TParsedCompositeEngine<TState> = {
    kind: 'composite'
    entries: Array<{ key: keyof TState; queryData: Record<string, unknown> }>
}
type TParsedEngine<TState> = TParsedKeysEngine<TState> | TParsedCompositeEngine<TState>

/** diff-independent shape of a persist config, computed once and reused by applyParsedPersistConfig */
export type TParsedPersistConfig<TState> =
    | { kind: 'default'; keys: Array<keyof TState> }
    | { kind: 'engines'; engines: Record<string, TParsedEngine<TState>> }

/**
 * Splits a persist config into its diff-independent parts (engine split, composite query objects)
 * so the hot write/read path (applyParsedPersistConfig) only has to map/filter a small array,
 * instead of re-walking and re-allocating the whole config on every dispatch.
 */
export const parsePersistConfig = <TState>(
    persistConfig: TPersistConfig<TState>,
): TParsedPersistConfig<TState> => {
    if (Array.isArray(persistConfig)) {
        return { kind: 'default', keys: persistConfig }
    }

    const engines = (
        Object.entries(persistConfig) as [
            string,
            TQueryParam<string>[] | Record<string, Record<string, unknown>>,
        ][]
    ).reduce(
        (acc, [storageType, config]) => {
            if (Array.isArray(config)) {
                acc[storageType] = { kind: 'keys', keys: config as Array<keyof TState> }

                return acc
            }

            acc[storageType] = {
                kind: 'composite',
                // query object is built fresh per call in applyParsedPersistConfig to avoid aliasing
                entries: Object.entries(config).map(([key, queryData]) => ({
                    key: key as keyof TState,
                    queryData: queryData as Record<string, unknown>,
                })),
            }

            return acc
        },
        {} as Record<string, TParsedEngine<TState>>,
    )

    return { kind: 'engines', engines }
}

/** applies a diff (or reads without one) against a config pre-parsed by parsePersistConfig */
export const applyParsedPersistConfig = <TState>(
    parsed: TParsedPersistConfig<TState>,
    defaultStorageType: string,
    diffToSet?: Partial<TState>,
) => {
    if (parsed.kind === 'default') {
        if (diffToSet) {
            const params = parsed.keys
                .filter(key => diffToSet[key] !== undefined)
                .map(key => ({ query: key, payload: diffToSet[key] }))

            return {
                [defaultStorageType]: params,
            }
        }

        return {
            [defaultStorageType]: parsed.keys,
        }
    }

    return Object.entries(parsed.engines).reduce(
        (acc, [storageType, engine]) => {
            if (engine.kind === 'keys') {
                if (diffToSet) {
                    acc[storageType] = engine.keys
                        .filter(key => diffToSet[key] !== undefined)
                        .map(key => ({
                            query: key,
                            payload: diffToSet[key],
                        })) as TNormalizedSetQuery[]

                    return acc
                }

                acc[storageType] = engine.keys as TNormalizedGetQuery[]

                return acc
            }

            if (diffToSet) {
                acc[storageType] = engine.entries
                    .filter(({ key }) => diffToSet[key] !== undefined)
                    .map(({ key, queryData }) => ({
                        query: { ...queryData, storeKey: key } as TQueryParam<
                            Record<string, unknown>
                        >,
                        payload: diffToSet[key],
                    }))

                return acc
            }

            acc[storageType] = engine.entries.map(
                ({ key, queryData }) =>
                    ({ ...queryData, storeKey: key }) as TQueryParam<Record<string, unknown>>,
            )

            return acc
        },
        {} as Record<string, TNormalizedGetQuery[] | TNormalizedSetQuery[]>,
    )
}

/** legacy public entry point, kept for external callers/tests — thin wrapper over parse + apply */
export const normalizePersistConfig = <TState>(
    persistConfig: TPersistConfig<TState>,
    defaultStorageType: string,
    diffToSet?: Partial<TState>,
): TNormalizedPersistConfig<typeof persistConfig> =>
    applyParsedPersistConfig<TState>(
        parsePersistConfig<TState>(persistConfig),
        defaultStorageType,
        diffToSet,
    ) as TNormalizedPersistConfig<typeof persistConfig>
