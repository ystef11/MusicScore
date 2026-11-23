/**
 * Map a v2 Home `playlists` block tile to the app's `TPlaylist` (§3).
 *
 * The block sends the full playlist model (`color`, `palette_color_type`,
 * `image_type`, `text_color_type`, `subtitle`, …) — the same wire shape as the
 * standalone playlist API and the web app's `playlists_selected`. So we reuse
 * the shared `playlistDataConverter` rather than re-deriving the tile color;
 * `PlaylistCard` then resolves the background via `color || getColor(palette)`.
 */
export { playlistDataConverter as mapV2Playlist } from '@mu-native/playlist-scores'
