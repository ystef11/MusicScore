export const checkRequestStatus = async ({
    res,
    url,
    returnJSON = true,
}: {
    res: Response
    url: string
    returnJSON?: boolean
}) => {
    if ((res.status >= 200 && res.status < 300) || res.status === 0) {
        if (!returnJSON) return res

        try {
            // Must be awaited inside the try — res.json() rejects, it never throws
            // synchronously, so an unawaited call escaped this catch entirely.
            return await res.json()
        } catch (e) {
            throw new Error('ApiErrorParseJSON', { cause: `Failed to parse JSON for url: ${url}` })
        }
    }
    return Promise.reject(res)
}
