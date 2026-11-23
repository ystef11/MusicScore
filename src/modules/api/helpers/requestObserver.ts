// Seam so the api module never has to import its observers: `@mu-native/performance` registers
// here to attribute request durations to the screen that started them.
type TRequestObserver = (url: string) => (() => void) | undefined

let observer: TRequestObserver | null = null

export const setRequestObserver = (next: TRequestObserver | null) => {
    observer = next
}

/**
 * Reports a request to the observer. `createApi` calls it for every API request; traffic that
 * bypasses `getApi()` (the score file download) calls it with a stable route label instead of
 * a URL.
 */
export const notifyRequestStart = (url: string) => observer?.(url)
