import { createStorage } from '@muse-native/mmkv'
import type { TStorageEngine } from '@ug/store'

let storage = createStorage('default-persist')

export const setStorage = (userId?: string | number | null) => {
    storage = createStorage<Record<string, unknown>>(`${userId || 'default'}-persist`)
}

export const getPersistStorageInstance = () => storage.instance

export const mmkvStorageEngine: TStorageEngine<string> = {
    storageType: 'localStorage',
    get(query, chunkKey) {
        const chunkData = storage.get(chunkKey)

        if (!chunkData) return {}

        return query.reduce<Record<string, unknown>>((accumulator, key) => {
            const value = (chunkData as Record<string, unknown>)[key]

            if (value !== undefined) {
                accumulator[key] = value
            }

            return accumulator
        }, {})
    },
    set(params, chunkKey, defaultValues) {
        const persistedChunkData = storage.get(chunkKey) as Record<string, unknown> | null
        if (persistedChunkData) {
            Object.keys(persistedChunkData).forEach(key => {
                if (
                    // eslint-disable-next-line no-prototype-builtins
                    !defaultValues.hasOwnProperty(key) ||
                    defaultValues[key] === persistedChunkData[key]
                ) {
                    delete persistedChunkData[key]
                }
            })
        }

        const newChunkData = params.reduce<Record<string, unknown> | null>(
            (accumulator, { query: key, payload }) => {
                if (!accumulator) return { [key]: payload }

                accumulator[key] = payload

                return accumulator
            },
            persistedChunkData,
        )

        if (newChunkData) {
            storage.set(chunkKey, newChunkData)
        } else {
            storage.delete(chunkKey)
        }
    },
    clearChunk(chunkKey) {
        storage.delete(chunkKey)
    },
    clearStorage() {
        storage.clear()
    },
}
