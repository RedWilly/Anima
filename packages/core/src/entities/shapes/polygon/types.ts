/**
 * Type definitions for Polygon entity.
 */

import type { Point, Style, EasingName } from '../../../types';

/**
 * Options for creating a Polygon.
 */
export interface PolygonOptions {
    /** Array of vertices (minimum 3 points required) */
    points?: Point[];
    /** Visual style */
    style?: Style;
}

/**
 * Target for morphTo - can be an entity with getMorphPoints, or raw points.
 */
export type MorphTarget =
    | { getMorphPoints: (segments?: number) => Point[] | Point[][]; getStyle?: () => Style }
    | Point[]
    | Point[][];

/**
 * Options for morphTo animation.
 */
export interface MorphOptions {
    /** Duration in seconds (default: 1) */
    duration?: number;
    /** Easing function name (default: 'easeInOut') */
    ease?: EasingName;
    /** Override target style */
    style?: Style;
}
