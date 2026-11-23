import { TPersistConfig } from './persist'

export const getPersistKeys = <TState>(config: TPersistConfig<TState>) => {
    return Array.isArray(config)
        ? config
        : Object.values(config).reduce<Array<keyof TState>>((acc, engine) => {
            if (Array.isArray(engine)) {
                return [...acc, ...engine] as Array<keyof TState>
            }

            return [...acc, ...Object.keys(engine)] as Array<keyof TState>
        }, [])
}
