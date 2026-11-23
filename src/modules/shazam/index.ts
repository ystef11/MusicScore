import { DeviceEventEmitter, NativeEventEmitter, NativeModules, Platform } from 'react-native'
import { LaunchArguments } from 'react-native-launch-arguments'

import { apiRequest, shazamContracts, type TShazamTokenDto } from '@mu-native/api'

import { decodeJWS } from '../../common/helpers/jws'

export { shazamStoreChunk } from './store/shazamStoreChunk'
export type { TShazamSearchMeta, TShazamSearchMode } from './store/shazamStoreChunk'
export { shazamScoreListStoreChunk } from './store/shazamScoreListStoreChunk'
export { shazamSearchThunks } from './store/shazamSearchThunks'
export {
    getShazamScores,
    getShazamFilterParams,
    getShazamFiltersAsQueryParams,
    getShazamFlattenedSelectedFilters,
    getShazamSortAsQueryParams,
    getShazamSelectedFiltersQuantity,
} from './store/shazamSelectors'
export { shazamFilterSelections } from './store/shazamFilterSelections'
export { buildShazamScoreClickEventParams } from './helpers/shazamAnalytics'
export { useLoadShazamStoreChunk } from './store/useLoadShazamStoreChunk'
export { ShazamResultsScreen } from '../../sections/shazam/ShazamResultsScreen'
export { ShazamBriefingSheet } from '../../sections/shazam/components/ShazamBriefingSheet'
export { ShazamSearchButton } from '../../sections/shazam/components/ShazamSearchButton'

export type ShazamMatch = {
    title: string
    artist: string
    composer: string
    artworkURL: string
    appleMusicURL: string
    appleMusicID: string
    shazamID: string
    isrc: string
    subtitle: string
    genres: string[]
}

// Backend issues a signed Apple Developer JWT (ES256). The TTL is encoded in
// the JWT `exp` claim — the response itself only carries the token.
export type ShazamTokenResponse = TShazamTokenDto

type ShazamNativeModule = {
    isAvailable: () => Promise<boolean>
    start: (developerToken: string) => Promise<null>
    stop: () => Promise<null>
}

const nativeModule = (NativeModules.ShazamModule ?? null) as ShazamNativeModule | null

type ShazamEvents = {
    ShazamMatch: [ShazamMatch]
    ShazamNoMatch: []
    ShazamError: [{ message: string }]
}

// Detox has no microphone to feed ShazamKit, so e2e runs pass the match as a launch argument.
const mockMatch = ((): ShazamMatch | null => {
    const { shazamMock } = LaunchArguments.value<{ shazamMock?: string | ShazamMatch }>() ?? {}
    if (!shazamMock) return null
    if (typeof shazamMock !== 'string') return shazamMock
    try {
        return JSON.parse(shazamMock) as ShazamMatch
    } catch {
        return null
    }
})()

const MOCK_MATCH_DELAY_MS = 2_000

let mockMatchTimer: ReturnType<typeof setTimeout> | null = null

const emitter = nativeModule
    ? new NativeEventEmitter<ShazamEvents>(NativeModules.ShazamModule)
    : null

// Per backend spec: refresh proactively if <60s remain to dodge clock-skew /
// in-flight Apple requests landing on an expired JWT.
const TOKEN_REFRESH_BUFFER_MS = 60_000

// Fallback expiry if we can't decode the JWT for any reason. Backend issues
// 15-minute tokens; assuming a shorter window is the safe default.
const FALLBACK_TTL_MS = 5 * 60_000

const decodeJwtExpMs = (jwt: string): number | null => {
    try {
        const payload = decodeJWS(jwt) as { exp?: unknown }
        return typeof payload.exp === 'number' ? payload.exp * 1000 : null
    } catch {
        return null
    }
}

let cachedToken: { token: string; expiresAtMs: number } | null = null

const fetchShazamTokenFromApi = async (): Promise<ShazamTokenResponse> =>
    apiRequest(shazamContracts.token)

let tokenResolver: () => Promise<string> = async () => {
    const now = Date.now()
    if (cachedToken && cachedToken.expiresAtMs - TOKEN_REFRESH_BUFFER_MS > now) {
        return cachedToken.token
    }
    const response = await fetchShazamTokenFromApi()
    const expMs = decodeJwtExpMs(response.token) ?? now + FALLBACK_TTL_MS
    cachedToken = { token: response.token, expiresAtMs: expMs }
    return response.token
}

// Override the token source (e.g. for tests or alternative auth flows).
export const setShazamTokenResolver = (resolver: () => Promise<string>) => {
    tokenResolver = resolver
    cachedToken = null
}

export const clearShazamTokenCache = () => {
    cachedToken = null
}

export const isShazamSupported = (): boolean => {
    if (nativeModule === null) return false
    if (Platform.OS === 'ios') return parseInt(String(Platform.Version), 10) >= 15
    if (Platform.OS === 'android') return Platform.Version >= 21
    return false
}

export const checkShazamAvailable = async (): Promise<boolean> => {
    if (!nativeModule) return false
    try {
        return await nativeModule.isAvailable()
    } catch {
        return false
    }
}

export const startShazam = async (): Promise<void> => {
    if (mockMatch) {
        mockMatchTimer = setTimeout(() => {
            mockMatchTimer = null
            DeviceEventEmitter.emit('ShazamMatch', mockMatch)
        }, MOCK_MATCH_DELAY_MS)
        return
    }
    if (!nativeModule) throw new Error('ShazamModule is not available on this platform')
    // iOS uses MusicKit/SHSession on-device and does not need a developer token; pass an empty
    // string to keep the bridge signature uniform across platforms.
    const developerToken = Platform.OS === 'android' ? await tokenResolver() : ''
    await nativeModule.start(developerToken)
}

export const stopShazam = async (): Promise<void> => {
    if (mockMatch) {
        if (mockMatchTimer) clearTimeout(mockMatchTimer)
        mockMatchTimer = null
        return
    }
    if (!nativeModule) return
    await nativeModule.stop()
}

export const addShazamMatchListener = (listener: (match: ShazamMatch) => void) =>
    emitter?.addListener('ShazamMatch', listener)

export const addShazamNoMatchListener = (listener: () => void) =>
    emitter?.addListener('ShazamNoMatch', listener)

export const addShazamErrorListener = (listener: (error: { message: string }) => void) =>
    emitter?.addListener('ShazamError', listener)
