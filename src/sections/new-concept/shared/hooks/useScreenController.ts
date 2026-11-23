import { useCallback, useEffect, useRef, useState } from 'react'

import { useFocusEffect } from '@mu-native/navigation'

type TOptions = {
    /**
     * Re-fetch every time the screen gains focus (§3/§7/§9: personal screens
     * re-request on return). The previous response is kept while the refetch is
     * in flight so the screen never flashes empty. `false` = fetch on mount only.
     */
    refetchOnFocus?: boolean
}

export type TScreenController<TResponse> = {
    response: TResponse | null
    /** True while a load is in flight (initial or focus refetch). */
    isLoading: boolean
    /** True when the last load failed. Cleared on the next load. */
    isError: boolean
    /** True once any load has succeeded — gates full-screen loading/error states. */
    hasData: boolean
    refresh: () => Promise<void>
}

/**
 * Shared lifecycle for the v2 screen-controller endpoints (§1.1): one eager
 * fetch per screen, generation-guarded so overlapping loads (focus refetch,
 * manual refresh) can never apply a stale response over a newer one.
 */
export const useScreenController = <TResponse>(
    fetchScreen: () => Promise<TResponse>,
    { refetchOnFocus = true }: TOptions = {},
): TScreenController<TResponse> => {
    const [response, setResponse] = useState<TResponse | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isError, setIsError] = useState(false)
    const generationRef = useRef(0)

    const load = useCallback(() => {
        const generation = ++generationRef.current
        setIsLoading(true)
        setIsError(false)
        return fetchScreen()
            .then(data => {
                if (generationRef.current !== generation) return
                setResponse(data)
            })
            .catch(() => {
                if (generationRef.current !== generation) return
                setIsError(true)
            })
            .finally(() => {
                if (generationRef.current === generation) setIsLoading(false)
            })
    }, [fetchScreen])

    // useFocusEffect also covers the first mount (a screen mounts focused).
    useFocusEffect(
        useCallback(() => {
            if (refetchOnFocus) load()
        }, [refetchOnFocus, load]),
    )

    useEffect(() => {
        if (!refetchOnFocus) load()
    }, [refetchOnFocus, load])

    return { response, isLoading, isError, hasData: response !== null, refresh: load }
}
