/** Creation time of a server session id (`<version>.<created, unix s>.<updated, unix s>`), in ms. */
export function getServerSessionStartedAt(sessionId: string): number | null {
    const createdAt = Number(sessionId.split('.')[1])

    return Number.isInteger(createdAt) && createdAt > 0 ? createdAt * 1000 : null
}
