import { memo, ReactNode, useEffect, useState } from 'react'

import { authStoreChunk, authThunks } from '@mu-native/auth'
import { useActions, useValues } from '@ug/store'

import reportEvent from '../../../App/Utils/Analytics'

const minToleratedTokenTTL = 15 * 60 * 1000 // 15 min

export const SetupAuthTokenContainer = memo(({ children }: { children: ReactNode }) => {
    const [token, expiresAt, refreshToken] = useValues([
        authStoreChunk.props.getToken,
        authStoreChunk.props.getTokenExpiresAt,
        authStoreChunk.props.getRefreshToken,
    ])
    const actions = useActions({
        logout: authThunks.logout,
        refreshToken: authThunks.refreshToken,
    })
    const [ready, setReady] = useState(!token)
    useEffect(() => {
        async function restoreMobileSession() {
            try {
                if (!token) return
                const leftToLive = (expiresAt ?? 0) - Date.now()
                if (leftToLive >= minToleratedTokenTTL) return
                if (!refreshToken) {
                    reportEvent('Dev: refresh token not found on start')
                    await actions.logout(true)
                    return
                }
                reportEvent('Dev: refresh token on start', {
                    left_to_live: Math.round(leftToLive / 1000 / 60),
                })
                await actions.refreshToken(refreshToken)
            } catch {
                console.warn('Could not refresh the mobile session on startup')
            } finally {
                setReady(true)
            }
        }
        void restoreMobileSession()
    }, [])

    if (!ready) return null

    return <>{children}</>
})
