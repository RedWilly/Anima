/**
 * Polygon shape entity - a closed shape defined by vertices.
 * Supports both simple polygons (single path) and complex shapes with sub-paths.
 */

import type { Point, Style, ActionInfo } from '../../../types';
import { Shape } from '../../shape';
import type { PolygonOptions, MorphTarget, MorphOptions } from './types';
import {
    isSubPaths,
    interpolatePoints,
    interpolateSubPaths,
    interpolateStyle,
} from './morph';

/**
 * Default style for polygons.
 */
const POLYGON_DEFAULT_STYLE: Style = {
    fill: '#3498db',
    stroke: '#2980b9',
    strokeWidth: 2,
};

/**
 * A polygon shape defined by an array of vertices.
 * The shape is automatically closed.
 * Supports sub-paths for morphing to complex shapes like text.
 */
export class Polygon extends Shape {
    /** Primary points for simple polygons */
    protected points: Point[];

    /** Sub-paths for complex shapes (text, multi-contour glyphs) */
    protected subPaths: Point[][] | null = null;

    constructor(options?: PolygonOptions) {
        super(options?.style ?? POLYGON_DEFAULT_STYLE);

        // Default to a triangle if no points provided
        const defaultPoints: Point[] = [
            { x: 0, y: -50 },
            { x: 50, y: 50 },
            { x: -50, y: 50 },
        ];

        this.points = options?.points
            ? options.points.map(p => ({ ...p }))
            : defaultPoints;

        if (this.points.length < 3) {
            throw new Error(
                `Polygon requires at least 3 points (received: ${this.points.length}). ` +
                'Provide an array with 3 or more points.'
            );
        }
    }

    /**
     * Set the polygon vertices.
     */
    setPoints(points: Point[]): this {
        if (points.length < 3) {
            throw new Error(
                `Polygon requires at least 3 points (received: ${points.length}). ` +
                'Provide an array with 3 or more points.'
            );
        }
        this.points = points.map(p => ({ ...p }));
        this.subPaths = null; // Clear sub-paths when setting flat points
        return this;
    }

    /**
     * Set sub-paths for complex shapes.
     */
    setSubPaths(subPaths: Point[][]): this {
        this.subPaths = subPaths.map(sp => sp.map(p => ({ ...p })));
        // Also flatten to points for backward compatibility
        this.points = this.subPaths.flat();
        return this;
    }

    /**
     * Get the polygon vertices.
     */
    getPoints(): Point[] {
        return this.points.map(p => ({ ...p }));
    }

    /**
     * Get sub-paths if available.
     */
    getSubPaths(): Point[][] | null {
        return this.subPaths ? this.subPaths.map(sp => sp.map(p => ({ ...p }))) : null;
    }

    /**
     * Get the number of vertices.
     */
    getVertexCount(): number {
        return this.points.length;
    }

    /**
     * Calculate the centroid of the polygon.
     */
    getCentroid(): Point {
        const len = this.points.length;
        let sumX = 0;
        let sumY = 0;

        for (let i = 0; i < len; i++) {
            sumX += this.points[i].x;
            sumY += this.points[i].y;
        }

        return { x: sumX / len, y: sumY / len };
    }

    render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        this.applyTransform(ctx);
        this.applyStyle(ctx);

        ctx.beginPath();

        if (this.subPaths && this.subPaths.length > 0) {
            // Render as multiple sub-paths (for text/complex shapes)
            for (const subPath of this.subPaths) {
                if (subPath.length === 0) continue;
                ctx.moveTo(subPath[0].x, subPath[0].y);
                for (let i = 1; i < subPath.length; i++) {
                    ctx.lineTo(subPath[i].x, subPath[i].y);
                }
                ctx.closePath();
            }
        } else if (this.points.length >= 3) {
            // Render as simple polygon
            ctx.moveTo(this.points[0].x, this.points[0].y);
            for (let i = 1; i < this.points.length; i++) {
                ctx.lineTo(this.points[i].x, this.points[i].y);
            }
            ctx.closePath();
        }

        if (this.style.fill) {
            ctx.fill();
        }
        if (this.style.stroke && this.style.strokeWidth > 0) {
            ctx.stroke();
        }

        ctx.restore();
    }

    /**
     * Morph to another shape, text, or set of points over time.
     * Supports both flat point arrays and sub-path structures.
     *
     * @example
     * // Morph to another shape
     * triangle.morphTo(circle({ radius: 50 }), { duration: 1 })
     *
     * // Morph to text (preserves sub-paths)
     * triangle.morphTo(text({ content: 'A', fontSize: 80 }), { duration: 1 })
     *
     * // Morph to explicit points
     * triangle.morphTo([{x:0,y:-75}, {x:75,y:75}, {x:-75,y:75}], { duration: 1 })
     */
    morphTo(target: MorphTarget, options?: MorphOptions): this {
        if (!this.timeline) {
            throw new Error(
                `Entity "${this.id}" is not bound to a timeline. ` +
                'Add the entity to a scene first.'
            );
        }

        let targetPoints: Point[] | Point[][];
        let targetStyle: Style | undefined;

        if (Array.isArray(target)) {
            targetPoints = target;
            // For raw points, use explicit style option or undefined
            targetStyle = options?.style;
        } else {
            targetPoints = target.getMorphPoints();
            // Extract target's style if available, allow user override
            targetStyle = options?.style ?? (target.getStyle ? target.getStyle() : undefined);
        }

        // Determine if target uses sub-paths
        const hasSubPaths = isSubPaths(targetPoints);

        this.timeline.scheduleAction({
            type: 'morphTo',
            targetId: this.id,
            target: null,
            duration: options?.duration ?? 1,
            ease: options?.ease ?? 'easeInOut',
            morphPoints: hasSubPaths ? (targetPoints as Point[][]).flat() : targetPoints as Point[],
            morphSubPaths: hasSubPaths ? (targetPoints as Point[][]).map(sp => sp.map(p => ({ ...p }))) : undefined,
            morphStyle: targetStyle,
        }, this);
        return this;
    }

    /**
     * Override applyAction to handle morphTo with sub-paths.
     */
    applyAction(action: ActionInfo, progress: number): void {
        if (action.type === 'morphTo' && action.morphPoints && action.morphStartPoints) {
            // Interpolate flat points
            this.points = interpolatePoints(action.morphStartPoints, action.morphPoints, progress);

            // Handle sub-paths interpolation
            if (action.morphSubPaths && action.morphStartSubPaths) {
                this.subPaths = interpolateSubPaths(action.morphStartSubPaths, action.morphSubPaths, progress);
            } else if (action.morphSubPaths) {
                // Transitioning from flat to sub-paths at end
                if (progress >= 1) {
                    this.subPaths = action.morphSubPaths;
                } else {
                    this.subPaths = null;
                }
            } else {
                this.subPaths = null;
            }

            // Interpolate style if target style is specified
            if (action.morphStyle && action.morphStartStyle) {
                const interpolated = interpolateStyle(action.morphStartStyle, action.morphStyle, progress);
                if (interpolated.fill !== undefined) this.style.fill = interpolated.fill;
                if (interpolated.stroke !== undefined) this.style.stroke = interpolated.stroke;
                if (interpolated.strokeWidth !== undefined) this.style.strokeWidth = interpolated.strokeWidth;
            }
        } else {
            super.applyAction(action, progress);
        }
    }

    /**
     * Override captureState for morphTo.
     */
    captureState(actionType: string): Point | number | null {
        if (actionType === 'morphTo') {
            // Return null - morph uses morphStartPoints separately
            return null;
        }
        return super.captureState(actionType);
    }

    /**
     * Get current points for morph start capture.
     */
    getMorphPoints(): Point[] {
        return this.points.map(p => ({ ...p }));
    }

    /**
     * Get current sub-paths for morph start capture (if any).
     */
    getMorphSubPaths(): Point[][] | null {
        return this.subPaths ? this.subPaths.map(sp => sp.map(p => ({ ...p }))) : null;
    }
}

/**
 * Factory function to create a Polygon.
 */
export function polygon(options?: PolygonOptions): Polygon {
    return new Polygon(options);
}
