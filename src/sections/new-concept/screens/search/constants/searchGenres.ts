import type { SvgAssetType } from '@mu-native/ds'
import { localizeGenre } from '@mu-native/locale'
import type { TApiFilterChip } from '@mu-native/new-concept-shared'
import type { TFilterItem } from '@mu-native/search'

export type TSearchGenre = {
    id: string
    name: string
    /** Formatted facet count; absent when the backend omits it (§2.4) — hide, don't show 0. */
    count?: string
    color: string
    icon?: SvgAssetType
    /** v2 chip replay params for `/score/search` (§5). */
    params?: Record<string, unknown>
}

// Brand promo palette — not yet tokenized. Cycled across the genres in order.
const GENRE_COLORS = ['#49d5ab', '#ab93ff', '#f67bb4', '#d77dff', '#7fa9fe']

// Genre name (normalized) → bundled glyph. Genres without a match render no icon.
const GENRE_ICONS: Record<string, SvgAssetType> = {
    classical: 'ic_genre_classical',
    rock: 'ic_genre_rock',
    soundtrack: 'ic_genre_soundtrack',
    folk: 'ic_genre_folk',
    electronic: 'ic_genre_electronic',
    'hip-hop': 'ic_genre_hiphop',
    'hip hop': 'ic_genre_hiphop',
    hiphop: 'ic_genre_hiphop',
    metal: 'ic_genre_metal',
    pop: 'ic_genre_pop',
    religious: 'ic_genre_religious',
    'religious music': 'ic_genre_religious',
    jazz: 'ic_genre_jazz',
    world: 'ic_genre_world',
    'world music': 'ic_genre_world',
    country: 'ic_genre_country',
    reggae: 'ic_genre_reggae',
    'reggae & ska': 'ic_genre_reggae',
    'r&b': 'ic_genre_rnb',
    'r&b, funk & soul': 'ic_genre_rnb',
    'rnb, funk & soul': 'ic_genre_rnb',
    experimental: 'ic_genre_experimental',
    'new age': 'ic_genre_new_age',
    blues: 'ic_genre_blues',
    comedy: 'ic_genre_comedy',
    disco: 'ic_genre_disco',
    darkwave: 'ic_genre_darkwave',
}

// Genre `name` from the server is the raw stable key — localized
// client-side via `localizeGenre`. Unknown genres fall back to the server name
// in sentence case ("Religious music", "World music") per the design.
const capitalizeFirst = (text: string): string =>
    text ? text.charAt(0).toUpperCase() + text.slice(1) : text

const genreDisplayName = (key: string, name: string): string =>
    localizeGenre(key, capitalizeFirst(name))

const formatCount = (count: number): string => {
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
    if (count >= 1_000) return `${Math.round(count / 1_000)}k`
    return String(count)
}

// Maps a backend genre filter item to the row's view model: real id + count,
// a cycled brand colour, and an icon when one is bundled for that genre.
export const toSearchGenre = (item: TFilterItem, index: number): TSearchGenre => ({
    id: item.id,
    name: genreDisplayName(item.id, item.name),
    count: formatCount(item.count),
    color: GENRE_COLORS[index % GENRE_COLORS.length],
    icon: GENRE_ICONS[item.id.trim().toLowerCase()] ?? GENRE_ICONS[item.name.trim().toLowerCase()],
})

// Maps a v2 genre filter chip (§2.4/§5) to the row's view model, keeping its
// `params` so a tap replays them in `/score/search`. Icon lookup goes by the
// stable `key` (with the raw name as fallback) since `name` is localized.
export const chipToSearchGenre = (chip: TApiFilterChip, index: number): TSearchGenre => ({
    id: chip.key,
    name: genreDisplayName(chip.key, chip.name),
    count: chip.count != null ? formatCount(chip.count) : undefined,
    color: GENRE_COLORS[index % GENRE_COLORS.length],
    icon: GENRE_ICONS[chip.key.trim().toLowerCase()] ?? GENRE_ICONS[chip.name.trim().toLowerCase()],
    params: chip.params,
})
