import { TPersistenceStoreManager } from '../createPersistenceStorageManager'

export type TStoreGlobalPersistenceConfig = {
    storageManager?: TPersistenceStoreManager | null
    defaultStorageEngine?: string | null
    logError?: (err: Error) => void
}

type TStorePersistenceConfigService = TStoreGlobalPersistenceConfig & {
    setConfig(config: TStoreGlobalPersistenceConfig): void
}

export const storePersistenceConfigService: TStorePersistenceConfigService = {
    storageManager: null,
    defaultStorageEngine: null,
    logError: console.error,
    setConfig(config: {
        storageManager?: TPersistenceStoreManager
        defaultStorageEngine?: string
    }) {
        this.storageManager = config.storageManager || null
        this.defaultStorageEngine = config.defaultStorageEngine || null
    },
}
