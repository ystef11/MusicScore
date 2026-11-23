import { translate } from '@mu-native/locale'

const quizTranslateKeys = {
    Piano: 'native.marketing.questions.instrument.list.piano',
    Saxophone: 'native.marketing.questions.instrument.list.saxophone',
    Woodwinds: 'native.marketing.questions.instrument.list.woodwinds',
    Percussion: 'native.marketing.questions.instrument.list.percussion',
    Trumpet: 'native.marketing.questions.instrument.list.trumpet',
    Brass: 'native.marketing.questions.instrument.list.brass',
    Voice: 'native.marketing.questions.instrument.list.voice',
    Guitar: 'native.marketing.questions.instrument.list.guitar',
    Other: 'native.marketing.questions.instrument.list.other',
    Violin: 'native.marketing.questions.instrument.list.violin',
    'Other strings': 'native.marketing.questions.instrument.list.other_strings',
    Viola: 'native.marketing.questions.instrument.list.viola',
    Cello: 'native.marketing.questions.instrument.list.cello',
    Contrabass: 'native.marketing.questions.instrument.list.contrabass',
    Banjo: 'native.marketing.questions.instrument.list.banjo',
    Ukulele: 'native.marketing.questions.instrument.list.ukulele',
    Trombone: 'native.marketing.questions.instrument.list.trombone',
    'French horn': 'native.marketing.questions.instrument.list.french_horn',
    Tuba: 'native.marketing.questions.instrument.list.tuba',
    'Other brass instruments': 'native.marketing.questions.instrument.list.other_brass',
    'Other free-reed instruments':
        'native.marketing.questions.instrument.list.other_free_reed_instruments',
    Accordion: 'native.marketing.questions.instrument.list.accordion',
    Organ: 'native.marketing.questions.instrument.list.organ',
    'Other woodwinds': 'native.marketing.questions.instrument.list.other_woodwinds',
    Bassoon: 'native.marketing.questions.instrument.list.bassoon',
    Oboe: 'native.marketing.questions.instrument.list.oboe',
    Flute: 'native.marketing.questions.instrument.list.flute',
    Clarinet: 'native.marketing.questions.instrument.list.clarinet',
    'Other instruments': 'native.marketing.questions.instrument.list.other_instruments',
    Vocals: 'native.vocals',
    Popular: 'native.filter_screen.popular',
    'String instruments': 'native.marketing.questions.instrument.list.string_instrument_title',
    'Brass instruments': 'native.marketing.questions.instrument.list.brass_instrument',
    'Free-reed instruments': 'native.marketing.questions.instrument.list.free_reed_instruments',
    'What instruments do you play or would like so start playing?':
        'native.marketing.questions.instrument.title',
    'What instruments do you play or would like to start playing?':
        'native.marketing.questions.instrument.title',
    'What genres of music are you interested in?': 'native.marketing.questions.genre.title',
    Classical: 'native.marketing.questions.genre.list.classical',
    Country: 'native.marketing.questions.genre.list.country',
    Folk: 'native.marketing.questions.genre.list.folk',
    Jazz: 'native.marketing.questions.genre.list.jazz',
    'New age': 'native.marketing.questions.genre.list.new_age',
    Pop: 'native.marketing.questions.genre.list.pop',
    Rock: 'native.marketing.questions.genre.list.rock',
    Soundtrack: 'native.marketing.questions.genre.list.soundtrack',
    'Religious music': 'native.marketing.questions.genre.list.religious_music',
    Blues: 'native.marketing.questions.genre.list.blues',
    'Hip-Hop': 'native.marketing.questions.genre.list.hip_hop',
    Electronic: 'native.marketing.questions.genre.list.electronic',
    Metal: 'native.marketing.questions.genre.list.metal',
    'Reggae & ska': 'native.marketing.questions.genre.list.reggae_and_ska',
    'R&B, Funk & Soul': 'native.marketing.questions.genre.list.rnb_funk_and_soul',
    Disco: 'native.marketing.questions.genre.list.disco',
    Darkwave: 'native.marketing.questions.genre.list.darkwave',
    'Global music': 'native.marketing.questions.genre.list.world_music',
    Experimental: 'native.marketing.questions.genre.list.experimental',
    Comedy: 'native.marketing.questions.genre.list.comedy',
    'Modern classical': 'native.marketing.questions.genre.list.classical_modern',
    'Cinematic classical': 'native.marketing.questions.genre.list.classical_cinematic',
    'Neoclassical new age': 'native.marketing.questions.genre.list.classical_neoclassical',
    'Pop soul': 'native.marketing.questions.genre.list.pop_soul',
    'Indie pop': 'native.marketing.questions.genre.list.pop_indi',
    'Dance-pop': 'native.marketing.questions.genre.list.pop_dance',
    'Folk pop': 'native.marketing.questions.genre.list.pop_folk',
    Electropop: 'native.marketing.questions.genre.list.pop_electro',
    'Chamber pop': 'native.marketing.questions.genre.list.pop_chamber',
    'Art pop': 'native.marketing.questions.genre.list.pop_art',
    'Piano rock': 'native.marketing.questions.genre.list.rock_piano',
    'Hard rock': 'native.marketing.questions.genre.list.rock_hard',
    'Vocal jazz': 'native.marketing.questions.genre.vocal_jazz',
    'Alternative rock': 'native.marketing.questions.genre.list.rock_alternative',
    'Pop Rock': 'native.marketing.questions.genre.list.pop_rock',
    'Soundtrack christmas': 'native.marketing.questions.genre.list.soundtrack_christmas',
    'World music': 'native.marketing.questions.genre.world_music',
    'Singer-songwriter': 'native.marketing.questions.genre.list.soundtrack_singer',
    'Soundtrack game': 'native.marketing.questions.genre.list.soundtrack_game',
    'Traditional pop': 'native.marketing.questions.genre.list.pop_traditional',
    'How would you rate your highest level of playing a musical instrument?':
        'native.marketing.questions.level.list.title',
    Beginner: 'native.marketing.questions.level.list.beginner',
    'Can read notation': 'native.marketing.questions.level.list.can_read_notation',
    Intermediate: 'native.marketing.questions.level.list.intermediate',
    Professional: 'native.marketing.questions.level.list.professional',
    Virtuoso: 'native.marketing.questions.level.list.virtuoso',
    'Select your age': 'native.marketing.questions.age.list.title',
    'This will help us suggest more relevant content for you':
        'native.marketing.questions.age.list.sub_title',
    'Under 18': 'native.marketing.questions.age.list.18',
    '55 and over': 'native.marketing.questions.age.list.55',
    "What's your current top musical goal?": 'native.marketing.questions.goal.title',
    'Master a specific piece': 'native.marketing.questions.goal.master',
    'Prepare for perfomances, recitals or concerts': 'native.marketing.questions.goal.prepare',
    'Teach music to other': 'native.marketing.questions.goal.teach',
    'Learn to play for fun': 'native.marketing.questions.goal.learn',
    'Great choice. What is your first step with MuseScore towards your goal?':
        'native.marketing.questions.goal.title2',
    'Find quality content': 'native.marketing.questions.goal.find',
    'Discover new sheet music': 'native.marketing.questions.goal.discover',
    "Find specific recording I'm interested in playing": 'native.marketing.questions.goal.specific',
    'Find music tailored to my skill level': 'native.marketing.questions.goal.music',
    'Do you agree with the statement?': 'native.marketing.questions.agree.title',
    Yes: 'native.marketing.questions.agree.yes',
    No: 'native.marketing.questions.agree.no',
    'Staying motivated to practice can be tricky sometimes':
        'native.marketing.questions.agree.stay',
    'Stay in rhythm': 'native.marketing.questions.agree.stay_in_rhythm',
    'MuseScore can remind you when it’s time to practice':
        'native.marketing.questions.agree.can_remind',
    'Playing a musical instrument can be challenging': 'native.marketing.questions.agree.play_hard',
    'It takes time to practice playing any composition':
        'native.marketing.questions.agree.takes_time',
    "You've come to the right place": 'native.marketing.questions.agree.you_come',
    "We know, that's why we offer tools like Practice Mode, Loop, and Tempo Control.":
        'native.marketing.questions.agree.we_know',
    'MuseScore supports your practice': 'native.marketing.questions.agree.support',
    'It’s often easier to grow when the music matches your level':
        'native.marketing.questions.agree.easier',
    'MuseScore offers a variety of versions for different instruments and levels':
        'native.marketing.questions.agree.offers',
    'MuseScore reminds you of practice': 'native.marketing.questions.agree.reminds',
    'trust and rely on MuseScore preparing for a performance':
        'native.marketing.questions.social.trust',
    'spanning 20 expansive genres': 'native.marketing.questions.social.spanning',
    ', including high quality content licensed directly from publishers':
        'native.marketing.questions.social.including',
    'including a wide variety of arrangements': 'native.marketing.questions.social.variety',
    'suitable for your level, from total beginner to maestro':
        'native.marketing.questions.social.suitable',
    'for more than 170 musical instruments': 'native.marketing.questions.social.more',
    'trust and rely on MuseScore to master the music they love':
        'native.marketing.questions.social.trust_rely',
    'passionately teach students of different levels':
        'native.marketing.questions.social.different',
    'share your passion for music': 'native.marketing.questions.social.share',
} as const

const quizTranslateKeysWithParams = {
    'There are more than [b]13M[/b] musicians like you, including those who {id100}. MuseScore offers [b]1.6M[/b] scores{id103}':
        'native.marketing.questions.social_proof.content_scores_count',
} as const

export const getQuizTranslateString = (
    key?: string,
    params?: { id100: string; id103: string; scoresCount: string },
) => {
    try {
        if (!key) return ''
        if (typeof key !== 'string') return key
        if (!quizTranslateKeys?.[key.trim() as keyof typeof quizTranslateKeys] && !params) {
            return key
        }

        const keyWithParams =
            quizTranslateKeysWithParams?.[key?.trim() as keyof typeof quizTranslateKeysWithParams]

        if (keyWithParams) {
            return translate(keyWithParams, params!)
        }

        const currentKey = quizTranslateKeys[key.trim() as keyof typeof quizTranslateKeys]

        return currentKey ? translate(currentKey) : key
    } catch (e) {
        return key || ''
    }
}
