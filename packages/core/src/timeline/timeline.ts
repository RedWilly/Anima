/**
 * Timeline orchestrator for scheduling and executing animations.
 */

import type { Action } from './action';
import type { Entity } from '../entities/entity';
import { getEasing } from '../easing';
import { clamp } from '../math';

export type TimelineState = 'idle' | 'playing' | 'paused' | 'complete';

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

    constructor(options?: TimelineOptions) {
        this.fps = options?.fps ?? 60;
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
     */
    scheduleAction(
        actionData: Omit<Action, 'startTime' | 'startValue'>,
        entity: Entity
    ): void {
        const action: Action = {
            ...actionData,
            startTime: this.scheduledEndTime,
            startValue: entity.captureState(actionData.type),
        };

        this.actions.push(action);
        this.scheduledEndTime += action.duration;
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
