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


/**
 * Animation lifecycle category determines how Scene.play() handles the target.
 * - 'introductory': Auto-registers target with scene (FadeIn, Create, Draw, Write)
 * - 'transformative': Requires target to already be in scene (MoveTo, Rotate, Scale)
 * - 'exit': Requires target in scene, may auto-remove after (FadeOut)
 */
export type AnimationLifecycle = 'introductory' | 'transformative' | 'exit';