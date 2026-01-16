import type { EasingFunction } from '../easing';

/**
 * Supported value types for keyframe interpolation.
 */
export type KeyframeValue = number;

/**
 * A single keyframe with a normalized time position [0,1] and value.
 */
export interface Keyframe<T extends KeyframeValue = KeyframeValue> {
    /** Normalized time position in [0, 1]. */
    readonly time: number;
    /** The value at this keyframe. */
    readonly value: T;
    /** Optional easing function for interpolation TO this keyframe. */
    readonly easing?: EasingFunction;
}

/**
 * Interpolation function for a specific value type.
 * Takes start value, end value, and progress [0,1], returns interpolated value.
 */
export type InterpolatorFn<T> = (start: T, end: T, progress: number) => T;

/**
 * Default numeric interpolation (linear).
 */
export function lerpNumber(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}
