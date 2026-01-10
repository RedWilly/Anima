import { Mobject } from '../../mobjects/Mobject';
import type { EasingFunction } from './easing';
import { defaultEasing } from './easing';
import type { AnimationConfig } from './types';

/**
 * Abstract base class for all animations.
 * Provides configuration for duration, easing, and delay.
 * Subclasses implement interpolate() to define the animation behavior.
 */
export abstract class Animation<T extends Mobject = Mobject> {
    protected readonly target: T;
    protected durationSeconds: number;
    protected easingFn: EasingFunction;
    protected delaySeconds: number;

    constructor(target: T) {
        this.target = target;
        this.durationSeconds = 1;
        this.easingFn = defaultEasing;
        this.delaySeconds = 0;
    }

    /**
     * Sets the animation duration in seconds.
     * @param seconds Duration in seconds (must be positive).
     */
    duration(seconds: number): this {
        if (seconds <= 0) {
            throw new Error('Duration must be positive');
        }
        this.durationSeconds = seconds;
        return this;
    }

    /**
     * Sets the easing function for the animation.
     * @param easing The easing function to apply.
     */
    ease(easing: EasingFunction): this {
        this.easingFn = easing;
        return this;
    }

    /**
     * Sets the delay before the animation starts.
     * @param seconds Delay in seconds (must be non-negative).
     */
    delay(seconds: number): this {
        if (seconds < 0) {
            throw new Error('Delay must be non-negative');
        }
        this.delaySeconds = seconds;
        return this;
    }

    /** Returns the animation duration in seconds. */
    getDuration(): number {
        return this.durationSeconds;
    }

    /** Returns the delay in seconds. */
    getDelay(): number {
        return this.delaySeconds;
    }

    /** Returns the easing function. */
    getEasing(): EasingFunction {
        return this.easingFn;
    }

    /** Returns the target Mobject. */
    getTarget(): T {
        return this.target;
    }

    /** Returns the full animation configuration. */
    getConfig(): AnimationConfig {
        return {
            durationSeconds: this.durationSeconds,
            easing: this.easingFn,
            delaySeconds: this.delaySeconds,
        };
    }

    /**
     * Interpolates the animation at the given progress.
     * Progress is a value in [0, 1] where 0 is start and 1 is end.
     * The easing function is applied before calling this method.
     * @param progress Eased progress value in [0, 1].
     */
    abstract interpolate(progress: number): void;

    /**
     * Updates the animation at the given raw progress value.
     * Applies the easing function and calls interpolate().
     * @param progress Raw progress value in [0, 1].
     */
    update(progress: number): void {
        const clampedProgress = Math.max(0, Math.min(1, progress));
        const easedProgress = this.easingFn(clampedProgress);
        this.interpolate(easedProgress);
    }
}
