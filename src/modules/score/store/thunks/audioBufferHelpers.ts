import { GetStateFun } from '@mu-native/common'
import { getPlaybackPosition, scoreStoreChunk } from '@mu-native/score'
import { xtz } from '@mu-native/xtz'

/**
 * Forces the XTZ audio engine to flush its look-ahead buffer by re-seeking to the
 * current playback position.
 *
 * The engine renders audio ~2 seconds ahead of what is being heard. Audio settings
 * such as the metronome on/off and mute/unmute (playable parts) only affect audio
 * that is rendered *after* the change, so without flushing the buffer the change is
 * applied with a ~2 second delay while the already-buffered audio plays out.
 * Re-seeking to the current second discards that buffer and re-renders it with the
 * new settings, so the change is heard immediately. See MUP-13818.
 *
 * Only the playback position is re-seeked (isRepositionPlayback), not the camera
 * (isRepositionCamera = false) — repositioning the camera makes the score visibly
 * jump while the user is just toggling an audio setting.
 *
 * No-op when playback is stopped — there is no buffer to flush in that case and the
 * setting is applied as soon as playback starts.
 */
export const flushAudioBufferIfPlaying = (getState: GetStateFun) => {
    const state = getState()
    if (!scoreStoreChunk.props.getIsPlaying(state)) return

    const scoreId = scoreStoreChunk.props.getCurrentScore(state)?.id
    const playbackPosition = getPlaybackPosition(scoreId)(state)
    xtz.setCurrentSecond(playbackPosition, false, true)
}
