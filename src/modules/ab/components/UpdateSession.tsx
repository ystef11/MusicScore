import { useEffect, useRef } from 'react'
import { useActions, useValues } from '@ug/store'
import { systemStoreChunk } from '@mu-native/system'

import { abStoreChunk } from '../store/abStoreChunk'
import { updateSession } from '../store/abThunks'

export const UpdateSession = () => {
    const actions = useActions({
        updateSession,
    })

    const [appState, session, network] = useValues([
        systemStoreChunk.props.getAppState,
        abStoreChunk.props.getSession,
        systemStoreChunk.props.getNetwork,
    ])

    const wasInBackground = useRef(false)

    useEffect(() => {
        if (appState === 'background') wasInBackground.current = true

        if (!session.expireDuration) {
            if (network?.isConnected) actions.updateSession()
            return undefined
        }
        if (appState !== 'active') return undefined

        // A warm return sends no /ab/test, so after a long break the server only opens the new
        // session on this refresh; waiting for the next tick would lose short visits.
        if (wasInBackground.current) {
            wasInBackground.current = false
            actions.updateSession()
        }

        let timer: ReturnType<typeof setTimeout> | undefined
        const scheduleUpdate = () => {
            timer = setTimeout(() => {
                actions.updateSession()
                scheduleUpdate()
            }, session.expireDuration * 1000)
        }
        scheduleUpdate()

        return () => {
            if (timer) clearTimeout(timer)
        }
    }, [actions, appState, session?.expireDuration, network?.isConnected])

    return null
}
