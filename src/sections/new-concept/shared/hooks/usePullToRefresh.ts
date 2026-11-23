import { useCallback, useRef, useState } from 'react'

export type TPullToRefresh = {
    isRefreshing: boolean
    onRefresh: () => void
}

export const usePullToRefresh = (refresh: () => Promise<unknown>): TPullToRefresh => {
    const [isRefreshing, setIsRefreshing] = useState(false)
    const inFlightRef = useRef(false)

    const onRefresh = useCallback(() => {
        if (inFlightRef.current) return
        inFlightRef.current = true
        setIsRefreshing(true)
        Promise.resolve(refresh()).finally(() => {
            inFlightRef.current = false
            setIsRefreshing(false)
        })
    }, [refresh])

    return { isRefreshing, onRefresh }
}
