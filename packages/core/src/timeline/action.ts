/**
 * Action represents a scheduled animation on the timeline.
 */

import type { EasingName, Point } from '../types';

/**
 * Interface for objects that can be followed (have getPointAt method).
 */
export interface PathFollowable {
    getPointAt(t: number): Point;
    getTangentAt?(t: number): Point;
}

/**
 * Types of actions that can be scheduled.
 */
export type ActionType = 'moveTo' | 'scaleTo' | 'rotateTo' | 'fadeTo' | 'wait' | 'followPath' | 'morphTo';

/**
 * An animation action scheduled on the timeline.
 */
export interface Action {
    /** Type of action */
    type: ActionType;
    /** ID of the target entity */
    targetId: string;
    /** Target value for the property */
    target: Point | number | null;
    /** Duration in seconds */
    duration: number;
    /** Easing function name */
    ease: EasingName;
    /** Start time on the timeline (set when scheduled) */
    startTime?: number;
    /**
     * Starting value (captured lazily when action begins).
     * Undefined allowed due to exactOptionalPropertyTypes tsconfig setting.
     */
    startValue?: Point | number | null | undefined;
    /** Path object for followPath actions */
    pathObject?: PathFollowable;
    /** Whether to orient entity along path direction */
    orientToPath?: boolean;
    /** Target points for morphTo actions */
    morphPoints?: { x: number; y: number }[];
    /** Start points for morphTo actions (captured lazily) */
    morphStartPoints?: { x: number; y: number }[];
    /** Target sub-paths for morphTo actions (text/complex shapes) */
    morphSubPaths?: { x: number; y: number }[][] | undefined;
    /** Start sub-paths for morphTo actions (captured lazily) */
    morphStartSubPaths?: { x: number; y: number }[][] | undefined;
}

/**
 * Create an action with default values.
 */
export function createAction(
    type: ActionType,
    targetId: string,
    target: Point | number | null,
    duration: number,
    ease: EasingName = 'easeInOut'
): Omit<Action, 'startTime' | 'startValue'> {
    return {
        type,
        targetId,
        target,
        duration,
        ease,
    };
}

