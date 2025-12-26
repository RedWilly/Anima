/**
 * Polygon shape entity - a closed shape defined by vertices.
 * Supports both simple polygons (single path) and complex shapes with sub-paths.
 */

import type { Point, Style } from '../types';
import { Shape } from './shape';
import type { EasingName } from '../types';

export interface PolygonOptions {
    /** Array of vertices (minimum 3 points required) */
    points?: Point[];
    /** Visual style */
    style?: Style;
}

/**
 * Check if a value is a 2D array (sub-paths structure).
 */
function isSubPaths(value: Point[] | Point[][]): value is Point[][] {
    if (value.length === 0) {
        return false;
    }
    const first = value[0];
    return Array.isArray(first);
}

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
        super(options?.style);

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
    morphTo(
        target: { getMorphPoints: (segments?: number) => Point[] | Point[][] } | Point[] | Point[][],
        options?: { duration?: number; ease?: EasingName }
    ): this {
        if (!this.timeline) {
            throw new Error(
                `Entity "${this.id}" is not bound to a timeline. ` +
                'Add the entity to a scene first.'
            );
        }

        let targetPoints: Point[] | Point[][];
        if (Array.isArray(target)) {
            targetPoints = target;
        } else {
            targetPoints = target.getMorphPoints();
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
        }, this);
        return this;
    }

    /**
     * Override applyAction to handle morphTo with sub-paths.
     */
    applyAction(action: import('../types').ActionInfo, progress: number): void {
        if (action.type === 'morphTo' && action.morphPoints && action.morphStartPoints) {
            const start = action.morphStartPoints;
            const end = action.morphPoints;
            const len = Math.max(start.length, end.length);
            const newPoints: Point[] = [];

            for (let i = 0; i < len; i++) {
                const s = start[i % start.length];
                const e = end[i % end.length];
                newPoints.push({
                    x: s.x + (e.x - s.x) * progress,
                    y: s.y + (e.y - s.y) * progress,
                });
            }

            this.points = newPoints;

            // Handle sub-paths interpolation
            if (action.morphSubPaths && action.morphStartSubPaths) {
                const startSubs = action.morphStartSubPaths;
                const endSubs = action.morphSubPaths;
                const subLen = Math.max(startSubs.length, endSubs.length);
                const newSubPaths: Point[][] = [];

                for (let si = 0; si < subLen; si++) {
                    const startSub = startSubs[si % startSubs.length];
                    const endSub = endSubs[si % endSubs.length];
                    const pathLen = Math.max(startSub.length, endSub.length);
                    const newPath: Point[] = [];

                    for (let pi = 0; pi < pathLen; pi++) {
                        const sp = startSub[pi % startSub.length];
                        const ep = endSub[pi % endSub.length];
                        newPath.push({
                            x: sp.x + (ep.x - sp.x) * progress,
                            y: sp.y + (ep.y - sp.y) * progress,
                        });
                    }
                    newSubPaths.push(newPath);
                }

                this.subPaths = newSubPaths;
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


