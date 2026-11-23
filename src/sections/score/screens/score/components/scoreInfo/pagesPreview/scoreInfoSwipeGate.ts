/**
 * Pure gesture arithmetic for the Score Info preview swipe, kept apart from the
 * hook so it can be unit-tested without the react-native runtime.
 */

export type SwipeAxis = 'idle' | 'x' | 'y'

/**
 * Distance before the drag is assigned an axis. Above both platform touch slops
 * (iOS ~10pt, Android ~8dp) so touch-down jitter never gets to decide.
 */
const DRAG_SLOP = 12
/**
 * How far one axis must beat the other to claim the drag: outside ~40deg / ~50deg
 * the answer is clear, between them the drag is still diagonal.
 */
const AXIS_BIAS = 1.2
/** Travel at which an ambiguous drag stops waiting and takes its larger axis. */
const DECIDE_BY = 24
const SWIPE_THRESHOLD = 40
const FLING_VELOCITY = 0.3

/**
 * Assigns the drag to an axis once it clears the slop, then keeps it there for
 * the rest of the touch — re-deciding mid-drag makes the ScrollView and the
 * capture handler fight over the same finger.
 *
 * `dx` / `dy` are cumulative from touch-down, so the axis is judged on the
 * drag's overall direction rather than on one noisy sample.
 *
 * A drag that is still diagonal at the slop stays undecided: measured page
 * swipes leave the slop anywhere up to ~46deg but straighten to under 15deg by
 * the time the finger lifts, so a few more points of travel answer the question
 * that guessing at 12pt gets wrong.
 */
export const resolveSwipeAxis = (axis: SwipeAxis, dx: number, dy: number): SwipeAxis => {
    if (axis !== 'idle') return axis
    const x = Math.abs(dx)
    const y = Math.abs(dy)
    const travel = Math.max(x, y)
    if (travel < DRAG_SLOP) return 'idle'
    if (x >= y * AXIS_BIAS) return 'x'
    if (y >= x * AXIS_BIAS) return 'y'
    if (travel < DECIDE_BY) return 'idle'
    return x > y ? 'x' : 'y'
}

/** A page turns on either a long enough drag or a short flick. */
export const isPageTurn = (dx: number, vx: number) =>
    Math.abs(dx) >= SWIPE_THRESHOLD || Math.abs(vx) >= FLING_VELOCITY
