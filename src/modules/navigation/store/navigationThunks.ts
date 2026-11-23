import { TThunkAction, store } from '@mu-native/common'

import { navigationStoreChunk } from './navigationStoreChunk'

const setScreen: TThunkAction<string | null> = screenName => async dispatch => {
    try {
        dispatch(navigationStoreChunk.actions.setScreens(screenName))
    } catch (error) {
        console.log('PAGE VIEW ERROR', error)
    }
}

export const navigationThunks = {
    setScreen,
}
