/**
 * Easing functions for smooth animations.
 * 
 * Each function takes a normalized time value (0-1) and returns
 * an eased value (typically 0-1, but may exceed for effects like elastic).
 */

import type { EasingFunction, EasingName } from './types';

/**
 * Linear easing - no acceleration.
 */
export function linear(t: number): number {
    return t;
}

/**
 * Quadratic ease-in - accelerates from zero velocity.
 */
export function easeIn(t: number): number {
    return t * t;
}

/**
 * Quadratic ease-out - decelerates to zero velocity.
 */
export function easeOut(t: number): number {
    return t * (2 - t);
}

/**
 * Quadratic ease-in-out - accelerates then decelerates.
 */
export function easeInOut(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

/**
 * Elastic easing - spring-like overshoot effect.
 */
export function elastic(t: number): number {
    if (t === 0 || t === 1) return t;
    const p = 0.3;
    const s = p / 4;
    return Math.pow(2, -10 * t) * Math.sin(((t - s) * (2 * Math.PI)) / p) + 1;
}

/**
 * Bounce easing - bouncing ball effect.
 */
export function bounce(t: number): number {
    if (t < 1 / 2.75) {
        return 7.5625 * t * t;
    } else if (t < 2 / 2.75) {
        const t2 = t - 1.5 / 2.75;
        return 7.5625 * t2 * t2 + 0.75;
    } else if (t < 2.5 / 2.75) {
        const t2 = t - 2.25 / 2.75;
        return 7.5625 * t2 * t2 + 0.9375;
    } else {
        const t2 = t - 2.625 / 2.75;
        return 7.5625 * t2 * t2 + 0.984375;
    }
}

/**
 * Lookup table for easing functions by name.
 */
const easingFunctions: Record<EasingName, EasingFunction> = {
    linear,
    easeIn,
    easeOut,
    easeInOut,
    elastic,
    bounce,
};

/**
 * Get an easing function by name.
 * Falls back to easeInOut if name is not found.
 */
export function getEasing(name: EasingName): EasingFunction {
    return easingFunctions[name] ?? easeInOut;
}
