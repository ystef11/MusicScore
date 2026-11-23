import type { TThunkAction } from '@mu-native/common'

// No attribution SDK initialization, device identifiers or account linking.
export const initAppsFlyerThunk: TThunkAction = () => async () => {}
export const reLinkAppsFlyerThunk: TThunkAction = () => () => {}
export const analyticsThunks = { reLinkAppsFlyerThunk, initAppsFlyerThunk }
