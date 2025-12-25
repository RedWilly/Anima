/**
 * Timeline orchestrator for scheduling and executing animations.
 */

import type { Action } from './action';
import type { Entity } from '../entities/entity';
import { getEasing } from '../easing';
import { clamp } from '../math';

export type TimelineState = 'idle' | 'playing' | 'paused' | 'complete';

/** Scheduling mode for actions */
export type ScheduleMode = 'sequential' | 'parallel';

/** Represents a group of parallel actions */
export interface ParallelGroup {
    /** Time when the parallel group starts */
    startTime: number;
    /** Maximum duration of any action in the group */
    maxDuration: number;
}

export interface TimelineOptions {
    /** Frames per second for rendering (default: 60) */
    fps?: number;
}

/**
 * Timeline orchestrates the execution of animation actions.
 */
export class Timeline {
    private actions: Action[] = [];
    private entities: Map<string, Entity> = new Map();
    private currentTime = 0;
    private scheduledEndTime = 0;
    private state: TimelineState = 'idle';
    private fps: number;
    private onFrameCallback?: (time: number) => void;
    private onCompleteCallback?: () => void;

    /** Stack to track scheduling context (sequential or parallel) */
    private contextStack: ScheduleMode[] = ['sequential'];
    /** Stack of active parallel groups being built */
    private parallelGroupStack: ParallelGroup[] = [];

    constructor(options?: TimelineOptions) {
        this.fps = options?.fps ?? 60;
    }

    /**
     * Get the current scheduling mode.
     */
    get scheduleMode(): ScheduleMode {
        return this.contextStack[this.contextStack.length - 1];
    }

    /**
     * Get the current playback time in seconds.
     */
    get time(): number {
        return this.currentTime;
    }

    /**
     * Get the total duration of the timeline.
     */
    get duration(): number {
        return this.scheduledEndTime;
    }

    /**
     * Get the current playback state.
     */
    get playbackState(): TimelineState {
        return this.state;
    }

    /**
     * Register an entity with the timeline.
     */
    registerEntity(entity: Entity): void {
        this.entities.set(entity.id, entity);
        entity.bindTimeline(this);
    }

    /**
     * Schedule an action for an entity.
     * Behavior depends on current scheduling mode (sequential or parallel).
     */
    scheduleAction(
        actionData: Omit<Action, 'startTime' | 'startValue'>,
        entity: Entity
    ): void {
        const isParallel = this.scheduleMode === 'parallel';
        const currentGroup = this.parallelGroupStack[this.parallelGroupStack.length - 1];

        // In parallel mode, use the group's start time
        // In sequential mode, use scheduledEndTime as before
        const startTime = isParallel && currentGroup
            ? currentGroup.startTime
            : this.scheduledEndTime;

        const action: Action = {
            ...actionData,
            startTime,
            startValue: entity.captureState(actionData.type),
        };

        this.actions.push(action);

        if (isParallel && currentGroup) {
            // Track max duration for the parallel group
            currentGroup.maxDuration = Math.max(currentGroup.maxDuration, action.duration);
        } else {
            // Sequential: advance timeline by action duration
            this.scheduledEndTime += action.duration;
        }
    }

    /**
     * Enter parallel scheduling mode.
     * All actions scheduled until endParallel() will start at the same time.
     */
    beginParallel(): void {
        this.contextStack.push('parallel');
        this.parallelGroupStack.push({
            startTime: this.scheduledEndTime,
            maxDuration: 0,
        });
    }

    /**
     * Exit parallel scheduling mode.
     * Advances the timeline by the longest action in the parallel group.
     */
    endParallel(): void {
        if (this.contextStack.length <= 1) {
            throw new Error('Cannot call endParallel() without matching beginParallel()');
        }

        const mode = this.contextStack.pop();
        if (mode !== 'parallel') {
            throw new Error('Context mismatch: expected parallel mode');
        }

        const group = this.parallelGroupStack.pop();
        if (group) {
            // Advance timeline by the longest action in the group
            this.scheduledEndTime = group.startTime + group.maxDuration;
        }
    }

    /**
     * Check if currently in parallel scheduling mode.
     */
    get isParallelMode(): boolean {
        return this.scheduleMode === 'parallel';
    }

    /**
     * Set callback for each frame.
     */
    onFrame(callback: (time: number) => void): this {
        this.onFrameCallback = callback;
        return this;
    }

    /**
     * Set callback for when timeline completes.
     */
    onComplete(callback: () => void): this {
        this.onCompleteCallback = callback;
        return this;
    }

    /**
     * Advance the timeline by delta time.
     */
    tick(deltaTime: number): void {
        if (this.state !== 'playing') return;

        this.currentTime += deltaTime;
        this.applyActionsAtTime(this.currentTime);

        if (this.onFrameCallback) {
            this.onFrameCallback(this.currentTime);
        }

        if (this.currentTime >= this.scheduledEndTime) {
            this.state = 'complete';
            if (this.onCompleteCallback) {
                this.onCompleteCallback();
            }
        }
    }

    /**
     * Seek to a specific time.
     */
    seek(time: number): void {
        this.currentTime = clamp(time, 0, this.scheduledEndTime);
        this.applyActionsAtTime(this.currentTime);
    }

    /**
     * Start or resume playback.
     */
    play(): void {
        if (this.state === 'complete') {
            this.currentTime = 0;
        }
        this.state = 'playing';
    }

    /**
     * Pause playback.
     */
    pause(): void {
        if (this.state === 'playing') {
            this.state = 'paused';
        }
    }

    /**
     * Reset the timeline to the beginning.
     */
    reset(): void {
        this.currentTime = 0;
        this.state = 'idle';
        this.applyActionsAtTime(0);
    }

    /**
     * Apply all actions at a given time.
     */
    private applyActionsAtTime(time: number): void {
        for (const action of this.actions) {
            const entity = this.entities.get(action.targetId);
            if (!entity || action.startTime === undefined) continue;

            const actionEndTime = action.startTime + action.duration;

            if (time < action.startTime) {
                // Action hasn't started yet - stay at start value
                continue;
            }

            if (time >= actionEndTime) {
                // Action is complete - apply final value
                entity.applyAction(action, 1);
            } else {
                // Action is in progress - interpolate
                const localTime = time - action.startTime;
                const normalizedTime = localTime / action.duration;
                const easingFn = getEasing(action.ease);
                const easedProgress = easingFn(normalizedTime);
                entity.applyAction(action, easedProgress);
            }
        }
    }

    /**
     * Get all entities registered with this timeline.
     */
    getEntities(): Entity[] {
        return Array.from(this.entities.values());
    }

    /**
     * Frame duration in seconds.
     */
    get frameDuration(): number {
        return 1 / this.fps;
    }
}
