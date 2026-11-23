import { useEffect, useRef, useState } from 'react'

/**
 * True once `isLoading` has gone up and come back down. The load edge rather than the data
 * length: an empty result is a finished load and must report instead of timing out.
 */
export const useHasLoaded = (isLoading: boolean) => {
    const hasStartedLoading = useRef(false)
    const [hasLoaded, setHasLoaded] = useState(false)

    useEffect(() => {
        if (isLoading) {
            hasStartedLoading.current = true
        } else if (hasStartedLoading.current) {
            setHasLoaded(true)
        }
    }, [isLoading])

    return hasLoaded
}
