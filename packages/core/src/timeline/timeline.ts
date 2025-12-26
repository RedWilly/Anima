/**
 * Timeline orchestrator for scheduling and executing animations.
 */

import type { Action } from './action';
import type { Animatable } from '../types';
import { getEasing } from '../easing';
import { clamp } from '../math';
import type {
    TimelineState,
    ScheduleMode,
    ParallelGroup,
    ParallelOptions,
    TimelineOptions,
} from './types';

// Re-export types for external use
export type { TimelineState, ScheduleMode, ParallelGroup, ParallelOptions, TimelineOptions } from './types';

/**
 * Timeline orchestrates the execution of animation actions.
 */
export class Timeline {
    private actions: Action[] = [];
    private entities: Map<string, Animatable> = new Map();
    private currentTime: number = 0;
    private capturedActions: Set<Action> = new Set();
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
     * Register an animatable entity with the timeline.
     */
    registerEntity(entity: Animatable): void {
        this.entities.set(entity.id, entity);
        entity.bindTimeline(this);
    }

    /**
     * Schedule an action for an animatable entity.
     * Behavior depends on current scheduling mode (sequential or parallel).
     */
    scheduleAction(
        actionData: Omit<Action, 'startTime' | 'startValue'>,
        entity: Animatable
    ): void {
        void entity; // satisfies TypeScript void entity;()
        const isParallel = this.scheduleMode === 'parallel';
        const currentGroup = this.parallelGroupStack[this.parallelGroupStack.length - 1];

        let startTime: number;

        if (isParallel && currentGroup) {
            // Parallel mode: base time + stagger offset
            const staggerOffset = currentGroup.actionIndex * currentGroup.stagger;
            startTime = currentGroup.startTime + staggerOffset;
            currentGroup.actionIndex++;
        } else {
            // Sequential mode: use scheduledEndTime
            startTime = this.scheduledEndTime;
        }

        // Don't capture startValue now - it will be captured when the action first runs
        // This ensures chained animations use the correct starting position
        const action: Action = {
            ...actionData,
            startTime,
            startValue: undefined, // Will be captured lazily
        };

        this.actions.push(action);

        if (isParallel && currentGroup) {
            // Track max end time for correct duration calculation with stagger
            const actionEndTime = startTime + action.duration;
            currentGroup.maxEndTime = Math.max(currentGroup.maxEndTime, actionEndTime);
            // Keep maxDuration for backward compatibility
            currentGroup.maxDuration = Math.max(currentGroup.maxDuration, action.duration);
        } else {
            // Sequential: advance timeline by action duration
            this.scheduledEndTime += action.duration;
        }
    }

    /**
     * Enter parallel scheduling mode.
     * All actions scheduled until endParallel() will start at the same time,
     * optionally staggered by a delay between each.
     */
    beginParallel(options?: ParallelOptions): void {
        const stagger = options?.stagger ?? 0;
        if (stagger < 0) {
            throw new Error(
                `Stagger must be non-negative (received: ${stagger}). ` +
                'Use a positive number, e.g., { stagger: 0.1 }.'
            );
        }

        this.contextStack.push('parallel');
        this.parallelGroupStack.push({
            startTime: this.scheduledEndTime,
            maxDuration: 0,
            stagger,
            actionIndex: 0,
            maxEndTime: this.scheduledEndTime,
        });
    }

    /**
     * Exit parallel scheduling mode.
     * Advances the timeline to the latest end time in the parallel group.
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
            // Use maxEndTime which accounts for stagger offsets
            this.scheduledEndTime = group.maxEndTime;
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

            // Capture startValue lazily on first run of this action
            // This ensures chained animations start from the correct position
            if (!this.capturedActions.has(action)) {
                action.startValue = entity.captureState(action.type);
                // Capture morph start points for morphTo actions
                if (action.type === 'morphTo' && 'getMorphPoints' in entity) {
                    const morphable = entity as unknown as {
                        getMorphPoints(): { x: number; y: number }[];
                        getMorphSubPaths?(): { x: number; y: number }[][] | null;
                        getStyle?(): { fill?: string; stroke?: string; strokeWidth?: number };
                    };
                    action.morphStartPoints = morphable.getMorphPoints();
                    // Also capture sub-paths if the entity has them
                    if (morphable.getMorphSubPaths) {
                        const subPaths = morphable.getMorphSubPaths();
                        action.morphStartSubPaths = subPaths ?? undefined;
                    }
                    // Capture start style for style interpolation
                    if (morphable.getStyle) {
                        action.morphStartStyle = morphable.getStyle();
                    }
                }
                this.capturedActions.add(action);
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
    getEntities(): Animatable[] {
        return Array.from(this.entities.values());
    }

    /**
     * Frame duration in seconds.
     */
    get frameDuration(): number {
        return 1 / this.fps;
    }
}
