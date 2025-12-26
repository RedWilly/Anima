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

/**
 * Font weight for text rendering.
 */
export type FontWeight = 'normal' | 'bold' | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

/**
 * Horizontal text alignment.
 */
export type TextAlign = 'left' | 'center' | 'right';

/**
 * Vertical text baseline alignment.
 */
export type TextBaseline = 'top' | 'middle' | 'bottom' | 'alphabetic';

/**
 * Minimal action info needed for applyAction.
 * Full Action interface is in timeline/action.ts.
 */
export interface ActionInfo {
    type: string;
    target: Point | number | null;
    /** Undefined allowed due to exactOptionalPropertyTypes tsconfig setting. */
    startValue?: Point | number | null | undefined;
    /** Path object for followPath actions */
    pathObject?: { getPointAt(t: number): Point; getTangentAt?(t: number): Point };
    /** Whether to orient entity along path direction */
    orientToPath?: boolean;
    /** Target points for morphTo actions */
    morphPoints?: Point[];
    /** Start points for morphTo actions */
    morphStartPoints?: Point[];
}

/**
 * Interface for objects that can be animated on a timeline.
 * Both Entity and Text implement this interface.
 */
export interface Animatable {
    readonly id: string;
    captureState(actionType: string): Point | number | null;
    applyAction(action: ActionInfo, progress: number): void;
    render(ctx: CanvasRenderingContext2D): void;
    bindTimeline(timeline: unknown): this;
    wait(seconds: number): this;
}
