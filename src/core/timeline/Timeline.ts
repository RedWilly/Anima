import type { Animation } from '../animations/Animation';
import type {
    ScheduledAnimation,
    TimelineConfig,
    ResolvedScheduledAnimation,
} from './types';

/**
 * Timeline schedules and controls playback of animations.
 * Animations can be scheduled at specific times and the timeline
 * provides seek/state access for non-linear playback.
 */
export class Timeline {
    private readonly scheduled: ScheduledAnimation[] = [];
    private readonly config: Required<TimelineConfig>;
    private currentTime = 0;

    constructor(config: TimelineConfig = {}) {
        this.config = {
            loop: config.loop ?? false,
        };
    }

    /**
     * Schedule an animation to start at a specific time.
     * @param animation The animation to schedule
     * @param startTime Start time in seconds (default: 0)
     */
    schedule(animation: Animation, startTime = 0): this {
        if (startTime < 0) {
            throw new Error('Start time must be non-negative');
        }
        this.scheduled.push({ animation, startTime });
        return this;
    }

    /**
     * Schedule multiple animations to play in sequence.
     * First animation starts at the given startTime, subsequent
     * animations start after the previous one ends.
     * @param animations Animations to schedule sequentially
     * @param startTime Start time for the first animation (default: 0)
     */
    scheduleSequence(animations: Animation[], startTime = 0): this {
        let currentStart = startTime;
        for (const anim of animations) {
            this.schedule(anim, currentStart);
            currentStart += anim.getDuration() + anim.getDelay();
        }
        return this;
    }

    /**
     * Schedule multiple animations to play in parallel.
     * All animations start at the same time.
     * @param animations Animations to schedule in parallel
     * @param startTime Start time for all animations (default: 0)
     */
    scheduleParallel(animations: Animation[], startTime = 0): this {
        for (const anim of animations) {
            this.schedule(anim, startTime);
        }
        return this;
    }

    /**
     * Get all scheduled animations with resolved timing information.
     */
    private getResolved(): ResolvedScheduledAnimation[] {
        return this.scheduled.map((s) => {
            const delay = s.animation.getDelay();
            const duration = s.animation.getDuration();
            const effectiveStartTime = s.startTime + delay;
            return {
                animation: s.animation,
                effectiveStartTime,
                duration,
                endTime: effectiveStartTime + duration,
            };
        });
    }

    /**
     * Get total duration of the timeline.
     * Returns the end time of the last animation to finish.
     */
    getTotalDuration(): number {
        const resolved = this.getResolved();
        if (resolved.length === 0) return 0;
        return Math.max(...resolved.map((r) => r.endTime));
    }

    /**
     * Seek to a specific time and update all animations.
     * @param time Time in seconds to seek to
     */
    seek(time: number): void {
        const clampedTime = Math.max(0, time);
        this.currentTime = clampedTime;

        const resolved = this.getResolved();

        for (const r of resolved) {
            const { animation, effectiveStartTime, duration, endTime } = r;

            if (clampedTime < effectiveStartTime) {
                // Before animation starts - set to initial state
                animation.update(0);
            } else if (clampedTime >= endTime) {
                // Animation completed - set to final state
                animation.update(1);
            } else {
                // Animation is active - calculate progress
                const elapsed = clampedTime - effectiveStartTime;
                const progress = duration > 0 ? elapsed / duration : 1;
                animation.update(progress);
            }
        }
    }

    /**
     * Get the timeline state at a specific time without modifying the
     * current playhead position.
     * @param time Time in seconds
     */
    getStateAt(time: number): void {
        const savedTime = this.currentTime;
        this.seek(time);
        this.currentTime = savedTime;
    }

    /**
     * Get the current time of the timeline.
     */
    getCurrentTime(): number {
        return this.currentTime;
    }

    /**
     * Get all scheduled animations.
     */
    getScheduled(): readonly ScheduledAnimation[] {
        return this.scheduled;
    }

    /**
     * Check if timeline is configured to loop.
     */
    isLooping(): boolean {
        return this.config.loop;
    }

    /**
     * Clear all scheduled animations.
     */
    clear(): void {
        this.scheduled.length = 0;
        this.currentTime = 0;
    }
}
