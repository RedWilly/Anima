import type { Mobject } from '../mobjects/Mobject';
import type { Animation } from '../core/animations/Animation';
import type { EasingFunction } from '../core/animations/easing';
import { Sequence } from '../core/animations/composition';
import type { QueuedAnimation, FluentConfig } from './types';
import { DEFAULT_DURATION } from './types';

/**
 * Manages a queue of animations for fluent chaining.
 * Uses Mobject as base type to avoid covariance issues with subclasses.
 */
export class AnimationQueue {
    private readonly target: Mobject;
    private readonly queue: QueuedAnimation[] = [];

    constructor(target: Mobject) {
        this.target = target;
    }

    /**
     * Adds an animation factory with default config to the queue.
     */
    enqueue(
        factory: (target: Mobject) => Animation<Mobject>,
        durationOverride?: number
    ): FluentConfig {
        const config: FluentConfig = {
            durationSeconds: durationOverride ?? DEFAULT_DURATION,
        };
        this.queue.push({ factory, config });
        return config;
    }

    /** Sets the duration of the last queued animation. */
    setLastDuration(seconds: number): void {
        const last = this.queue[this.queue.length - 1];
        if (last) {
            last.config.durationSeconds = seconds;
        }
    }

    /** Sets the easing of the last queued animation. */
    setLastEasing(easing: EasingFunction): void {
        const last = this.queue[this.queue.length - 1];
        if (last) {
            last.config.easing = easing;
        }
    }

    get length(): number {
        return this.queue.length;
    }

    isEmpty(): boolean {
        return this.queue.length === 0;
    }

    /**
     * Builds and returns a Sequence of all queued animations.
     * Clears the queue after building.
     */
    toAnimation(): Animation<Mobject> {
        const animations: Array<Animation<Mobject>> = [];

        for (const queued of this.queue) {
            const anim = queued.factory(this.target);
            anim.duration(queued.config.durationSeconds);

            if (queued.config.easing) {
                anim.ease(queued.config.easing);
            }

            if (queued.config.delaySeconds !== undefined) {
                anim.delay(queued.config.delaySeconds);
            }

            animations.push(anim);
        }

        this.queue.length = 0;

        if (animations.length === 1 && animations[0]) {
            return animations[0];
        }

        return new Sequence(animations);
    }

    /** Returns the total duration of all queued animations. */
    getTotalDuration(): number {
        let total = 0;
        for (const queued of this.queue) {
            total += queued.config.durationSeconds;
            if (queued.config.delaySeconds) {
                total += queued.config.delaySeconds;
            }
        }
        return total;
    }
}
