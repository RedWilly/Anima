/**
 * Action represents a scheduled animation on the timeline.
 */

import type { EasingName, Point } from '../types';

/**
 * Types of actions that can be scheduled.
 */
export type ActionType = 'moveTo' | 'scaleTo' | 'rotateTo' | 'fadeTo' | 'wait';

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
    /** Starting value (captured when action begins) */
    startValue?: Point | number | null;
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
