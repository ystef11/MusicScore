import { createStorage } from '@muse-native/mmkv'
import { mmkvStorageEngine, setMmkvStorage } from '@muse-native/persist-engines'
import {
    createAppStore,
    createPersistenceStorageManager,
    TStoreGlobalPersistenceConfig,
} from '@ug/store'
import { Dispatch } from 'redux'

import { State } from '../../App/Reducers/Types'
import { globalStorage } from '../storages/globalStorage'

function transferMMKVData(userId: string | number) {
    const userStorage = createStorage(`${userId}-persist`)
    const defaultStorage = createStorage('default-persist')

    const keys = userStorage.keys()

    keys.forEach(key => {
        const value = userStorage.get(key)
        if (value === undefined) {
            if (defaultStorage.contains(key)) defaultStorage.delete(key)
            return
        }

        defaultStorage.set(key, value)
    })
    userStorage.clear()
    globalStorage.delete('currentUserId')
}

const currentUserId = globalStorage.get('currentUserId')
if (currentUserId) {
    /**
     * Previously, the app created a persistent storage for each logged-in user based on their user ID.
     * To simplify the storage mechanism, we decided to abandon this approach and retain only the default storage.
     * This code ensures a smooth migration for existing users by transferring user ID-based MMKV storage to the default storage.
     */
    try {
        transferMMKVData(currentUserId)
    } catch (error) {
        console.error('Failed to transfer old MMKV storage: ', error)
    }
}

setMmkvStorage()

const storageManager = createPersistenceStorageManager([mmkvStorageEngine])

export const persistConfig: TStoreGlobalPersistenceConfig = {
    storageManager,
    logError: console.error,
    defaultStorageEngine: mmkvStorageEngine.storageType,
}

const externalMiddlewares = __DEV__
    ? [require('@rozenite/redux-devtools-plugin').rozeniteDevToolsEnhancer()]
    : []

export const store = createAppStore({
    initialState: {},
    // @ts-ignore
    storeTree: {
        common: [],
        db: [],
        modules: [],
        screens: [],
    },
    context: {
        // TODO: сюда глобальные вещи для thunk actions
    },
    persistConfig,
    externalMiddlewares,
})

/**
 * convenient method if you need to retrieve data from store chunk without subscribe on it
 * example: getStoreValue(chunk.props.getEbook)
 * */
export function getStoreValue<T>(getter: (state: any) => T) {
    return getter(store.getState())
}

export type DispatchFun = Dispatch & {
    <T extends (...args: any[]) => any>(
        action: T,
    ): T extends (...args: any[]) => Promise<any> ? Promise<ReturnType<T>> : ReturnType<T>
}
export type GetStateFun = () => State
