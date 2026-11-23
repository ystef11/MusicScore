import { createExtendedStoreChunk } from '@ug/store'

type ProfileScreenStoreChunk = {
    activeTab: number
}
export const profileScreenStoreChunk = createExtendedStoreChunk<ProfileScreenStoreChunk>({
    treeKey: 'screens',
    storeKey: 'profile',
})({
    persist: ['activeTab'],
    initialState: {
        activeTab: 1,
    },
})
