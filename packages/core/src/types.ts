/**
 * Core type definitions for the animation engine.
 */

/**
 * A 2D point with x and y coordinates.
 */
export interface Point {
    x: number;
    y: number;
}

/**
 * Visual style properties for shapes.
 */
export interface Style {
    /** Fill color (CSS color string) */
    fill?: string;
    /** Stroke color (CSS color string) */
    stroke?: string;
    /** Stroke width in pixels */
    strokeWidth?: number;
}

/**
 * Options for animation methods.
 */
export interface AnimationOptions {
    /** Duration in seconds (default: 0.5) */
    duration?: number;
    /** Easing function name (default: 'easeInOut') */
    ease?: EasingName;
}

/**
 * Available easing function names.
 */
export type EasingName =
    | 'linear'
    | 'easeIn'
    | 'easeOut'
    | 'easeInOut'
    | 'elastic'
    | 'bounce';

/**
 * Easing function signature.
 * Takes normalized time (0-1) and returns eased value (0-1).
 */
export type EasingFunction = (t: number) => number;
