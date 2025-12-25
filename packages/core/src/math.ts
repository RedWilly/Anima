/**
 * Mathematical utilities for animation calculations.
 */

import type { Point } from './types';

/**
 * Linear interpolation between two values.
 * @param start Starting value
 * @param end Ending value
 * @param t Interpolation factor (0-1)
 * @returns Interpolated value
 */
export function lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
}

/**
 * Clamp a value between min and max bounds.
 * @param value Value to clamp
 * @param min Minimum bound
 * @param max Maximum bound
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

/**
 * 2D Vector operations.
 */
export const Vector2 = {
    /**
     * Create a new point.
     */
    create(x: number, y: number): Point {
        return { x, y };
    },

    /**
     * Add two vectors.
     */
    add(a: Point, b: Point): Point {
        return { x: a.x + b.x, y: a.y + b.y };
    },

    /**
     * Subtract vector b from vector a.
     */
    subtract(a: Point, b: Point): Point {
        return { x: a.x - b.x, y: a.y - b.y };
    },

    /**
     * Scale a vector by a scalar.
     */
    scale(v: Point, scalar: number): Point {
        return { x: v.x * scalar, y: v.y * scalar };
    },

    /**
     * Calculate the magnitude (length) of a vector.
     */
    magnitude(v: Point): number {
        return Math.sqrt(v.x * v.x + v.y * v.y);
    },

    /**
     * Normalize a vector to unit length.
     */
    normalize(v: Point): Point {
        const mag = Vector2.magnitude(v);
        if (mag === 0) return { x: 0, y: 0 };
        return { x: v.x / mag, y: v.y / mag };
    },

    /**
     * Linear interpolation between two points.
     */
    lerp(a: Point, b: Point, t: number): Point {
        return {
            x: lerp(a.x, b.x, t),
            y: lerp(a.y, b.y, t),
        };
    },

    /**
     * Calculate distance between two points.
     */
    distance(a: Point, b: Point): number {
        return Vector2.magnitude(Vector2.subtract(b, a));
    },

    /**
     * Zero vector constant.
     */
    zero(): Point {
        return { x: 0, y: 0 };
    },

    /**
     * Unit vector constant.
     */
    one(): Point {
        return { x: 1, y: 1 };
    },
};
