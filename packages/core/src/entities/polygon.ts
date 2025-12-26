/**
 * Polygon shape entity - a closed shape defined by vertices.
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
 * A polygon shape defined by an array of vertices.
 * The shape is automatically closed.
 */
export class Polygon extends Shape {
    protected points: Point[];

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
        return this;
    }

    /**
     * Get the polygon vertices.
     */
    getPoints(): Point[] {
        return this.points.map(p => ({ ...p }));
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
        if (this.points.length < 3) return;

        ctx.save();
        this.applyTransform(ctx);
        this.applyStyle(ctx);

        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);

        for (let i = 1, len = this.points.length; i < len; i++) {
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }

        ctx.closePath();

        if (this.style.fill) {
            ctx.fill();
        }
        if (this.style.stroke && this.style.strokeWidth > 0) {
            ctx.stroke();
        }

        ctx.restore();
    }

    /**
     * Morph to another shape or set of points over time.
     *
     * @example
     * // Morph to another shape
     * triangle.morphTo(circle({ radius: 50 }), { duration: 1 })
     *
     * // Morph to explicit points
     * triangle.morphTo([{x:0,y:-75}, {x:75,y:75}, {x:-75,y:75}], { duration: 1 })
     */
    morphTo(target: Shape | Point[], options?: { duration?: number; ease?: EasingName }): this {
        if (!this.timeline) {
            throw new Error(
                `Entity "${this.id}" is not bound to a timeline. ` +
                'Add the entity to a scene first.'
            );
        }
        const targetPoints = Array.isArray(target) ? target : target.getMorphPoints();
        this.timeline.scheduleAction({
            type: 'morphTo',
            targetId: this.id,
            target: null,
            duration: options?.duration ?? 1,
            ease: options?.ease ?? 'easeInOut',
            morphPoints: targetPoints.map(p => ({ ...p })),
        }, this);
        return this;
    }

    /**
     * Override applyAction to handle morphTo.
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
}

/**
 * Factory function to create a Polygon.
 */
export function polygon(options?: PolygonOptions): Polygon {
    return new Polygon(options);
}


