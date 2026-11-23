import { useEffect, useMemo, useState } from 'react'

import { fetchSearchSuggestions } from '@mu-native/new-concept-shared'
import { searchStoreChunk, type TRecentSearch } from '@mu-native/search'
import { useValues } from '@ug/store'

const MAX_RECENT_ITEMS = 10
const SUGGESTIONS_DEBOUNCE_MS = 300
// Client-side deadline for a suggestion request. The API transport's own timeout is
// 15s, which is far too long for typeahead; we race against this and degrade quietly.
const SUGGESTIONS_TIMEOUT_MS = 2500
// The server truncates `q` past this anyway, so cap it before sending (§6).
const MAX_QUERY_LENGTH = 64
// Mirror the server minimums: latin/cyrillic need 2 chars (the server returns [] for a
// single one), but a lone CJK ideograph/kana/jamo is a whole word — the server suggests
// on one character (since 07.07), so don't gate those behind the 2-char floor.
const MIN_QUERY_LENGTH = 2
const MIN_QUERY_LENGTH_CJK = 1
// Han (+ ext. A), Hiragana, Katakana, Hangul (syllables + Jamo + compatibility Jamo).
const CJK_REGEX = /[ᄀ-ᇿ぀-ヿ㄰-㆏㐀-䶿一-鿿가-힯]/
// Session-scoped prefix cache. The common "type then backspace" pattern must not re-hit
// the network — the server would return the same list anyway (its own cache lives ~10min).
const SUGGESTIONS_CACHE_LIMIT = 50

// Insertion-ordered Map used as an LRU: reading refreshes recency, writing evicts oldest.
const suggestionsCache = new Map<string, string[]>()

const getMinQueryLength = (value: string): number =>
    CJK_REGEX.test(value) ? MIN_QUERY_LENGTH_CJK : MIN_QUERY_LENGTH

const normalizeQuery = (value: string): string => value.trim().slice(0, MAX_QUERY_LENGTH)

const readCache = (key: string): string[] | undefined => {
    const cached = suggestionsCache.get(key)
    if (cached === undefined) return undefined
    suggestionsCache.delete(key)
    suggestionsCache.set(key, cached)
    return cached
}

const writeCache = (key: string, value: string[]): void => {
    suggestionsCache.delete(key)
    suggestionsCache.set(key, value)
    if (suggestionsCache.size > SUGGESTIONS_CACHE_LIMIT) {
        const oldest = suggestionsCache.keys().next().value
        if (oldest !== undefined) suggestionsCache.delete(oldest)
    }
}

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
    new Promise<T>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('suggestions timeout')), ms)
        promise.then(
            value => {
                clearTimeout(timer)
                resolve(value)
            },
            error => {
                clearTimeout(timer)
                reject(error)
            },
        )
    })

/**
 * Autocomplete suggestions for the typed query via `GET /v2/search/suggest/scores`
 * (§6, MVP-light), requested with a client debounce. MVP returns only
 * `type: "text"` items; unknown types are skipped. Empty is a normal state, and
 * errors/timeouts (incl. 422 when device attestation fails) degrade to no suggestions.
 *
 * The input is trimmed and capped to 64 chars; requests below the server's per-script
 * minimum length are never sent; results are cached per session (LRU); and stale
 * responses are ignored so a slow earlier request can't overwrite a fresher one.
 */
export const useSearchSuggestions = (query: string): string[] => {
    const [suggestions, setSuggestions] = useState<string[]>([])
    const [debouncedQuery, setDebouncedQuery] = useState('')

    useEffect(() => {
        const normalized = normalizeQuery(query)
        if (normalized.length < getMinQueryLength(normalized)) {
            setDebouncedQuery('')
            return undefined
        }
        const timer = setTimeout(() => setDebouncedQuery(normalized), SUGGESTIONS_DEBOUNCE_MS)
        return () => clearTimeout(timer)
    }, [query])

    useEffect(() => {
        if (!debouncedQuery) {
            setSuggestions([])
            return undefined
        }

        const cached = readCache(debouncedQuery)
        if (cached !== undefined) {
            setSuggestions(cached)
            return undefined
        }

        let isCancelled = false
        withTimeout(fetchSearchSuggestions(debouncedQuery), SUGGESTIONS_TIMEOUT_MS)
            .then(response => {
                const texts = (response?.items ?? [])
                    .filter(item => item.type === 'text')
                    .map(item => item.text)
                writeCache(debouncedQuery, texts)
                if (!isCancelled) setSuggestions(texts)
            })
            .catch(() => {
                if (!isCancelled) setSuggestions([])
            })
        return () => {
            isCancelled = true
        }
    }, [debouncedQuery])

    return suggestions
}

/**
 * Recent searches to display: local query+filters entries first, server
 * text-only history filling the remaining slots.
 */
export const useRecentSearches = (): TRecentSearch[] => {
    const [searchHistory, recentSearches] = useValues([
        searchStoreChunk.props.getSearchHistory,
        searchStoreChunk.props.getRecentSearches,
    ])

    return useMemo(() => {
        const seen = new Set(recentSearches.map(item => item.query.toLowerCase()))
        const fromServer: TRecentSearch[] = searchHistory
            .filter(term => !seen.has(term.toLowerCase()))
            .map(term => ({ query: term, filters: [] }))
        return [...recentSearches, ...fromServer].slice(0, MAX_RECENT_ITEMS)
    }, [recentSearches, searchHistory])
}
