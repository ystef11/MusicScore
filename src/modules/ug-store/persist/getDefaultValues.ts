import { ValueOf } from '../types/storeInjectTypes'

import { getPersistKeys } from './getPersistKeys'
import { TArrayLikeConfig, TPersistConfig } from './persist'

export const getDefaultValues = <
    TState,
    TPersist extends TPersistConfig<TState> = TArrayLikeConfig<TState>,
>(
    state: TState,
    persist: TPersist,
) => {
    const persistKeys = getPersistKeys(persist) as Array<keyof TState>

    return persistKeys.reduce<Record<keyof TState, ValueOf<TState>>>(
        (acc, key) => {
            acc[key] = state[key]

            return acc
        },
        {} as Record<keyof TState, ValueOf<TState>>,
    )
}
