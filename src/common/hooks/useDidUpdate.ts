import { useRef, useEffect } from 'react'

export const useDidUpdate = (callback: () => void, dependencies: unknown[]) => {
    const isMounted = useRef(false)

    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true
        } else {
            callback()
        }
    }, dependencies)
}
