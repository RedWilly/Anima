/**
 * Polygon shape entity - a closed shape defined by vertices.
 */

import type { Point, Style } from '../types';
import { Shape } from './shape';

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

    /**
     * Render the polygon to a canvas context.
     */
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
}

/**
 * Factory function to create a Polygon.
 */
export function polygon(options?: PolygonOptions): Polygon {
    return new Polygon(options);
}

