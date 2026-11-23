import { useMemo } from 'react'

type TMeasureCallback = (x?: number, y?: number, width?: number, height?: number) => void

type TMeasurable = { measureInWindow: (callback: TMeasureCallback) => void }

type TAnchorRef = { current: TMeasurable | null }

/**
 * react-native-popover-view polls the anchor ref for up to 4 seconds and rejects with
 * "getRectForRef - current is not set" as soon as `current` turns null — which happens whenever
 * the anchored button or screen unmounts while a popover is opening. Report an empty rect for a
 * gone anchor instead: the library treats an all-undefined rect as "not found" and bails out
 * quietly. An anchor that has not mounted yet still reads as empty, so the waiting loop is intact.
 */
const detachedAnchor: TMeasurable = {
    measureInWindow: callback => callback(undefined, undefined, undefined, undefined),
}

export function usePopoverAnchor<T>(anchor: T): T {
    return useMemo(() => {
        if (!anchor || typeof anchor !== 'object' || !('current' in anchor)) return anchor

        const ref = anchor as TAnchorRef
        let hasMounted = false

        return {
            get current() {
                if (ref.current) {
                    hasMounted = true
                    return ref.current
                }
                return hasMounted ? detachedAnchor : null
            },
        } as T
    }, [anchor])
}
