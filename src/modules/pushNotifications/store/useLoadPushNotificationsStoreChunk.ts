import { useInjectStoreChunk } from '@ug/store'
import { pushNotificationsStoreChunk } from './pushNotificationsStoreChunk'

export const useLoadPushNotificationsStoreChunk = () => {
    useInjectStoreChunk(
        pushNotificationsStoreChunk,
        'modules',
        pushNotificationsStoreChunk.getInitialState(),
    )
}
