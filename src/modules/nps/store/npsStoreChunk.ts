import { createExtendedStoreChunk } from '@ug/store'

import type { TNpsSurveyType } from '../constants/npsConstants'

export type TNpsState = {
    shownSlots: TNpsSurveyType[]
}

const initialState: TNpsState = {
    shownSlots: [],
}

export const npsStoreChunk = createExtendedStoreChunk<TNpsState>({
    storeKey: 'nps',
    treeKey: 'modules',
})({
    initialState,
    persist: ['shownSlots'],
    actions: {
        addShownSlot: (slot: TNpsSurveyType, state: TNpsState) => ({
            shownSlots: state.shownSlots.includes(slot)
                ? state.shownSlots
                : [...state.shownSlots, slot],
        }),
        resetState: () => initialState,
    },
})
