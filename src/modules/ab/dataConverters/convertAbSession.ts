import type { TAbSessionDto } from '@mu-native/api'

import type { TAbState } from '../store/abStoreChunk'

export const convertAbSession = (session: TAbSessionDto): TAbState['session'] => ({
    expireDuration: session.expire_duration,
    id: session.id,
    number: session.number ?? null,
})
