import { createExtendedStoreChunk } from '@ug/store'

type TNavigationState = {
    previousScreenName: string | null
    currentScreenName: string | null
}

export const navigationStoreChunk = createExtendedStoreChunk<TNavigationState>({
    treeKey: 'modules',
    storeKey: 'navigation',
})({
    initialState: {
        previousScreenName: null,
        currentScreenName: null,
    },
    actions: {
        setScreens: (screenName: TNavigationState['currentScreenName'], state) => {
            if (screenName === state.currentScreenName) {
                return state
            }

            return {
                ...state,
                previousScreenName: state.currentScreenName,
                currentScreenName: screenName,
            }
        },
    },
})
