import { createMMKV } from 'react-native-mmkv'

import * as Sentry from '../../App/Utils/Sentry'

export const createStorage = <TStorage extends Record<string, unknown>>(
    storageId?: string | number,
    path?: string,
) => {
    const storage = createMMKV({
        id: `${storageId || 'global'}-storage`,
        encryptionKey: 'muse-app-storage',
        ...(path ? { path } : {}),
    })

    return {
        get: <K extends keyof TStorage>(key: K): TStorage[K] | undefined => {
            if (typeof key !== 'string') return undefined

            const stringValue = storage.getString(key)

            if (!stringValue) return undefined

            try {
                return JSON.parse(stringValue)
            } catch (error) {
                // A partially written value used to throw a fatal SyntaxError from
                // every read site. Drop it and start clean instead.
                storage.remove(key)
                Sentry.captureException(error, {
                    extra: {
                        storageId: `${storageId || 'global'}-storage`,
                        storageKey: key,
                        valueLength: stringValue.length,
                    },
                })

                return undefined
            }
        },
        set: (key: keyof TStorage, value: TStorage[keyof TStorage]): void => {
            if (typeof key === 'string') {
                // github issue https://github.com/mrousavy/react-native-mmkv/issues/440
                storage.remove(key)
                storage.set(key, JSON.stringify(value))
            }
        },
        addListener: <T extends Record<string, unknown>>(callBack: (key: keyof T) => void) =>
            storage.addOnValueChangedListener(callBack),
        getBoolean: (key: string) => storage.getBoolean(key),
        getString: (key: string) => storage.getString(key),
        getNumber: (key: string) => storage.getNumber(key),
        contains: (key: keyof TStorage) => {
            if (typeof key === 'string') {
                return storage.contains(key)
            }
            return false
        },
        keys: () => storage.getAllKeys(),
        delete: (key: keyof TStorage) => {
            if (typeof key === 'string') {
                storage.remove(key)
            }
        },
        clear: () => storage.clearAll(),
        instance: storage,
    }
}
