import type { EasingFunction } from './types';

/**
 * Smooth S-curve using cubic smoothstep.
 * This is the DEFAULT easing for all Manim animations.
 * Formula: 3t² - 2t³
 */
export const smooth: EasingFunction = (t) => {
    const s = t * t * (3 - 2 * t);
    return s;
};

/**
 * Applies smooth twice for extra smoothness.
 * Creates an even more gradual transition at the endpoints.
 */
export const doubleSmooth: EasingFunction = (t) => smooth(smooth(t));

/**
 * Starts fast, decelerates at end (rush into the destination).
 * Uses sqrt for fast start that slows down.
 */
export const rushInto: EasingFunction = (t) => {
    return 1 - Math.pow(1 - t, 2);
};

/**
 * Slow start, accelerates from beginning (rush from the start).
 * Uses quadratic for slow start that speeds up.
 */
export const rushFrom: EasingFunction = (t) => {
    return Math.pow(t, 2);
};

/**
 * Starts normal, slows into the end.
 */
export const slowInto: EasingFunction = (t) => {
    return Math.sqrt(t);
};

/**
 * Goes from 0 to 1 and back to 0.
 * Useful for temporary effects.
 */
export const thereAndBack: EasingFunction = (t) => {
    const mapped = 2 * t;
    if (t < 0.5) {
        return smooth(mapped);
    }
    return smooth(2 - mapped);
};

/** Goes from 0 to 1 and back to 0 with a pause at the peak. */
export function thereAndBackWithPause(pauseRatio = 1 / 3): EasingFunction {
    const a = pauseRatio / 2;
    return (t) => {
        if (t < 0.5 - a) {
            return smooth(t / (0.5 - a));
        } else if (t < 0.5 + a) {
            return 1;
        } else {
            return smooth((1 - t) / (0.5 - a));
        }
    };
}

/** Overshoots slightly then settles (like a running start). */
export function runningStart(pullFactor = 0.2): EasingFunction {
    return (t) => {
        // Cubic bezier from (0,0) to (1,1) with control points for overshoot
        return bezierInterpolate(t, 0, -pullFactor, 1, 1);
    };
}

/**
 * Oscillates back and forth (wiggle/shake effect).
 * Creates a wobbling motion that ends at 1.
 */
export const wiggle: EasingFunction = (t) => {
    const wiggles = 2;
    // Damped sine wave that ends at 1
    return t + (1 - t) * Math.sin(wiggles * 2 * Math.PI * t) * 0.3;
};

/** Approaches but doesn't quite reach 1 (asymptotic approach). */
export function notQuiteThere(proportion = 0.7): EasingFunction {
    return (t) => t === 1 ? 1 : proportion * smooth(t);
}

/** Reaches the destination early and stays there. */
export function lingering(proportion = 0.75): EasingFunction {
    return (t) => {
        if (t >= proportion) {
            return 1;
        }
        return smooth(t / proportion);
    };
}

/** Asymptotically approaches 1 via exponential decay. */
export function exponentialDecay(halfLife = 0.1): EasingFunction {
    return (t) => {
        if (t === 1) return 1;
        return 1 - Math.exp(-t / halfLife);
    };
}

// Helper for cubic bezier interpolation (used by runningStart)
function bezierInterpolate(
    t: number,
    p0: number,
    p1: number,
    p2: number,
    p3: number
): number {
    const u = 1 - t;
    return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
}
