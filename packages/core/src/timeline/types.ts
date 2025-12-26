/**
 * Timeline types and interfaces.
 */

/** Playback state of the timeline */
export type TimelineState = 'idle' | 'playing' | 'paused' | 'complete';

/** Scheduling mode for actions */
export type ScheduleMode = 'sequential' | 'parallel';

/** Represents a group of parallel actions */
export interface ParallelGroup {
    /** Time when the parallel group starts */
    startTime: number;
    /** Maximum duration of any action in the group */
    maxDuration: number;
    /** Stagger delay between each animation start */
    stagger: number;
    /** Current action index for stagger calculation */
    actionIndex: number;
    /** Latest end time of any action in the group */
    maxEndTime: number;
}

/** Options for parallel animation groups */
export interface ParallelOptions {
    /** Delay between each animation start in seconds (default: 0) */
    stagger?: number;
}

/** Options for creating a Timeline */
export interface TimelineOptions {
    /** Frames per second for rendering (default: 60) */
    fps?: number;
}
