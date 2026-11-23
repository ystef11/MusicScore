import { LocaleKey, translate } from '@mu-native/locale'

const instruments: Record<string, LocaleKey> = {
    any_instrument: 'native.instrument.any_instrument',
    piano: 'native.instrument.piano',
    harpsichord: 'native.instrument.harpsichord',
    percussion: 'native.instrument.percussion',
    organ: 'native.instrument.organ',
    accordion: 'native.instrument.accordion',
    harmonica: 'native.instrument.harmonica',
    guitar: 'native.instrument.guitar',
    bass: 'native.instrument.bass',
    violin: 'native.instrument.violin',
    viola: 'native.instrument.viola',
    cello: 'native.instrument.cello',
    contrabass: 'native.instrument.contrabass',
    strings: 'native.instrument.strings',
    harp: 'native.instrument.harp',
    timpani: 'native.instrument.timpani',
    trumpet: 'native.instrument.trumpet',
    trombone: 'native.instrument.trombone',
    tuba: 'native.instrument.tuba',
    french_horn: 'native.instrument.french_horn',
    brass_ensemble: 'native.instrument.brass_ensemble',
    soprano_saxophone: 'native.instrument.soprano_saxophone',
    alto_saxophone: 'native.instrument.alto_saxophone',
    tenor_saxophone: 'native.instrument.tenor_saxophone',
    baritone_saxophone: 'native.instrument.baritone_saxophone',
    oboe: 'native.instrument.oboe',
    english_horn: 'native.instrument.english_horn',
    bassoon: 'native.instrument.bassoon',
    clarinet: 'native.instrument.clarinet',
    piccolo: 'native.instrument.piccolo',
    flute: 'native.instrument.flute',
    recorder: 'native.instrument.recorder',
    other_woodwinds: 'native.instrument.other_woodwinds',
    synthesizer: 'native.instrument.synthesizer',
    sound_effects: 'native.instrument.sound_effects',
    bagpipe: 'native.instrument.bagpipe',
    brass: 'native.instrument.brass',
    keyboard: 'native.instrument.keyboard',
    effect: 'native.instrument.effect',
    metal: 'native.instrument.metal',
    'percussion_-_body': 'native.instrument.percussion_-_body',
    'percussion_-_drum': 'native.instrument.percussion_-_drum',
    'percussion_-_metal': 'native.instrument.percussion_-_metal',
    'percussion_-_pitched': 'native.instrument.percussion_-_pitched',
    'percussion_-_wood': 'native.instrument.percussion_-_wood',
    'strings_-_bowed': 'native.instrument.strings_-_bowed',
    'strings_-_plucked': 'native.instrument.strings_-_plucked',
    voice: 'native.instrument.voice',
    woodwinds: 'native.instrument.woodwinds',
    saxophone_alto: 'native.instrument.alto_saxophone',
    saxophone_tenor: 'native.instrument.tenor_saxophone',
    saxophone_baritone: 'native.instrument.baritone_saxophone',
    saxophone_soprano: 'native.instrument.soprano_saxophone',
    flute_piccolo: 'native.instrument.piccolo',
    vocals: 'native.vocals',
    easy_piano: 'native.instrument.easy_piano',
    'piano/vocal/guitar': 'native.instrument.piano_vocal_guitar',
    baritone_guitar: 'native.instrument.baritone_guitar',
    baritone_ukulele: 'native.instrument.baritone_ukulele',
    bass_clarinet: 'native.instrument.bass_clarinet',
    bass_ukulele: 'native.instrument.bass_ukulele',
    bb_instruments: 'native.instrument.bb_instruments',
    bells: 'native.instrument.bells',
    bodhrán: 'native.instrument.bodhran',
    c_instruments: 'native.instrument.c_instruments',
    controller: 'native.instrument.controller',
    double_bass: 'native.instrument.double_bass',
    drums: 'native.instrument.drums',
    dulcimer: 'native.instrument.dulcimer',
    eb_instruments: 'native.instrument.eb_instruments',
    guitarrón: 'native.instrument.guitarron',
    handpan: 'native.instrument.handpan',
    horns: 'native.instrument.horns',
    lap_steel: 'native.instrument.lap_steel',
    loog: 'native.instrument.loog',
    ocarina: 'native.instrument.ocarina',
    pedal_steel_guitar: 'native.instrument.pedal_steel_guitar',
    penny_whistle: 'native.instrument.penny_whistle',
    steelpan: 'native.instrument.steelpan',
    synths: 'native.instrument.synths',
    tin_whistle: 'native.instrument.tin_whistle',
    'turntables_&_mixers': 'native.instrument.turntables_mixers',
    venova: 'native.instrument.venova',
}

const licenses: Record<string, LocaleKey> = {
    publicdomain: 'native.license.publicdomain',
    all_rights_reserved: 'native.license.all_rights_reserved',
    cc_zero: 'native.license.cc_zero',
    cc_by: 'native.license.cc_by',
    cc_by_nd: 'native.license.cc_by_nd',
    cc_by_sa: 'native.license.cc_by_sa',
    cc_by_nc: 'native.license.cc_by_nc',
    cc_by_nc_nd: 'native.license.cc_by_nc_nd',
    cc_by_nc_sa: 'native.license.cc_by_nc_sa',
}

const genres: Record<string, LocaleKey> = {
    classical: 'native.genre.classical',
    pop: 'native.genre.pop',
    rock: 'native.genre.rock',
    folk: 'native.genre.folk',
    jazz: 'native.genre.jazz',
    soundtrack: 'native.genre.soundtrack',
    electronic: 'native.genre.electronic',
    'hip-hop': 'native.genre.hip_hop',
    'hip hop': 'native.genre.hip_hop',
    hiphop: 'native.genre.hip_hop',
    metal: 'native.genre.metal',
    religious: 'native.genre.religious_music',
    'religious music': 'native.genre.religious_music',
    'religious-music': 'native.genre.religious_music',
    world: 'native.genre.world_music',
    'world music': 'native.genre.world_music',
    'world-music': 'native.genre.world_music',
    country: 'native.genre.country',
    reggae: 'native.genre.reggae_and_ska',
    'reggae & ska': 'native.genre.reggae_and_ska',
    'reggae-ska': 'native.genre.reggae_and_ska',
    'r&b': 'native.genre.rnb_funk_and_soul',
    'r&b, funk & soul': 'native.genre.rnb_funk_and_soul',
    'rnb, funk & soul': 'native.genre.rnb_funk_and_soul',
    'rb-funk-soul': 'native.genre.rnb_funk_and_soul',
    experimental: 'native.genre.experimental',
    'new age': 'native.genre.new_age',
    'new-age': 'native.genre.new_age',
    new_age: 'native.genre.new_age',
    blues: 'native.genre.blues',
    comedy: 'native.genre.comedy',
    disco: 'native.genre.disco',
    darkwave: 'native.genre.darkwave',
    songbook: 'native.genre.songbook',
    instructional: 'native.genre.instructional',
    'video game': 'native.genre.video_game',
    ballad: 'native.genre.ballad',
    bluegrass: 'native.genre.bluegrass',
    celtic: 'native.genre.celtic',
    christian: 'native.genre.christian',
    'classic rock': 'native.genre.classic_rock',
    contemporary: 'native.genre.contemporary',
    disney: 'native.genre.disney',
    downtempo: 'native.genre.downtempo',
    educational: 'native.genre.educational',
    flamenco: 'native.genre.flamenco',
    funk: 'native.genre.funk',
    fusion: 'native.genre.fusion',
    'future bass': 'native.genre.future_bass',
    gospel: 'native.genre.gospel',
    'hard rock': 'native.genre.hard_rock',
    'heavy metal': 'native.genre.heavy_metal',
    holiday: 'native.genre.holiday',
    introspective: 'native.genre.introspective',
    kids: 'native.genre.kids',
    latin: 'native.genre.latin',
    lullaby: 'native.genre.lullaby',
    'movie soundtrack': 'native.genre.movie_soundtrack',
    musical: 'native.genre.musical',
    orchestral: 'native.genre.orchestral',
    patriotic: 'native.genre.patriotic',
    'prog rock': 'native.genre.prog_rock',
    'progressive rock': 'native.genre.progressive_rock',
    ragtime: 'native.genre.ragtime',
    rockabilly: 'native.genre.rockabilly',
    ska: 'native.genre.ska',
    soul: 'native.genre.soul',
    swing: 'native.genre.swing',
    'tv soundtrack': 'native.genre.tv_soundtrack',
    traditional: 'native.genre.traditional',
    trap: 'native.genre.trap',
}

const sortings: Record<string, LocaleKey> = {
    'by.date': 'native.sorting.by.date',
    'by.views': 'native.sorting.by.views',
    'by.comments': 'native.sorting.by.comments',
    'by.relevance': 'native.sorting.by.relevance',
    title_asc: 'native.sorting.title_asc',
    title_desc: 'native.sorting.title_desc',
    date_added_asc: 'native.sorting.date_added_asc',
    date_added_desc: 'native.sorting.date_added_desc',
    date_updated_asc: 'native.sorting.date_updated_asc',
    date_updated_desc: 'native.sorting.date_updated_desc',
    date_created_asc: 'native.sorting.date_created_asc',
    date_created_desc: 'native.sorting.date_created_desc',
    views_desc: 'native.sorting.views_desc',
    views_asc: 'native.sorting.views_asc',
    view_count: 'native.sorting_type.view count',
    date_uploaded: 'native.sorting_type.upload date',
}

const filters: Record<string, LocaleKey> = {
    instrument: 'native.filter.instrument',
    level: 'native.filter.level',
    topics: 'native.filter.topics',
    duration: 'native.filter.duration',
    show_all: 'native.filter.show_all',
}

const filterItemNames: Record<string, LocaleKey> = {
    'free to view & play': 'native.filter_type.free to view & play',
    'free to view, play & download': 'native.filter_type.free to view, play & download',
    beginner: 'native.score_details_sheet.complexity.beginner',
    intermediate: 'native.score_details_sheet.complexity.intermediate',
    advanced: 'native.score_details_sheet.complexity.advanced',
    'modify commercially': 'native.filter_item_name.license.modify_commercially',
    'use commercially': 'native.filter_item_name.license.use_commercially',
    share: 'native.filter_item_name.license.share',
    'personal use': 'native.filter_item_name.license.personal_use',
    'all levels': 'native.score_details_sheet.complexity.all_levels',
    'not selected': 'native.filter_item_name.level.not_selected',
    'ear training': 'native.filter_item_name.topic.ear_training',
    'licensing, publishing and copyright':
        'native.filter_item_name.topic.licensing_publishing_and_copyright',
    'music composition': 'native.filter_item_name.topic.music_composition',
    'music production': 'native.filter_item_name.topic.music_production',
    'music software': 'native.filter_item_name.topic.music_software',
    'music theory': 'native.filter_item_name.topic.music_theory',
    'other in music': 'native.filter_item_name.topic.other_in_music',
    'playing skills': 'native.filter_item_name.topic.playing_skills',
    'recording and audio engineering':
        'native.filter_item_name.topic.recording_and_audio_engineering',
    'solo and improvisation': 'native.filter_item_name.topic.solo_and_improvisation',
    songwriting: 'native.filter_item_name.topic.songwriting',
    '0 - 1 hours': 'native.filter_item_name.duration.0_1_hours',
    '1 - 4 hours': 'native.filter_item_name.duration.1_4_hours',
    '4 - 8 hours': 'native.filter_item_name.duration.4_8_hours',
    '8 - 24 hours': 'native.filter_item_name.duration.8_24_hours',
    '24+ hours': 'native.filter_item_name.duration.24_plus_hours',
    'community scores': 'native.filter_item_name.type.community_scores',
    'official scores': 'native.filter_screen.scores_title',
    interactive: 'native.filter_item_name.format.interactive',
    pdf: 'native.filter_item_name.format.pdf',
    'original composition': 'native.filter_item_name.status.original_composition',
}

const ensembles: Record<string, LocaleKey> = {
    solo: 'native.ensemble.solo',
    'mixed ensembles': 'native.ensemble.mixed_ensembles',
    'mixed ensemble': 'native.ensemble.mixed_ensemble',
    'mixed duet': 'native.ensemble.mixed_duet',
    'piano ensembles': 'native.ensemble.piano_ensembles',
    'vocal ensembles': 'native.ensemble.vocal_ensembles',
    choral: 'native.ensemble.choral',
    'piano-voice': 'native.ensemble.piano_voice',
    'woodwind ensembles': 'native.ensemble.woodwind_ensembles',
    'bands / orchestras': 'native.ensemble.bands_orchestras',
    'string ensembles': 'native.ensemble.string_ensembles',
    'mixed quartet': 'native.ensemble.mixed_quartet',
    'mixed trio': 'native.ensemble.mixed_trio',
    'brass ensembles': 'native.ensemble.brass_ensembles',
    'mixed quintet': 'native.ensemble.mixed_quintet',
    'piano duo': 'native.ensemble.piano_duo',
    'piano-voice-guitar': 'native.ensemble.piano_voice_guitar',
    satb: 'native.ensemble.satb',
    'string quartet': 'native.ensemble.string_quartet',
    'brass ensemble': 'native.ensemble.brass_ensemble',
    'woodwind duet': 'native.ensemble.woodwind_duet',
    'symphony orchestra': 'native.ensemble.symphony_orchestra',
    'string duet': 'native.ensemble.string_duet',
    'string ensemble': 'native.ensemble.string_ensemble',
    'concert band': 'native.ensemble.concert_band',
    'woodwind quartet': 'native.ensemble.woodwind_quartet',
    'brass duet': 'native.ensemble.brass_duet',
    'saxophone ensemble': 'native.ensemble.saxophone_ensemble',
    'percussion ensembles': 'native.ensemble.percussion_ensembles',
    'jazz band': 'native.ensemble.jazz_band',
    'chamber orchestra': 'native.ensemble.chamber_orchestra',
    'marching band': 'native.ensemble.marching_band',
    'woodwind ensemble': 'native.ensemble.woodwind_ensemble',
    'piano sextet': 'native.ensemble.piano_sextet',
    'woodwind quintet': 'native.ensemble.woodwind_quintet',
    'woodwind trio': 'native.ensemble.woodwind_trio',
    'brass quartet': 'native.ensemble.brass_quartet',
    'percussion ensemble': 'native.ensemble.percussion_ensemble',
    'a capella': 'native.ensemble.a_capella',
    'brass quintet': 'native.ensemble.brass_quintet',
    'church choir': 'native.ensemble.church_choir',
    'piano trio': 'native.ensemble.piano_trio',
    'string quintet': 'native.ensemble.string_quintet',
    'string trio': 'native.ensemble.string_trio',
    'brass band (british style)': 'native.ensemble.brass_band_british_style',
    'percussion duet': 'native.ensemble.percussion_duet',
    'percussion quartet': 'native.ensemble.percussion_quartet',
    'piano four hand': 'native.ensemble.piano_four_hand',
    'percussion trio': 'native.ensemble.percussion_trio',
    'piano quartet': 'native.ensemble.piano_quartet',
    'drum corps (modern)': 'native.ensemble.drum_corps_modern',
    'men’s choir': 'native.ensemble.mens_choir',
    'brass trio': 'native.ensemble.brass_trio',
    'piano quintet': 'native.ensemble.piano_quintet',
    'pep band': 'native.ensemble.pep_band',
    'percussion quintet': 'native.ensemble.percussion_quintet',
    'women’s choir': 'native.ensemble.womens_choir',
    'brass band (new orleans)': 'native.ensemble.brass_band_new_orleans',
    'indoor percussion ensemble': 'native.ensemble.indoor_percussion_ensemble',
    'string sextet': 'native.ensemble.string_sextet',
    'show choir': 'native.ensemble.show_choir',
    'bagpipe band': 'native.ensemble.bagpipe_band',
    'handbell ensembles': 'native.ensemble.handbell_ensembles',
}

const coursesTitleTranslate: Record<string, LocaleKey> = {
    'continue studying': 'native.courses.title.continue studying',
    "editor's picks": "native.courses.title.editor's picks",
    'top music courses': 'native.courses.title.top music courses',
    'latest music courses': 'native.courses.title.latest music courses',
    'piano courses': 'native.courses.title.piano courses',
    'violin courses': 'native.courses.title.violin courses',
    'music theory courses': 'native.courses.title.music theory courses',
    'wind instruments courses': 'native.courses.title.wind instruments courses',
    'guitar courses': 'native.courses.title.guitar courses',
    'music production courses': 'native.courses.title.music production courses',
    'music software courses': 'native.courses.title.music software courses',
} as const

const songBooksSectionTitle: Record<string, LocaleKey> = {
    'recently viewed': 'native.song_book.section.title.recently_viewed',
    'staff picks': 'native.song_book.section.title.staff_picks',
    'piano favourites': 'native.song_book.section.title.piano_favourites',
    'most popular': 'native.song_book.section.title.most_popular',
    bestsellers: 'native.song_book.section.title.bestsellers',
    'downloadable as a pdf': 'native.song_book.section.title.downloadable_as_pdf',
} as const

// translate() yields '' for an undefined key and echoes a key missing from the catalog,
// so both cases fall back to the caller's name instead of rendering blank or a raw key.
const translateOr = (localeKey: string | undefined, fallbackName: string) => {
    if (!localeKey) return fallbackName
    // @ts-ignore
    const localed = translate(localeKey)
    return localed && localed !== localeKey ? localed : fallbackName
}

export function localizeInstrument(name: string) {
    return translateOr(
        instruments[name.replace(/[. ]/g, '_')],
        name
            .replace(/^((?:[^.]+[.]){2,})([^()]+)$/, '$1($2)')
            .replace(/^[^.]+[.]/, '')
            .replace(/[._]/g, ' ')
            .replace(/(?:^|\b)([a-z])/g, $1 => $1.toUpperCase()),
    )
}

export function localizeLicense(name: string) {
    return translateOr(licenses[name.replace(/\W/g, '_')], name.replace(/\W/g, ' ').toUpperCase())
}

export function localizeInstrumentFilterOption(name: string) {
    const slug = name.trim().toLowerCase().replace(/[. ]/g, '_')
    return translateOr(instruments[slug] ?? `native.instrument.${slug}`, name)
}

export function localizeGenre(key: string, fallbackName: string = key) {
    return translateOr(genres[key.trim().toLowerCase()], fallbackName)
}

export function localizeSorting(name: string, fallbackName: string = name) {
    return translateOr(sortings[name.replace(/\W/g, '_')], fallbackName)
}

export function localizeFilter(name: string) {
    return translateOr(filters[name.replace(/\W/g, '_')], name)
}

export function localizeFilterName(name: string) {
    return translateOr(filterItemNames[name.trim().toLowerCase()], name)
}

export function localizeEnsemble(name: string) {
    return translateOr(ensembles[name.trim().toLowerCase()], name)
}

export function localizeCoursesSectionTitle(name: string) {
    return translateOr(coursesTitleTranslate[name.toLowerCase()], name)
}

export function localizeSongBooksSectionTitle(name: string) {
    return translateOr(songBooksSectionTitle[name.toLowerCase()], name)
}
