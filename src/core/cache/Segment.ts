import type { Animation } from '../animations/Animation';

/**
 * A Segment represents one independent rendering unit,
 * corresponding to a single play() or wait() call.
 *
 * Its hash is a holistic CRC32 composition of the camera state,
 * all current mobjects, and the animations for this segment.
 */
interface Segment {
    /** Zero-based index in the scene's segment list. */
    readonly index: number;
    /** Start time in seconds. */
    readonly startTime: number;
    /** End time in seconds. */
    readonly endTime: number;
    /** Animations scheduled in this segment (empty for wait segments). */
    readonly animations: readonly Animation[];
    /** CRC32 hash of camera + mobjects + animations at this point. */
    readonly hash: number;
}

export type { Segment };
