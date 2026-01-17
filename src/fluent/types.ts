import type { EasingFunction } from '../core/animations/easing';
import type { Animation } from '../core/animations/Animation';
import type { Mobject } from '../mobjects/Mobject';

/**
 * Configuration for a queued animation.
 */
export interface FluentConfig {
    durationSeconds: number;
    easing?: EasingFunction;
    delaySeconds?: number;
}

/**
 * Factory function that creates an Animation for a given target.
 * Uses Mobject as base type to avoid covariance issues.
 */
export type AnimationFactory = (target: Mobject) => Animation<Mobject>;

/**
 * A queued animation descriptor storing the factory and configuration.
 */
export interface QueuedAnimation {
    factory: AnimationFactory;
    config: FluentConfig;
}

/** Default animation duration in seconds. */
export const DEFAULT_DURATION = 1;
