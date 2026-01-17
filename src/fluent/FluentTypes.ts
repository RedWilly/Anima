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
 */
export type AnimationFactory = (target: Mobject) => Animation<Mobject>;

/**
 * A queued animation descriptor storing the factory and configuration.
 */
export interface QueuedAnimation {
    factory: AnimationFactory;
    config: FluentConfig;
}

/**
 * A pre-built animation that's already configured (e.g., from parallel()).
 */
export interface QueuedPrebuilt {
    animation: Animation<Mobject>;
}

/** Union type for queue entries */
export type QueueEntry = QueuedAnimation | QueuedPrebuilt;

/** Type guard to check if entry is a pre-built animation */
export function isPrebuilt(entry: QueueEntry): entry is QueuedPrebuilt {
    return 'animation' in entry;
}

/** Default animation duration in seconds. */
export const DEFAULT_DURATION = 1;
