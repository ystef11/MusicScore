/**
 * BPM counter helpers mirroring the web player (frontend-musescore
 * PlayerControlTempoNew): step 5, clamp 5..300. The score's base tempo comes
 * from the API `bpm` field; the xtz engine only accepts a speed ratio, so
 * the displayed BPM is derived from the current tempo multiplier and, on change,
 * converted back to a ratio via {@link bpmToTempo}.
 */
export const BPM_STEP = 5
export const BPM_MIN = 5
export const BPM_MAX = 300

/** Displayed BPM = base tempo × current playback-speed multiplier. */
export const getCurrentBpm = (baseBpm: number, tempo: number) => Math.round(baseBpm * tempo)

/** Playback-speed multiplier (ratio) that yields the given BPM for a score. */
export const bpmToTempo = (bpm: number, baseBpm: number) => bpm / baseBpm

export const clampBpm = (bpm: number) => Math.min(BPM_MAX, Math.max(BPM_MIN, bpm))
