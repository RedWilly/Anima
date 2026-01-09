import type { EasingFunction } from './types';

// --- Bounce helpers ---

/**
 * Bounce ease-out helper calculation.
 */
function bounceOut(t: number): number {
    const n1 = 7.5625;
    const d1 = 2.75;

    if (t < 1 / d1) {
        return n1 * t * t;
    } else if (t < 2 / d1) {
        const adjusted = t - 1.5 / d1;
        return n1 * adjusted * adjusted + 0.75;
    } else if (t < 2.5 / d1) {
        const adjusted = t - 2.25 / d1;
        return n1 * adjusted * adjusted + 0.9375;
    } else {
        const adjusted = t - 2.625 / d1;
        return n1 * adjusted * adjusted + 0.984375;
    }
}

/**
 * Bounce ease-in: bounces before settling.
 */
export const easeInBounce: EasingFunction = (t) => 1 - bounceOut(1 - t);

/**
 * Bounce ease-out: bounces at the end.
 */
export const easeOutBounce: EasingFunction = bounceOut;

/**
 * Bounce ease-in-out: bounces at both ends.
 */
export const easeInOutBounce: EasingFunction = (t) =>
    t < 0.5
        ? (1 - bounceOut(1 - 2 * t)) / 2
        : (1 + bounceOut(2 * t - 1)) / 2;
