/**
 * Base Entity class for all visual objects in the scene.
 */

import type { Point, AnimationOptions } from '../types';
import type { Timeline, ParallelOptions } from '../timeline/timeline';
import type { Action } from '../timeline/action';
import { Vector2 } from '../math';

let entityIdCounter = 0;

/**
 * Generate a unique entity ID.
 */
function generateId(): string {
    return `entity_${++entityIdCounter}`;
}

/**
 * Base class for all visual entities in the animation.
 * Provides common properties and fluent animation methods.
 */
export abstract class Entity {
    readonly id: string;

    protected currentPosition: Point;
    protected currentScale: Point;
    protected currentRotation: number;
    protected currentOpacity: number;
    protected timeline: Timeline | null = null;

    constructor() {
        this.id = generateId();
        this.currentPosition = Vector2.zero();
        this.currentScale = Vector2.one();
        this.currentRotation = 0;
        this.currentOpacity = 1;
    }

    /**
     * Get the current position.
     */
    get position(): Point {
        return { ...this.currentPosition };
    }

    /**
     * Get the current scale.
     */
    get scale(): Point {
        return { ...this.currentScale };
    }

    /**
     * Get the current rotation in radians.
     */
    get rotation(): number {
        return this.currentRotation;
    }

    /**
     * Get the current opacity (0-1).
     */
    get opacity(): number {
        return this.currentOpacity;
    }

    /**
     * Bind this entity to a timeline for scheduling animations.
     */
    bindTimeline(timeline: Timeline): this {
        this.timeline = timeline;
        return this;
    }

    /**
     * Move to an absolute position.
     */
    moveTo(x: number, y: number, options?: AnimationOptions): this {
        this.scheduleAction({
            type: 'moveTo',
            targetId: this.id,
            target: { x, y },
            duration: options?.duration ?? 0.5,
            ease: options?.ease ?? 'easeInOut',
        });
        return this;
    }

    /**
     * Scale to an absolute scale factor.
     */
    scaleTo(sx: number, sy: number, options?: AnimationOptions): this {
        this.scheduleAction({
            type: 'scaleTo',
            targetId: this.id,
            target: { x: sx, y: sy },
            duration: options?.duration ?? 0.5,
            ease: options?.ease ?? 'easeInOut',
        });
        return this;
    }

    /**
     * Rotate to an absolute angle (in radians).
     */
    rotateTo(angle: number, options?: AnimationOptions): this {
        this.scheduleAction({
            type: 'rotateTo',
            targetId: this.id,
            target: angle,
            duration: options?.duration ?? 0.5,
            ease: options?.ease ?? 'easeInOut',
        });
        return this;
    }

    /**
     * Fade in to full opacity.
     */
    fadeIn(options?: AnimationOptions): this {
        this.scheduleAction({
            type: 'fadeTo',
            targetId: this.id,
            target: 1,
            duration: options?.duration ?? 0.5,
            ease: options?.ease ?? 'easeInOut',
        });
        return this;
    }

    /**
     * Fade out to zero opacity.
     */
    fadeOut(options?: AnimationOptions): this {
        this.scheduleAction({
            type: 'fadeTo',
            targetId: this.id,
            target: 0,
            duration: options?.duration ?? 0.5,
            ease: options?.ease ?? 'easeInOut',
        });
        return this;
    }

    /**
     * Wait for a specified duration before the next action.
     */
    wait(seconds: number): this {
        this.scheduleAction({
            type: 'wait',
            targetId: this.id,
            target: null,
            duration: seconds,
            ease: 'linear',
        });
        return this;
    }

    /**
     * Execute multiple animations on this entity simultaneously.
     * All animations within the parallel block start at the same time,
     * optionally staggered by a delay between each.
     *
     * @param animations - Animation functions to execute in parallel
     * @param options - Optional configuration including stagger delay
     *
     * @example
     * // All animations start together
     * circle.parallel(
     *   c => c.moveTo(100, 200, { duration: 1 }),
     *   c => c.scaleTo(2, 2, { duration: 0.5 })
     * );
     *
     * @example
     * // Staggered start (each 0.2s after previous)
     * circle.parallel(
     *   c => c.moveTo(100, 0),
     *   c => c.scaleTo(2, 2),
     *   c => c.fadeOut(),
     *   { stagger: 0.2 }
     * );
     */
    parallel(
        animations: Array<(entity: this) => void>,
        options?: ParallelOptions
    ): this {
        if (!this.timeline) {
            throw new Error(
                `Entity "${this.id}" is not bound to a timeline. ` +
                'Add the entity to a scene first.'
            );
        }

        this.timeline.beginParallel(options);
        for (let i = 0, len = animations.length; i < len; i++) {
            animations[i](this);
        }
        this.timeline.endParallel();

        return this;
    }

    /**
     * Apply an action to update entity state.
     * Called by the timeline during playback.
     */
    applyAction(action: Action, progress: number): void {
        switch (action.type) {
            case 'moveTo':
                if (action.startValue && typeof action.target === 'object' && action.target !== null) {
                    const start = action.startValue as Point;
                    const end = action.target as Point;
                    this.currentPosition = Vector2.lerp(start, end, progress);
                }
                break;
            case 'scaleTo':
                if (action.startValue && typeof action.target === 'object' && action.target !== null) {
                    const start = action.startValue as Point;
                    const end = action.target as Point;
                    this.currentScale = Vector2.lerp(start, end, progress);
                }
                break;
            case 'rotateTo':
                if (typeof action.startValue === 'number' && typeof action.target === 'number') {
                    const start = action.startValue;
                    const end = action.target;
                    this.currentRotation = start + (end - start) * progress;
                }
                break;
            case 'fadeTo':
                if (typeof action.startValue === 'number' && typeof action.target === 'number') {
                    const start = action.startValue;
                    const end = action.target;
                    this.currentOpacity = start + (end - start) * progress;
                }
                break;
        }
    }

    /**
     * Capture current state for action start values.
     */
    captureState(actionType: string): Point | number | null {
        switch (actionType) {
            case 'moveTo':
                return { ...this.currentPosition };
            case 'scaleTo':
                return { ...this.currentScale };
            case 'rotateTo':
                return this.currentRotation;
            case 'fadeTo':
                return this.currentOpacity;
            default:
                return null;
        }
    }

    /**
     * Schedule an action on the timeline.
     */
    protected scheduleAction(action: Omit<Action, 'startTime' | 'startValue'>): void {
        if (!this.timeline) {
            throw new Error(
                `Entity "${this.id}" is not bound to a timeline. ` +
                'Add the entity to a scene first.'
            );
        }
        this.timeline.scheduleAction(action, this);
    }

    /**
     * Abstract method to render the entity.
     * Implemented by subclasses (Circle, Rectangle, etc.)
     */
    abstract render(ctx: CanvasRenderingContext2D): void;
}
