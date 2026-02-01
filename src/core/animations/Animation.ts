import { Mobject } from '../../mobjects/Mobject';
import type { EasingFunction } from './easing';
import { defaultEasing } from './easing';
import type { AnimationConfig, AnimationLifecycle } from './types';

/**
 * Abstract base class for all animations.
 * Provides configuration for duration, easing, and delay.
 * Subclasses must specify their lifecycle category.
 */
export abstract class Animation<T extends Mobject = Mobject> {
    protected readonly target: T;
    protected durationSeconds: number;
    protected easingFn: EasingFunction;
    protected delaySeconds: number;

    /**
     * The lifecycle category of this animation.
     * Determines how Scene.play() handles scene registration and validation.
     */
    abstract readonly lifecycle: AnimationLifecycle;

    constructor(target: T) {
        this.target = target;
        this.durationSeconds = 1;
        this.easingFn = defaultEasing;
        this.delaySeconds = 0;
    }

    duration(seconds: number): this {
        if (seconds <= 0) {
            throw new Error('Duration must be positive');
        }
        this.durationSeconds = seconds;
        return this;
    }

    ease(easing: EasingFunction): this {
        this.easingFn = easing;
        return this;
    }

    delay(seconds: number): this {
        if (seconds < 0) {
            throw new Error('Delay must be non-negative');
        }
        this.delaySeconds = seconds;
        return this;
    }

    getDuration(): number {
        return this.durationSeconds;
    }

    getDelay(): number {
        return this.delaySeconds;
    }

    getEasing(): EasingFunction {
        return this.easingFn;
    }

    getTarget(): T {
        return this.target;
    }

    getConfig(): AnimationConfig {
        return {
            durationSeconds: this.durationSeconds,
            easing: this.easingFn,
            delaySeconds: this.delaySeconds,
        };
    }

    abstract interpolate(progress: number): void;

    /**
     * Ensures the animation is initialized before interpolation.
     * Called before first update to capture start state.
     * Default: no-op. Override in subclasses that need lazy initialization.
     */
    ensureInitialized(): void {
        // Default: no-op
    }

    /**
     * Resets the animation to its uninitialized state.
     * Allows animations to be replayed or looped.
     */
    reset(): void {
        // Default: no-op
    }

    update(progress: number): void {
        // this.ensureInitialized();
        const clampedProgress = Math.max(0, Math.min(1, progress));
        const easedProgress = this.easingFn(clampedProgress);
        this.interpolate(easedProgress);
    }
}
