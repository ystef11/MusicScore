import { useEffect, useRef } from 'react'
import { DeviceEventEmitter } from 'react-native'

import type { AnyAction, Store } from 'redux'

import { createStoreChunkManager, TTreeKey, useAppStore } from '../init'
import type { TStoreChunk } from '../storeChunk'
import type { TUnknownFn } from '../types/storeInjectTypes'

const useInjectStoreChunk = <T extends TStoreChunk | TUnknownFn>(
    storeChunk: T,
    treeKey?: TTreeKey,
    initialState?: Parameters<typeof storeChunk>[0],
    isRemoteInjected?: boolean,
    onBeforeInject?: (
        store: Store<any, AnyAction>,
        initialState?: Parameters<typeof storeChunk>[0],
    ) => void,
) => {
    const store = useAppStore()
    const { key } = storeChunk as TStoreChunk
    if (store.asyncChunks[treeKey || 'old'][key]) return
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const chunkManager = createStoreChunkManager(store)

    chunkManager.injectChunk({
        storeChunk: storeChunk as TStoreChunk,
        treeKey,
        initialState,
        onBeforeInject,
        isRemoteInjected,
    })
}

export const useDetachStoreChunk = <T extends TStoreChunk>(storeChunk: T, treeKey?: TTreeKey) => {
    const store = useAppStore()
    useEffect(() => {
        return () => {
            const { key } = storeChunk as TStoreChunk
            if (!store.asyncChunks[treeKey || 'old'][key]) return
            const chunkManager = createStoreChunkManager(store)
            chunkManager.removeOne({ chunkKey: storeChunk.key, treeKey })
        }
    }, [storeChunk, treeKey])
}

let timerId: ReturnType<typeof setTimeout>
const pendingCleanups = new Map<string, ReturnType<typeof setTimeout>>()
const chunkRefCounts = new Map<string, number>()

const CLEANUP_DELAY_MS = 500

/** Where each live chunk key was first claimed, so a collision can name both call sites. */
const chunkOrigins = new Map<string, string>()

const describeCallSite = () => {
    const frames = (new Error().stack ?? '').split('\n').slice(2)
    const caller = frames.find(frame => !frame.includes('useInjectStoreChunk'))
    return caller?.trim() || 'unknown call site'
}

const warnOnKeyCollision = (chunkKey: string, treeKey: TTreeKey) => {
    const origin = describeCallSite()
    const claimedBy = chunkOrigins.get(chunkKey)

    if (!claimedBy) {
        chunkOrigins.set(chunkKey, origin)
        return
    }

    if (claimedBy === origin) return

    console.warn(
        `[ug-store] chunk key "${chunkKey}" in "${treeKey}" is claimed twice from different places, ` +
            `so both consumers share one state slice.\n` +
            `  first:  ${claimedBy}\n` +
            `  second: ${origin}\n` +
            `If these are two instances of the same screen, make the key unique ` +
            `(see useSameRouteInStackCount). If the sharing is intentional, ignore this warning.`,
    )
}

export const useInjectDynamicStoreChunk = <T extends TStoreChunk | TUnknownFn>(
    key: string,
    initFunction: (key: string) => T,
    treeKey: TTreeKey = 'screens',
    isNeedToUnmountStore = true,
) => {
    const store = useAppStore()

    const chunkRef = useRef<ReturnType<typeof initFunction>>(undefined)
    const cleanRef = useRef<() => void>(undefined)
    const chunkKeyRef = useRef<string>(undefined)
    let chunkManager: ReturnType<typeof createStoreChunkManager>

    if (!chunkRef.current) {
        const storeChunk = initFunction(key)
        chunkRef.current = storeChunk
        const chunkKey = (storeChunk as TStoreChunk).key
        chunkKeyRef.current = chunkKey

        // Cancel pending delayed cleanup for the same store key to prevent
        // race conditions when quickly navigating between screens that share the same chunk key
        const pendingTimer = pendingCleanups.get(chunkKey)
        if (pendingTimer) {
            clearTimeout(pendingTimer)
            pendingCleanups.delete(chunkKey)
        }

        if (__DEV__) warnOnKeyCollision(chunkKey, treeKey)

        chunkManager = createStoreChunkManager(store)
        chunkManager.injectChunk({ storeChunk: storeChunk as TStoreChunk, treeKey })
        chunkRefCounts.set(chunkKey, (chunkRefCounts.get(chunkKey) || 0) + 1)
        cleanRef.current = () =>
            chunkManager.removeOne({ chunkKey: (storeChunk as TStoreChunk).key, treeKey })
    }

    useEffect(() => {
        return () => {
            if (!isNeedToUnmountStore) return

            const chunkKey = chunkKeyRef.current
            if (!chunkKey) return

            // Release this consumer synchronously: doing it inside the delayed timer let a
            // cancelled cleanup skip the decrement, so the count drifted up and never hit zero.
            const remaining = (chunkRefCounts.get(chunkKey) || 1) - 1

            if (remaining > 0) {
                chunkRefCounts.set(chunkKey, remaining)
                return
            }

            chunkRefCounts.delete(chunkKey)

            const timer = setTimeout(() => {
                pendingCleanups.delete(chunkKey)
                // A remount during the grace period re-registered the key, so keep the chunk.
                if (chunkRefCounts.has(chunkKey)) return

                chunkOrigins.delete(chunkKey)
                cleanRef.current?.()
            }, CLEANUP_DELAY_MS)

            timerId = timer
            pendingCleanups.set(chunkKey, timer)
        }
    }, [key, treeKey])

    return { chunk: chunkRef.current }
}

// альтернатива module.hot для дев режима https://blog.stackademic.com/cracking-the-code-hooking-into-react-natives-hot-module-replacement-hmr-396af70cc824?gi=23e294eb67cc
// при хот релоаде срабатывает анмаунт в котором у нас удаляется чанк и приложение крашнется, можно предотвращать это
if (__DEV__) {
    DeviceEventEmitter.addListener('websocketMessage', (data: { data?: string }) => {
        try {
            const response = JSON.parse(data?.data || '{}')

            if (response?.type === 'update-done') {
                setTimeout(() => {
                    if (timerId) clearTimeout(timerId)
                }, 100)
            }
        } catch (e) {
            console.log('Failed to parse the webSocketMessage event data!', e)
        }
    })
}

export default useInjectStoreChunk
