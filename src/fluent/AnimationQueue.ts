import type { Mobject } from '../mobjects/Mobject';
import type { Animation } from '../core/animations/Animation';
import type { EasingFunction } from '../core/animations/easing';
import { Sequence } from '../core/animations/composition';
import type { QueuedAnimation, FluentConfig, QueueEntry } from './FluentTypes';
import { DEFAULT_DURATION, isPrebuilt } from './FluentTypes';


/**
 * Manages a queue of animations for fluent chaining.
 * Supports both factory-based animations and pre-built compositions like Parallel.
 */
export class AnimationQueue {
    private readonly target: Mobject;
    private readonly queue: QueueEntry[] = [];

    constructor(target: Mobject) {
        this.target = target;
    }

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

    enqueueAnimation(animation: Animation<Mobject>): void {
        this.queue.push({ animation });
    }

    /** Sets the duration of the last queued animation. */
    setLastDuration(seconds: number): void {
        const last = this.queue[this.queue.length - 1];
        if (last && !isPrebuilt(last)) {
            last.config.durationSeconds = seconds;
        }
    }

    setLastEasing(easing: EasingFunction): void {
        const last = this.queue[this.queue.length - 1];
        if (last && !isPrebuilt(last)) {
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

        for (const entry of this.queue) {
            if (isPrebuilt(entry)) {
                // Pre-built animation (e.g., Parallel)
                animations.push(entry.animation);
            } else {
                // Factory-based animation
                const anim = entry.factory(this.target);
                anim.duration(entry.config.durationSeconds);

                if (entry.config.easing) {
                    anim.ease(entry.config.easing);
                }

                if (entry.config.delaySeconds !== undefined) {
                    anim.delay(entry.config.delaySeconds);
                }

                animations.push(anim);
            }
        }

        this.queue.length = 0;

        if (animations.length === 1 && animations[0]) {
            return animations[0];
        }

        return new Sequence(animations);
    }

    getTotalDuration(): number {
        let total = 0;
        for (const entry of this.queue) {
            if (isPrebuilt(entry)) {
                total += entry.animation.getDuration();
            } else {
                total += entry.config.durationSeconds;
                if (entry.config.delaySeconds) {
                    total += entry.config.delaySeconds;
                }
            }
        }
        return total;
    }
}
