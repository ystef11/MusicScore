import { store } from '@mu-native/common'
import { debugStore } from '@mu-native/debug'

import { TAnalyticsParams } from '../types/rtAnalyticsTypes'

export const addEventToDebugStore = (event: string, params: TAnalyticsParams) => {
    const state = store.getState()
    if (debugStore.props.getIsEnabled(state)) {
        store.dispatch(
            debugStore.actions.addAnalytics({
                data: { ...params },
                title: event,
            }),
        )
    }
}

export const logger = {
    error: (error: string) => {
        console.log(error)
    },
    log: (...rest: any[]) => {
        console.log(rest[0])

        const [_, __, event] = rest
        if (event && event.event) {
            addEventToDebugStore(event.event, event)
        }
    },
}
