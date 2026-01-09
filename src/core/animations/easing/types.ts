/**
 * Type signature for an easing function.
 * Maps a progress value t ∈ [0, 1] to an eased value.
 * Must satisfy: f(0) = 0 and f(1) = 1
 */
export type EasingFunction = (t: number) => number;
