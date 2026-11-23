import { useCallback, useEffect, useRef, useState } from 'react'

import type { TApiMeta, TApiTabs } from '../api/types'

export type TPage<TItem> = {
    items?: TItem[]
    _meta?: TApiMeta
    tabs?: TApiTabs
}

/** First-frame page-1 data delivered by a screen controller instead of a fetch. */
export type TPageSeed<TItem> = {
    items: TItem[]
    meta?: TApiMeta
    tabs?: TApiTabs
}

type TOptions<TItem> = {
    /** `false` for locally-sourced states (e.g. the offline tab) — no requests run. */
    enabled?: boolean
    /**
     * §1.1 first-frame exception: when the screen controller's eager block covers
     * the current query, adopt it as page 1 instead of fetching. `undefined` =
     * controller still loading (hold the initial fetch), object = adopt, `null` =
     * controller failed/absent (fetch normally). Consumed at most once — later
     * seed changes (e.g. a controller focus-refetch) are ignored; use `refresh`.
     */
    seed?: TPageSeed<TItem> | null
    /** Whether the seed matches the current query (e.g. default tab + sort). */
    seedApplies?: boolean
}

export type TPaginatedList<TItem> = {
    items: TItem[]
    /** Tab-availability flags (§7/§8/§10), from the latest page-1 response. */
    tabs: TApiTabs | undefined
    totalCount: number
    isLoading: boolean
    loadMore: () => void
    /** Re-fetch page 1 of the current query, keeping items until it lands. */
    refresh: () => Promise<void>
}

/**
 * Shared lifecycle for the v2 unified list endpoints (`{ items, _meta, tabs? }`,
 * §1.5): page-1 fetch on query change, appending pagination, and a non-clearing
 * refresh. Every response is generation-guarded — changing the query (new
 * `fetchPage` identity) invalidates all in-flight requests, so a slow page-2
 * response from the previous tab can never be appended to the new tab's list.
 */
export const usePaginatedList = <TItem>(
    fetchPage: (page: number) => Promise<TPage<TItem>>,
    { enabled = true, seed, seedApplies = false }: TOptions<TItem> = {},
): TPaginatedList<TItem> => {
    const [items, setItems] = useState<TItem[]>([])
    const [tabs, setTabs] = useState<TApiTabs | undefined>(undefined)
    const [totalCount, setTotalCount] = useState(0)
    const [isLoading, setIsLoading] = useState(false)

    const generationRef = useRef(0)
    const pageRef = useRef(1)
    const pageCountRef = useRef(1)
    const isLoadingRef = useRef(false)
    const seedConsumedRef = useRef(false)

    const setLoading = useCallback((value: boolean) => {
        isLoadingRef.current = value
        setIsLoading(value)
    }, [])

    const applyPageOne = useCallback(
        (
            pageItems: TItem[] | undefined,
            meta: TApiMeta | undefined,
            pageTabs: TApiTabs | undefined,
        ) => {
            setItems(pageItems ?? [])
            setTabs(pageTabs)
            setTotalCount(meta?.totalCount ?? pageItems?.length ?? 0)
            pageRef.current = 1
            pageCountRef.current = meta?.pageCount ?? 1
        },
        [],
    )

    const fetchPageOne = useCallback(
        (clearFirst: boolean) => {
            const generation = ++generationRef.current
            if (clearFirst) setItems([])
            setLoading(true)
            return fetchPage(1)
                .then(page => {
                    if (generationRef.current !== generation) return
                    applyPageOne(page.items, page._meta, page.tabs)
                })
                .catch(() => {
                    if (generationRef.current !== generation) return
                    setItems([])
                })
                .finally(() => {
                    if (generationRef.current === generation) setLoading(false)
                })
        },
        [fetchPage, applyPageOne, setLoading],
    )

    // Page 1 whenever the query (fetchPage identity) changes. The very first
    // query defers to the pending seed; `seed` itself is deliberately NOT a dep —
    // its arrival is handled by the effect below, and post-consumption seed
    // changes must not reset the list.
    useEffect(() => {
        if (!enabled) return
        if (seedApplies && !seedConsumedRef.current) {
            generationRef.current += 1 // invalidate any in-flight request
            setItems([])
            setLoading(true)
            return
        }
        fetchPageOne(true)
    }, [enabled, seedApplies, fetchPageOne, setLoading])

    // Adopt the seed once it arrives (or fall back to a fetch when it's null).
    useEffect(() => {
        if (!enabled || !seedApplies || seedConsumedRef.current || seed === undefined) return
        seedConsumedRef.current = true
        if (seed) {
            generationRef.current += 1
            applyPageOne(seed.items, seed.meta, seed.tabs)
            setLoading(false)
        } else {
            fetchPageOne(true)
        }
    }, [enabled, seedApplies, seed, fetchPageOne, applyPageOne, setLoading])

    const loadMore = useCallback(() => {
        if (!enabled || isLoadingRef.current || pageRef.current >= pageCountRef.current) return
        const generation = generationRef.current
        const nextPage = pageRef.current + 1
        setLoading(true)
        fetchPage(nextPage)
            .then(page => {
                if (generationRef.current !== generation) return
                setItems(prev => [...prev, ...(page.items ?? [])])
                pageRef.current = nextPage
                pageCountRef.current = page._meta?.pageCount ?? pageCountRef.current
            })
            .catch(() => {
                // Keep the loaded pages; the next scroll retries.
            })
            .finally(() => {
                if (generationRef.current === generation) setLoading(false)
            })
    }, [enabled, fetchPage, setLoading])

    const refresh = useCallback(() => {
        if (!enabled) return Promise.resolve()
        return fetchPageOne(false)
    }, [enabled, fetchPageOne])

    return { items, tabs, totalCount, isLoading, loadMore, refresh }
}
