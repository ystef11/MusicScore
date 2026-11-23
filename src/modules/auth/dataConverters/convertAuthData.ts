import { decodeJWS } from '@mu-native/common'

import type { TAuthData } from '../types/authTypes'

export const extractExpirationDate = (token: string | null) => {
    if (!token) return null
    const json = decodeJWS(token)
    return parseInt(json.exp, 10) * 1000
}

/** The signed-in part of the auth state; every field is `null` while logged out. */
export type TAuth = {
    access: TAuthData['accesses']
    outdatedAccesses: TAuthData['outdated_accesses']
    isActive: boolean
    rights: TAuthData['rights']
    trackingId: string | null
    token: string | null
    tokenExpiresAt: number | null
    refreshToken: string | null
    user: {
        avatar: string | null
        email: string | null
        id: number | null
        name: string | null
    }
}

export const convertAuthData = (data: TAuthData): TAuth => ({
    access: data.accesses,
    outdatedAccesses: data.outdated_accesses,
    isActive: data.is_active,
    rights: data.rights,
    trackingId: data.tracking_id,
    token: data.token,
    tokenExpiresAt: extractExpirationDate(data.token),
    refreshToken: data.refresh_token,
    user: {
        avatar: data.avatar,
        email: data.email,
        id: data.user_id,
        name: data.username,
    },
})
