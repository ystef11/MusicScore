import { TArrayLikeConfig, TPersistConfig, TRecordLikeConfig } from './persist'
import { storePersistenceConfigService } from './services/storePersistConfigService'

export const removePersistDuplicates = <TState>(config?: TPersistConfig<TState>) => {
    if (!config) return null

    if (Array.isArray(config)) {
        return Array.from(new Set(config))
    }

    /* Получаем только уникальные значения для движков */
    const flatUniqConfig = Object.entries(config).reduce(
        (acc, [storageType, values]) => {
            if (Array.isArray(values)) {
                acc[storageType] = new Set(values)

                return acc
            }

            acc[storageType] = new Set(Object.keys(values) as Array<keyof TState>)

            return acc
        },
        {} as Record<string, Set<keyof TState>>,
    )

    /* Убираем дубликаты между движками */
    Object.entries(flatUniqConfig).forEach(([storageType, set]) => {
        set.forEach(key => {
            Object.entries(flatUniqConfig).forEach(([currentStorageType, currentSet]) => {
                if (storageType === currentStorageType) return

                if (currentSet.has(key)) {
                    currentSet.delete(key)

                    const error = new Error(
                        `Found duplicate key "${String(
                            key,
                        )}" in ${storageType} and ${currentStorageType} inside a persist config, removing ${String(
                            key,
                        )} from ${currentStorageType}...`,
                    )

                    // eslint-disable-next-line no-unused-expressions
                    storePersistenceConfigService.logError?.(error)
                }
            })
        })
    })

    return Object.entries(config).reduce((acc, [storageType, values]) => {
        if (!values) return acc

        if (Array.isArray(values)) {
            acc[storageType] = Array.from(
                flatUniqConfig[storageType as string],
            ) as TArrayLikeConfig<TState>

            return acc
        }

        const storageValues = {
            ...values,
        }

        Object.keys(values).forEach(key => {
            if (!flatUniqConfig[storageType as string].has(key as keyof TState)) {
                delete storageValues[key as keyof TState]
            }
        })

        acc[storageType] = storageValues

        return acc
    }, {} as TRecordLikeConfig<TState>)
}
