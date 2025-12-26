/**
 * Group types and options.
 */

/** Options for creating a Group. */
export interface GroupOptions {
    /** Initial x position (default: 0) */
    x?: number;
    /** Initial y position (default: 0) */
    y?: number;
}

/** Stagger direction options. */
export type StaggerDirection = 'forward' | 'reverse' | 'random' | 'center';

/** Options for staggered animations. */
export interface StaggerOptions {
    /** Delay between each child's animation start (default: 0.1) */
    delay?: number;
    /** Order in which to apply animations */
    direction?: StaggerDirection;
}

/**
 * Build an index array based on stagger direction.
 */
export function buildStaggerIndices(
    length: number,
    direction: StaggerDirection
): number[] {
    const indices: number[] = [];

    switch (direction) {
        case 'reverse':
            for (let i = length - 1; i >= 0; i--) indices.push(i);
            break;
        case 'random':
            for (let i = 0; i < length; i++) indices.push(i);
            // Fisher-Yates shuffle
            for (let i = length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [indices[i], indices[j]] = [indices[j], indices[i]];
            }
            break;
        case 'center': {
            const mid = Math.floor(length / 2);
            // Outward from center
            for (let d = 0; d <= mid; d++) {
                if (mid - d >= 0) indices.push(mid - d);
                if (mid + d < length && d > 0) indices.push(mid + d);
            }
            break;
        }
        default: // 'forward'
            for (let i = 0; i < length; i++) indices.push(i);
    }

    return indices;
}
