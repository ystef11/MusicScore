import { TAnalyticsEvent } from '@muse/analytics'
import { crc32 } from './crs32'

export const createHash = (event: TAnalyticsEvent) => {
    return crc32(JSON.stringify(Object.values(event)))
}
