/**
 * Line shape entity - a line segment between two points.
 */

import type { Point, Style } from '../types';
import { Shape } from './shape';

export interface LineOptions {
    /** Starting point (default: { x: 0, y: 0 }) */
    from?: Point;
    /** Ending point (default: { x: 100, y: 0 }) */
    to?: Point;
    /** Visual style */
    style?: Style;
}

/**
 * Default style for lines - stroke only, no fill.
 */
const LINE_DEFAULT_STYLE: Style = {
    fill: '',
    stroke: '#2980b9',
    strokeWidth: 2,
};

/**
 * A line segment shape with configurable start and end points.
 * Position is the midpoint of the line for transform purposes.
 */
export class Line extends Shape {
    protected fromPoint: Point;
    protected toPoint: Point;

    constructor(options?: LineOptions) {
        super({ ...LINE_DEFAULT_STYLE, ...options?.style });
        this.fromPoint = options?.from ? { ...options.from } : { x: -50, y: 0 };
        this.toPoint = options?.to ? { ...options.to } : { x: 50, y: 0 };
        // Lines default to no fill
        this.style.fill = '';
    }

    /**
     * Set the starting point of the line.
     */
    setFrom(x: number, y: number): this {
        this.fromPoint = { x, y };
        return this;
    }

    /**
     * Set the ending point of the line.
     */
    setTo(x: number, y: number): this {
        this.toPoint = { x, y };
        return this;
    }

    /**
     * Get the starting point.
     */
    getFrom(): Point {
        return { ...this.fromPoint };
    }

    /**
     * Get the ending point.
     */
    getTo(): Point {
        return { ...this.toPoint };
    }

    /**
     * Get the length of the line.
     */
    getLength(): number {
        const dx = this.toPoint.x - this.fromPoint.x;
        const dy = this.toPoint.y - this.fromPoint.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Get the angle of the line in radians.
     */
    getAngle(): number {
        const dx = this.toPoint.x - this.fromPoint.x;
        const dy = this.toPoint.y - this.fromPoint.y;
        return Math.atan2(dy, dx);
    }

    getMorphPoints(): Point[] {
        return [{ ...this.fromPoint }, { ...this.toPoint }];
    }

    render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        this.applyTransform(ctx);
        this.applyStyle(ctx);

        ctx.beginPath();
        ctx.moveTo(this.fromPoint.x, this.fromPoint.y);
        ctx.lineTo(this.toPoint.x, this.toPoint.y);

        if (this.style.stroke && this.style.strokeWidth > 0) {
            ctx.stroke();
        }

        ctx.restore();
    }
}

/**
 * Factory function to create a Line.
 */
export function line(options?: LineOptions): Line {
    return new Line(options);
}

