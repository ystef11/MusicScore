import type { TAnalyticsEvent } from '@muse/analytics'
import throttle from 'lodash.throttle'
import { getEventId } from './helpers/getEventId'
import { createHash } from './helpers/createHash'
import type {
    TAnalyticsTransportOptions,
    TAnalyticsTransportConfig,
    TAnalyticsEventWithId,
    TBufferCapacityEvent,
} from './types/AnalyticsTypes'
import { LogStorage } from './storage'

const defaultOptions: TAnalyticsTransportOptions = {
    limit: 20,
    retryCount: 5,
    retryInterval: 1000,
    logCapacityLevel: 0,
}

/**
 * Функция для создания react native транспорта аналитики
 * @param config конфиг транспорта аналитики
 */
export const createAnalyticsTransport = (config: TAnalyticsTransportConfig) => {
    const { options: externalOptions = {}, persistentStorage, dispatch, logger } = config
    const options = { ...defaultOptions, ...externalOptions }
    const storage = new LogStorage({ persistentStorage })

    const sessionStartTime = Date.now()
    let sessionEventsCount = 0
    let sessionRequestsCount = 0

    let requestPostPending = false

    const filterDoubles = (events: TAnalyticsEventWithId[]) => {
        const result: TAnalyticsEventWithId[] = []
        const hashedEvents = events.map(createHash)
        const sendedEvents: number[] = storage.sentStorage.ids.map((id: string) =>
            createHash(storage.sentStorage[id]),
        )
        hashedEvents.forEach((ev, index) => {
            const poppedEvents = hashedEvents.filter((_, _index) => index !== _index)
            const targetEvents = [...poppedEvents, ...sendedEvents]
            if (!targetEvents.includes(ev)) {
                result.push(events[index])
            }
        })
        return result
    }

    const storeEvent = (event: TAnalyticsEvent) => {
        const eventId = getEventId()

        storage.set(eventId, {
            ...event,
            eventId,
        })
    }

    const getBufferCapacityEvent = (
        eventName: string,
        sentCount: number,
        remainsCount: number,
    ): TBufferCapacityEvent => {
        const sessionDuration = Math.round(Math.round(Date.now() - sessionStartTime) / 1000)

        return {
            _type: 'bc',
            event: eventName,
            eventId: getEventId(),
            sent_count: sentCount,
            remains_count: remainsCount,
            session_duration: sessionDuration,
            session_events_count: sessionEventsCount,
            session_requests_count: sessionRequestsCount,
        }
    }

    const withBufferCapacityEvent = (events: TAnalyticsEventWithId[]) => {
        const { logCapacityLevel } = options

        if (logCapacityLevel > 0) {
            const eventName = events[events.length - 1].event || events[events.length - 1].eventId
            const sentCount = events.length
            let remainsCount = 0

            const l = storage.storage.ids.length
            if (l - sentCount > 0) {
                remainsCount = l - sentCount
            }

            const logCapacityEnabled =
                logCapacityLevel === 2 || logCapacityLevel === 1 ? remainsCount > 0 : false

            if (logCapacityEnabled && eventName) {
                const bufferCapacityEvent = getBufferCapacityEvent(
                    eventName,
                    sentCount,
                    remainsCount,
                )

                return [...events, bufferCapacityEvent]
            }
        }

        return events
    }

    const sendEvents = throttle(async ({ limit, retryCount } = options) => {
        try {
            if (!retryCount || requestPostPending) {
                return
            }

            const ids: string[] = storage.storage.ids.slice(0, limit)

            const events: TAnalyticsEventWithId[] = ids.map((id: string) => storage.storage[id])
            const eventsToSend = withBufferCapacityEvent(events)

            if (events.length === 0) {
                return
            }

            requestPostPending = true

            const filteredDoubledEvents = filterDoubles(eventsToSend)
            storage.clean(ids)

            const eventsForPending = filteredDoubledEvents.slice()
            const res = await dispatch(eventsForPending)

            if (res?.httpStatus === 200) {
                if (storage.shouldStoreSentEvents) {
                    const { sentStorage } = storage
                    if (Array.isArray(sentStorage.ids)) {
                        sentStorage.ids = sentStorage.ids.concat(ids)
                    } else {
                        sentStorage.ids = ids
                    }
                    eventsForPending.forEach(event => {
                        sentStorage[event.eventId] = event
                    })
                }

                sessionEventsCount += eventsForPending.length
                sessionRequestsCount += 1
            } else {
                requestPostPending = false

                sendEvents({
                    ...options,
                    retryCount: retryCount - 1,
                })
            }
        } catch (error) {
            if (error instanceof Error) {
                logger.error('Events sending error')
            }
        } finally {
            requestPostPending = false
        }
    }, options.retryInterval)

    const queue = (event: TAnalyticsEvent) => {
        storeEvent(event)

        if (storage.storage.ids.length >= options.limit) {
            sendEvents()
        }
    }

    const send = (event: TAnalyticsEvent) => {
        storeEvent(event)
        sendEvents()
    }

    const setOptions = (newOptions: Partial<TAnalyticsTransportOptions>) => {
        Object.assign(options, newOptions)
    }

    const flush = () => {
        sendEvents()
    }

    return {
        send,
        queue,
        setOptions,
        flush,
    }
}
