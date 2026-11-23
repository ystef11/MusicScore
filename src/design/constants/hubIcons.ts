import { platform } from '@mu-native/common/constants/platform'

const { isIos } = platform
export const hubIcons = {
    hubForYou: {
        uri: isIos ? 'hub_for_you.png' : 'asset:/custom/hub_for_you.png',
    },
    hubPopular: {
        uri: isIos ? 'blue-star.png' : 'asset:/custom/blue-star.png',
    },
    hubChristmas: {
        uri: isIos ? 'christmas.png' : 'asset:/custom/christmas.png',
    },
    hubElectronics: {
        uri: isIos ? 'electronics.png' : 'asset:/custom/electronics.png',
    },
    hubFolk: {
        uri: isIos ? 'folk.png' : 'asset:/custom/folk.png',
    },
    hubGuitar: {
        uri: isIos ? 'hub_guitar.png' : 'asset:/custom/hub_guitar.png',
    },
    hubHalloween: {
        uri: isIos ? 'halloween.png' : 'asset:/custom/halloween.png',
    },
    hubKeyboard: {
        uri: isIos ? 'keyboard.png' : 'asset:/custom/keyboard.png',
    },
    hubMarchingPercussion: {
        uri: isIos ? 'marching-percussion.png' : 'asset:/custom/marching-percussion.png',
    },
    hubPercussion: {
        uri: isIos ? 'percussion.png' : 'asset:/custom/percussion.png',
    },
    hubPianoCourses: {
        uri: isIos ? 'piano_courses.png' : 'asset:/custom/piano_courses.png',
    },
    hubSaxophone: {
        uri: isIos ? 'saxophone.png' : 'asset:/custom/saxophone.png',
    },
    hubString: {
        uri: isIos ? 'strings.png' : 'asset:/custom/strings.png',
    },
    hubTrumpet: {
        uri: isIos ? 'trumpet.png' : 'asset:/custom/trumpet.png',
    },
    hubVideoGameAndTv: {
        uri: isIos ? 'videogameandtv.png' : 'asset:/custom/videogameandtv.png',
    },
    hubVoice: {
        uri: isIos ? 'voice.png' : 'asset:/custom/voice.png',
    },
    hubWoodwinds: {
        uri: isIos ? 'woodwinds.png' : 'asset:/custom/woodwinds.png',
    },
    hubBrass: {
        uri: isIos ? 'brass.png' : 'asset:/custom/brass.png',
    },
    hubNewForYou: {
        uri: isIos ? 'new-for-you.png' : 'asset:/custom/new-for-you.png',
    },
    hubDisney: {
        uri: isIos ? 'disney.png' : 'asset:/custom/disney.png',
    },
    hubMuseClass: {
        uri: isIos ? 'museclass.png' : 'asset:/custom/museclass.png',
    },
}
