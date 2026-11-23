export type TQueryParam<TQueryParamShape extends string | Record<string, unknown>> =
    TQueryParamShape extends string ? TQueryParamShape : TQueryParamShape & { storeKey: string }

export type TStorageEngine<TQueryParamShape extends string | Record<string, unknown>> = {
    storageType: string
    /* Важно что бы реализация не возвращала лишние ключи для которых движок
     * не нашел значения, например { example: undefined}, иначе они будут перетирать
     * дефолтные значения чанка */
    get(query: TQueryParam<TQueryParamShape>[], chunkKey: string): Record<string, unknown> | null

    set(
        params: {
            query: TQueryParam<TQueryParamShape>
            payload: unknown
        }[],
        chunkKey: string,
        defaultValues: Record<string, unknown>,
    ): void

    clearChunk?(chunkKey: string): void
    clearStorage?(): void
}

type TUnknownStorageEngine = TStorageEngine<string | Record<string, unknown>>

export type TPersistenceStoreManager = ReturnType<typeof createPersistenceStorageManager>

export const createPersistenceStorageManager = <TStorageEngines extends TUnknownStorageEngine[]>(
    storageEngines: TStorageEngines,
) => {
    const engines = storageEngines.reduce(
        (acc, engine) => {
            acc[engine.storageType] = engine

            return acc
        },
        {} as Record<string, TStorageEngine<string | Record<string, unknown>>>,
    )

    return {
        get(
            storageType: string,
            query: Parameters<TUnknownStorageEngine['get']>[0],
            chunkKey: Parameters<TUnknownStorageEngine['get']>[1],
        ) {
            return engines[storageType].get(query, chunkKey)
        },

        set(
            storageType: string,
            params: Parameters<TUnknownStorageEngine['set']>[0],
            chunkKey: Parameters<TUnknownStorageEngine['set']>[1],
            defaultValues: Parameters<TUnknownStorageEngine['set']>[2],
        ) {
            engines[storageType].set(params, chunkKey, defaultValues)
        },

        clearChunk(chunkKey: string) {
            Object.values(storageEngines).forEach(storageEngine =>
                storageEngine.clearChunk?.(chunkKey),
            )
        },
    }
}
