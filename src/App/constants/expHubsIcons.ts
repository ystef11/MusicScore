import { BrandDesignExperimentTypes } from '@mu-native/ab'
import { hubIcons, SvgAssetType } from '@mu-native/ds'

const expHubIcons: Record<string, { uri: string } | SvgAssetType> = {
    'icon-halloween': hubIcons.hubHalloween,
    'icon-christmas': hubIcons.hubChristmas,

    'icon-electronics': hubIcons.hubElectronics,
    'icon-folk': hubIcons.hubFolk,
    'icon-guitar': hubIcons.hubGuitar,
    'icon-keyboard': hubIcons.hubKeyboard,
    'icon-marching-percussion': hubIcons.hubMarchingPercussion,
    'icon-percussion': hubIcons.hubPercussion,
    'icon-piano': hubIcons.hubPianoCourses,
    'icon-saxophone': hubIcons.hubSaxophone,
    'icon-strings': hubIcons.hubString,
    'icon-trumpet': hubIcons.hubTrumpet,
    'icon-videogameandtv': hubIcons.hubVideoGameAndTv,
    'icon-voice': hubIcons.hubVoice,
    'icon-woodwinds': hubIcons.hubWoodwinds,
    'icon-brass': hubIcons.hubBrass,
    'icon-new-for-you': hubIcons.hubNewForYou,
    'icon-top-100-view': hubIcons.hubPopular,
    'icon-selected-for-you': hubIcons.hubForYou,
    'icon-disney': hubIcons.hubDisney,
    museclass: hubIcons.hubMuseClass,
    ic_gift: 'ic_gift',
}

const expHubIcons2: Record<string, SvgAssetType> = {
    'icon-new-for-you': 'ic_hub_new_for_you',
    'icon-top-100-view': 'ic_hub_popular',
    'icon-piano': 'ic_hub_piano',
    'icon-videogameandtv': 'ic_hub_video_game_tv',
    'icon-strings': 'ic_hub_strings',
    'icon-woodwinds': 'ic_hub_woodwings',
    'icon-saxophone': 'ic_hub_saxophone',
    'icon-trumpet': 'ic_hub_trumpet',
    'icon-guitar': 'ic_hub_guitar',
    'icon-voice': 'ic_hub_voice',
    'icon-keyboard': 'ic_hub_keyboard',
    'icon-percussion': 'ic_hub_percussion',
    'icon-disney': 'ic_hub_disney',
    'icon-marching-percussion': 'ic_hub_marching_percussion',
    'icon-brass': 'ic_hub_brass',
    'icon-electronics': 'ic_hub_electronics',
    'icon-folk': 'ic_hub_folk',
    'icon-selected-for-you': 'ic_hub_for_you',
    museclass: 'ic_hub_museclass',
    ic_gift: 'ic_gift',
}

export type HubIconKey = keyof typeof expHubIcons2

export function getHubIcon(
    type: HubIconKey,
    experiment: BrandDesignExperimentTypes | undefined = 'A',
) {
    if (experiment === 'A' && type === 'icon-selected-for-you') return 'ic_hub_for_you_old'
    if (experiment === 'A') return expHubIcons[type]
    return expHubIcons2[type]
}
