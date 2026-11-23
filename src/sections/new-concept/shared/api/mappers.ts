/**
 * Raw v2 wire objects → app view models.
 *
 * Scores reuse the existing `MSScore` model (which already parses the byline
 * fields `artist_*` / `song_*` / `is_origin` and `complexity`). Courses and
 * songbooks are already snake_case and pass through; the only new score/course
 * fields (`song_cover`, `completed_lessons_count`) are handled by the models.
 */
import MSScore, { type MSScoreT } from '../../../../App/Model/MSScore'

import type { TRawScoreCard } from './types'

/** Map raw score cards to `MSScoreT`, dropping items that fail source validation. */
export const mapScoreCards = (items: TRawScoreCard[] | undefined): MSScoreT[] => {
    if (!Array.isArray(items)) return []
    return items.filter(item => MSScore.isScoreSourceItemValid(item)).map(item => new MSScore(item))
}

/**
 * Byline (§2.1) — the client owns this logic; the backend never sends a ready
 * `displayed_artist_name`. Show the artist for non-original scores that have one;
 * otherwise fall back to the creator's username; otherwise nothing.
 */
export const resolveScoreByline = (score: MSScoreT): string => {
    if (score.artistName && !score.isOrigin) return score.artistName
    return score.authorName ?? ''
}

/**
 * Complexity label (§2.1) — `0` means "no level" (render nothing); the label
 * itself is mapped client-side, the backend sends no `complexity_label`.
 */
export const COMPLEXITY_LABELS: Record<number, string> = {
    1: 'Beginner',
    2: 'Intermediate',
    3: 'Advanced',
}

export const resolveComplexityLabel = (complexity?: number): string =>
    complexity ? (COMPLEXITY_LABELS[complexity] ?? '') : ''
