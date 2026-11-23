/**
 * Runs one operation per key at a time: while a call is in flight, later callers
 * with the same key get the running promise instead of starting their own.
 *
 * Downloading a score is the case this exists for. Opening one score can start
 * two downloads at once — the Score Info preview and Play — and both write to
 * the same `<id>-<revision>.mscz.download` temp file. The first to finish
 * renames it to the final name, and the second then fails on a file that is no
 * longer there: ENOENT out of `isCompleteZip` or `moveFile`, surfacing to the
 * user as globalDownloadFail (MUP-14163 dealt with the destination side of this
 * race, not the temp file). Nothing is cached: the key is released as soon as
 * the operation settles, so the next open re-runs it.
 */
export const createSingleFlight = () => {
    const inFlight = new Map<string, Promise<unknown>>()

    return <T>(key: string, operation: () => Promise<T>): Promise<T> => {
        const running = inFlight.get(key)
        if (running) return running as Promise<T>

        // A synchronous throw must not leave the key occupied, so the call is
        // wrapped rather than invoked bare.
        const started = (async () => operation())().finally(() => {
            inFlight.delete(key)
        })

        inFlight.set(key, started)

        return started
    }
}
