/**
 * Guards a "the newest request wins" sequence: a caller claims a token before
 * its first await and checks it afterwards, so a slow answer that the user has
 * already moved on from is dropped instead of overwriting the fresh one.
 *
 * Opening a score is the case this exists for. openScore and openScoreInfo both
 * write setCurrentScore after awaiting the network, so opening a slow score,
 * leaving, and opening another one used to end with the first score's data on
 * the second score's screen (MUP-14313).
 */
export const createLatestOnly = () => {
    let latest = 0

    return {
        claim: () => {
            latest += 1

            return latest
        },
        isStale: (token: number) => token !== latest,
    }
}
