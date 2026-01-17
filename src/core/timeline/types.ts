import type { Animation } from '../animations/Animation';
import type { EasingFunction } from '../animations/easing';

/**
 * Represents an animation scheduled at a specific time on the Timeline.
 */
export interface ScheduledAnimation {
    /** The animation to play */
    readonly animation: Animation;
    /** Start time in seconds from timeline beginning */
    readonly startTime: number;
}

/**
 * Configuration options for Timeline.
 */
export interface TimelineConfig {
    /** Whether the timeline loops. Default: false */
    readonly loop?: boolean;
}

/**
 * Internal representation of a scheduled animation with computed timing.
 */
export interface ResolvedScheduledAnimation {
    readonly animation: Animation;
    /** Effective start time including animation delay */
    readonly effectiveStartTime: number;
    /** Duration of the animation */
    readonly duration: number;
    /** End time = effectiveStartTime + duration */
    readonly endTime: number;
}
