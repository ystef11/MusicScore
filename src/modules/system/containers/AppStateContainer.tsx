import { useEffect } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import { useActions } from '@ug/store'
import { getCurrentAppState } from '../helpers/getCurrentAppState'
import { systemStoreChunk } from '../store/systemStoreChunk'

export const AppStateContainer = () => {
    const { setAppState } = useActions({ setAppState: systemStoreChunk.actions.setAppState })

    useEffect(() => {
        // The store reads the state once at module load; a launch under a system prompt reads
        // 'inactive' there, and the change to 'active' may come before this subscription.
        setAppState(getCurrentAppState())

        const handleStateChange = (nextState: AppStateStatus) => {
            setAppState(nextState)
        }
        const appState = AppState.addEventListener('change', handleStateChange)

        return () => {
            appState?.remove()
        }
    }, [])

    return null
}
