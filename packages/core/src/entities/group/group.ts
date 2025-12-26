/**
 * Group entity - A container for multiple Animatable objects that transform as a unit.
 *
 * Groups can contain any Animatable (shapes, text, or nested groups).
 * When animating a group, all children move/scale/rotate/fade together.
 * Children can still have their own independent animations.
 */

import type { Point, AnimationOptions, ActionInfo, Animatable } from '../../types';
import type { Timeline, ParallelOptions } from '../../timeline/timeline';
import type { Action } from '../../timeline/action';
import { Vector2 } from '../../math';
import type { GroupOptions, StaggerOptions } from './types';
import { buildStaggerIndices } from './types';

let groupIdCounter = 0;

/**
 * Generate a unique group ID.
 */
function generateGroupId(): string {
    return `group_${++groupIdCounter}`;
}

/**
 * A group of Animatable objects that transform as a single unit.
 *
 * @example
 * // Create a "car" from shapes
 * const car = group()
 *   .addChild(rectangle({ width: 100, height: 40 }))   // body
 *   .addChild(circle({ radius: 15 }).moveTo(-30, 20))  // wheel 1
 *   .addChild(circle({ radius: 15 }).moveTo(30, 20));  // wheel 2
 *
 * // Animate entire group
 * scene.add(car);
 * car.moveTo(500, 300, { duration: 2 });
 */
export class Group implements Animatable {
    readonly id: string;

    protected children: Animatable[] = [];
    protected currentPosition: Point;
    protected currentScale: Point;
    protected currentRotation: number;
    protected currentOpacity: number;
    protected timeline: Timeline | null = null;

    constructor(options?: GroupOptions) {
        this.id = generateGroupId();
        this.currentPosition = {
            x: options?.x ?? 0,
            y: options?.y ?? 0,
        };
        this.currentScale = Vector2.one();
        this.currentRotation = 0;
        this.currentOpacity = 1;
    }

    /**
     * Get the number of children.
     */
    get length(): number {
        return this.children.length;
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
     * Add a child to the group.
     * If the group is already bound to a timeline, the child is also registered.
     */
    addChild<T extends Animatable>(child: T): this {
        this.children.push(child);
        if (this.timeline) {
            // Register child with timeline so it can be found when applying actions
            this.timeline.registerEntity(child);
        }
        return this;
    }

    /**
     * Add multiple children to the group.
     */
    addChildren(children: Animatable[]): this {
        for (let i = 0, len = children.length; i < len; i++) {
            this.addChild(children[i]);
        }
        return this;
    }

    /**
     * Remove a child from the group.
     */
    removeChild(child: Animatable): this {
        const index = this.children.indexOf(child);
        if (index !== -1) {
            this.children.splice(index, 1);
        }
        return this;
    }

    /**
     * Get a child by index.
     * Throws if index is out of bounds.
     */
    childAt(index: number): Animatable {
        if (index < 0 || index >= this.children.length) {
            throw new Error(
                `Child index ${index} out of bounds (0-${this.children.length - 1}).`
            );
        }
        return this.children[index];
    }

    /**
     * Get all children as a readonly array.
     */
    getChildren(): readonly Animatable[] {
        return this.children;
    }

    /**
     * Iterate over all children.
     */
    forEach(callback: (child: Animatable, index: number) => void): this {
        for (let i = 0, len = this.children.length; i < len; i++) {
            callback(this.children[i], i);
        }
        return this;
    }

    /**
     * Bind this group and register all children with the timeline.
     * Children are registered so they can have their own independent animations.
     */
    bindTimeline(timeline: Timeline): this {
        this.timeline = timeline;
        for (let i = 0, len = this.children.length; i < len; i++) {
            // Register each child so it appears in the timeline's entity map
            timeline.registerEntity(this.children[i]);
        }
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
     * Execute multiple animations on this group simultaneously.
     */
    parallel(
        animations: Array<(group: this) => void>,
        options?: ParallelOptions
    ): this {
        if (!this.timeline) {
            throw new Error(
                `Group "${this.id}" is not bound to a timeline. ` +
                'Add the group to a scene first.'
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
     * Apply animations to children with staggered timing.
     * 
     * @param animation - Animation function to apply to each child
     * @param options - Stagger configuration
     * 
     * @example
     * // Stagger fade in from first to last
     * group.stagger(c => c.fadeIn({ duration: 0.5 }), { delay: 0.1 })
     * 
     * // Stagger from last to first
     * group.stagger(c => c.fadeIn(), { delay: 0.1, direction: 'reverse' })
     * 
     * // Random order
     * group.stagger(c => c.fadeIn(), { delay: 0.2, direction: 'random' })
     * 
     * // From center outward
     * group.stagger(c => c.scaleTo(1, 1), { delay: 0.1, direction: 'center' })
     */
    stagger(
        animation: (child: Animatable) => void,
        options?: StaggerOptions
    ): this {
        if (!this.timeline) {
            throw new Error(
                `Group "${this.id}" is not bound to a timeline. ` +
                'Add the group to a scene first.'
            );
        }

        const delay = options?.delay ?? 0.1;
        const direction = options?.direction ?? 'forward';
        const len = this.children.length;
        if (len === 0) return this;

        // Build index order based on direction
        const indices = buildStaggerIndices(len, direction);

        // Schedule animations with stagger
        this.timeline.beginParallel({ stagger: delay });
        for (const idx of indices) {
            animation(this.children[idx]);
        }
        this.timeline.endParallel();

        return this;
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
     * Apply an action to update group state.
     */
    applyAction(action: ActionInfo, progress: number): void {
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
     * Render the group and all children.
     * Applies group transform, then renders each child.
     */
    render(ctx: CanvasRenderingContext2D): void {
        ctx.save();

        // Apply group transform
        ctx.translate(this.currentPosition.x, this.currentPosition.y);
        ctx.rotate(this.currentRotation);
        ctx.scale(this.currentScale.x, this.currentScale.y);
        ctx.globalAlpha *= this.currentOpacity;

        // Render all children
        for (let i = 0, len = this.children.length; i < len; i++) {
            this.children[i].render(ctx);
        }

        ctx.restore();
    }

    /**
     * Schedule an action on the timeline.
     */
    protected scheduleAction(action: Omit<Action, 'startTime' | 'startValue'>): void {
        if (!this.timeline) {
            throw new Error(
                `Group "${this.id}" is not bound to a timeline. ` +
                'Add the group to a scene first.'
            );
        }
        this.timeline.scheduleAction(action, this);
    }
}

/**
 * Factory function to create a Group.
 */
export function group(options?: GroupOptions): Group {
    return new Group(options);
}
