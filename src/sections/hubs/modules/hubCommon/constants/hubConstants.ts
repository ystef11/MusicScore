import { THub, THubKey } from '../types/hubTypes.ts'

const hubNewForYouShortInfo: THub = {
    visible: true,
    alias: 'new-for-you',
    featured: false,
    imageBase: 'icon-new-for-you',
    id: 9999,
    title: 'new_for_you',
    requiresAuth: true,
}

const hubPopular: THub = {
    visible: true,
    alias: 'top100view',
    featured: false,
    imageBase: 'icon-top-100-view',
    id: 111,
    title: 'popular',
}

const hubSelectedForYou: THub = {
    visible: true,
    alias: 'selected-for-you',
    featured: false,
    imageBase: 'icon-selected-for-you',
    id: 538,
    title: 'selected_for_you',
    requiresAuth: true,
}

const hubGift: THub = {
    visible: true,
    alias: 'gift_view',
    featured: false,
    imageBase: 'icon-top-100-view',
    id: 0,
    title: 'gifts',
}

const predefinedHubs: THub[] = [hubGift, hubNewForYouShortInfo, hubPopular, hubSelectedForYou]
const hubNewForYou: THub = {
    ...hubNewForYouShortInfo,
    stat: { scores_count: 20, followers_count: 0 },
}

const HubTranslateKeys = {
    new: 'native.hub_new.title',
    piano: 'native.hub_piano.title',
    'film, tv & video games': 'native.hub_film, tv & video games.title',
    strings: 'native.hub_strings.title',
    woodwinds: 'native.hub_woodwinds.title',
    saxophone: 'native.hub_saxophone.title',
    trumpet: 'native.hub_trumpet.title',
    guitar: 'native.hub_guitar.title',
    voice: 'native.hub_voice.title',
    keyboard: 'native.hub_keyboard.title',
    percussion: 'native.hub_percussion.title',
    disney: 'native.hub_disney.title',
    'marching percussion': 'native.hub_marching percussion.title',
    brass: 'native.hub_brass.title',
    electronics: 'native.hub_electronics.title',
    folk: 'native.hub_folk.title',
    museclass: 'native.hub_museclass.title',
    new_for_you: 'native.hub_new_for_you.title',
    popular: 'native.hub_popular.title',
    selected_for_you: 'native.hub_popular.noAuthTitle',
    advent: 'native.hub_advent.title',
    gifts: 'native.hub_advent.gifts',
} as const

export const getTranslateKey = (key: THubKey) => HubTranslateKeys[key.toLowerCase() as THubKey]

export const hubConstants = {
    predefinedHubs,
    hubNewForYou,
    hubSelectedForYou,
    hubPopular,
    hubGift,
    getTranslateKey,
}
