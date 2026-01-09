import type { EasingFunction } from './types';

/**
 * Linear easing (no easing, constant speed).
 */
export const linear: EasingFunction = (t) => t;

// --- Quadratic ---

/**
 * Quadratic ease-in: slow start, accelerating.
 */
export const easeInQuad: EasingFunction = (t) => t * t;

/**
 * Quadratic ease-out: fast start, decelerating.
 */
export const easeOutQuad: EasingFunction = (t) => 1 - (1 - t) * (1 - t);

/**
 * Quadratic ease-in-out: slow start and end.
 */
export const easeInOutQuad: EasingFunction = (t) =>
    t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

// --- Cubic ---

/**
 * Cubic ease-in: slow start, accelerating.
 */
export const easeInCubic: EasingFunction = (t) => t * t * t;

/**
 * Cubic ease-out: fast start, decelerating.
 */
export const easeOutCubic: EasingFunction = (t) => 1 - Math.pow(1 - t, 3);

/**
 * Cubic ease-in-out: slow start and end.
 */
export const easeInOutCubic: EasingFunction = (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// --- Quartic ---

/**
 * Quartic ease-in: slow start, accelerating.
 */
export const easeInQuart: EasingFunction = (t) => t * t * t * t;

/**
 * Quartic ease-out: fast start, decelerating.
 */
export const easeOutQuart: EasingFunction = (t) => 1 - Math.pow(1 - t, 4);

/**
 * Quartic ease-in-out: slow start and end.
 */
export const easeInOutQuart: EasingFunction = (t) =>
    t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;

// --- Quintic ---

/**
 * Quintic ease-in: slow start, accelerating.
 */
export const easeInQuint: EasingFunction = (t) => t * t * t * t * t;

/**
 * Quintic ease-out: fast start, decelerating.
 */
export const easeOutQuint: EasingFunction = (t) => 1 - Math.pow(1 - t, 5);

/**
 * Quintic ease-in-out: slow start and end.
 */
export const easeInOutQuint: EasingFunction = (t) =>
    t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;

// --- Sinusoidal ---

/**
 * Sinusoidal ease-in: uses sine curve for smooth acceleration.
 */
export const easeInSine: EasingFunction = (t) =>
    1 - Math.cos((t * Math.PI) / 2);

/**
 * Sinusoidal ease-out: uses sine curve for smooth deceleration.
 */
export const easeOutSine: EasingFunction = (t) => Math.sin((t * Math.PI) / 2);

/**
 * Sinusoidal ease-in-out: smooth S-curve using sine.
 */
export const easeInOutSine: EasingFunction = (t) =>
    -(Math.cos(Math.PI * t) - 1) / 2;

// --- Exponential ---

/**
 * Exponential ease-in: dramatic acceleration.
 */
export const easeInExpo: EasingFunction = (t) =>
    t === 0 ? 0 : Math.pow(2, 10 * t - 10);

/**
 * Exponential ease-out: dramatic deceleration.
 */
export const easeOutExpo: EasingFunction = (t) =>
    t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

/**
 * Exponential ease-in-out: dramatic S-curve.
 */
export const easeInOutExpo: EasingFunction = (t) =>
    t === 0
        ? 0
        : t === 1
            ? 1
            : t < 0.5
                ? Math.pow(2, 20 * t - 10) / 2
                : (2 - Math.pow(2, -20 * t + 10)) / 2;

// --- Circular ---

/**
 * Circular ease-in: quarter circle acceleration.
 */
export const easeInCirc: EasingFunction = (t) => 1 - Math.sqrt(1 - t * t);

/**
 * Circular ease-out: quarter circle deceleration.
 */
export const easeOutCirc: EasingFunction = (t) =>
    Math.sqrt(1 - Math.pow(t - 1, 2));

/**
 * Circular ease-in-out: half circle S-curve.
 */
export const easeInOutCirc: EasingFunction = (t) =>
    t < 0.5
        ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2
        : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2;

// --- Back (overshoots) ---

const BACK_C1 = 1.70158;
const BACK_C2 = BACK_C1 * 1.525;
const BACK_C3 = BACK_C1 + 1;

/**
 * Back ease-in: pulls back before accelerating forward.
 */
export const easeInBack: EasingFunction = (t) =>
    BACK_C3 * t * t * t - BACK_C1 * t * t;

/**
 * Back ease-out: overshoots then settles.
 */
export const easeOutBack: EasingFunction = (t) =>
    1 + BACK_C3 * Math.pow(t - 1, 3) + BACK_C1 * Math.pow(t - 1, 2);

/**
 * Back ease-in-out: pulls back, overshoots, then settles.
 */
export const easeInOutBack: EasingFunction = (t) =>
    t < 0.5
        ? (Math.pow(2 * t, 2) * ((BACK_C2 + 1) * 2 * t - BACK_C2)) / 2
        : (Math.pow(2 * t - 2, 2) * ((BACK_C2 + 1) * (t * 2 - 2) + BACK_C2) + 2) /
        2;

// --- Elastic ---

const ELASTIC_C4 = (2 * Math.PI) / 3;
const ELASTIC_C5 = (2 * Math.PI) / 4.5;

/**
 * Elastic ease-in: builds up elastic energy.
 */
export const easeInElastic: EasingFunction = (t) =>
    t === 0
        ? 0
        : t === 1
            ? 1
            : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * ELASTIC_C4);

/**
 * Elastic ease-out: releases elastic energy with overshoot oscillation.
 */
export const easeOutElastic: EasingFunction = (t) =>
    t === 0
        ? 0
        : t === 1
            ? 1
            : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ELASTIC_C4) + 1;

/**
 * Elastic ease-in-out: elastic effect on both ends.
 */
export const easeInOutElastic: EasingFunction = (t) =>
    t === 0
        ? 0
        : t === 1
            ? 1
            : t < 0.5
                ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * ELASTIC_C5)) / 2
                : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * ELASTIC_C5)) / 2 + 1;
