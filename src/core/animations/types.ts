import type { EasingFunction } from './easing';

/**
 * Configuration options for animations.
 */
export interface AnimationConfig {
    /** Duration of the animation in seconds. Default: 1 */
    readonly durationSeconds: number;
    /** Easing function to apply. Default: smooth */
    readonly easing: EasingFunction;
    /** Delay before animation starts in seconds. Default: 0 */
    readonly delaySeconds: number;
}