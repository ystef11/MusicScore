import { RefObject, useEffect, useState } from 'react'
import type { HostInstance } from 'react-native'
import { Rect } from 'react-native-popover-view'

type TMeasureCallback = (x: number, y: number, width: number, height: number) => void

type TMeasurable = { measureInWindow: (callback: TMeasureCallback) => void }

type TAnchorRef = RefObject<TMeasurable | null>

export type TPopoverAnchor = Rect | RefObject<HostInstance | null> | TAnchorRef | undefined

const SAMPLE_INTERVAL_MS = 50
const SETTLE_TIMEOUT_MS = 2000

const isAnchorRef = (anchor: TPopoverAnchor): anchor is TAnchorRef =>
    !!anchor && typeof anchor === 'object' && 'current' in anchor

const isSameRect = (a: number[], b: number[]) => a.every((value, index) => value === b[index])

/**
 * react-native-popover-view measures everything it needs — the anchor, and in JS_MODAL mode the
 * offset of its own container — once, right after it mounts, and never corrects those numbers.
 * Mounting it while the surrounding layout is still animating therefore pins the tooltip to a
 * position the anchor has already left. Hold the popover unmounted until the anchor reports the
 * same rect twice in a row, so the library measures a layout that has come to rest.
 */
export function useSettledAnchor(anchor: TPopoverAnchor, visible: boolean) {
    const [isSettled, setSettled] = useState(false)
    const isRef = isAnchorRef(anchor)

    useEffect(() => {
        if (!isRef || !visible || isSettled) return undefined

        let isCancelled = false
        let timeout: ReturnType<typeof setTimeout> | undefined
        let previous: number[] | undefined
        const giveUpAt = Date.now() + SETTLE_TIMEOUT_MS

        const scheduleNext = () => {
            if (isCancelled) return
            timeout = setTimeout(sample, SAMPLE_INTERVAL_MS)
        }

        function sample() {
            const node = (anchor as TAnchorRef).current

            if (!node) {
                if (Date.now() >= giveUpAt) setSettled(true)
                else scheduleNext()
                return
            }

            node.measureInWindow((x, y, width, height) => {
                if (isCancelled) return

                const isTimedOut = Date.now() >= giveUpAt
                const next = [x, y, width, height]
                const isEmpty = !width && !height

                if (isTimedOut || (!isEmpty && previous && isSameRect(previous, next))) {
                    setSettled(true)
                    return
                }

                previous = isEmpty ? undefined : next
                scheduleNext()
            })
        }

        sample()

        return () => {
            isCancelled = true
            clearTimeout(timeout)
        }
    }, [anchor, isRef, isSettled, visible])

    return !isRef || isSettled
}
