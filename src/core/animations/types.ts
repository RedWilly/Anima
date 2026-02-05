import type { EasingFunction } from './easing';
import type { Animation } from './Animation';
import type { Mobject } from '../../mobjects/Mobject';

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


/**
 * Animation lifecycle category determines how Scene.play() handles the target.
 * - 'introductory': Auto-registers target with scene (FadeIn, Create, Draw, Write)
 * - 'transformative': Requires target to already be in scene (MoveTo, Rotate, Scale)
 * - 'exit': Requires target in scene, may auto-remove after (FadeOut)
 */
export type AnimationLifecycle = 'introductory' | 'transformative' | 'exit';

// ========== Fluent API Types ==========
// These types support the chainable animation API built into Mobject

/**
 * Configuration for a queued animation in the fluent API.
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