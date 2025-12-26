/**
 * Arc shape entity - a portion of a circle or ellipse.
 */

import type { Point, Style } from '../../types';
import { Shape } from '../shape';

export interface ArcOptions {
    /** Center point (default: { x: 0, y: 0 }) */
    center?: Point;
    /** Radius (default: 50) */
    radius?: number;
    /** Radius X for ellipse (overrides radius) */
    radiusX?: number;
    /** Radius Y for ellipse (overrides radius) */
    radiusY?: number;
    /** Start angle in radians (default: 0) */
    startAngle?: number;
    /** End angle in radians (default: Math.PI) */
    endAngle?: number;
    /** Draw counterclockwise (default: false) */
    counterclockwise?: boolean;
    /** Close path to center (pie slice) (default: false) */
    closePath?: boolean;
    /** Visual style */
    style?: Style;
}

/**
 * Default style for arcs - stroke only.
 */
const ARC_DEFAULT_STYLE: Style = {
    fill: '',
    stroke: '#e67e22',
    strokeWidth: 2,
};

/**
 * An arc shape representing a portion of a circle or ellipse.
 *
 * @example
 * // Half circle
 * arc({ radius: 50, startAngle: 0, endAngle: Math.PI })
 *
 * // Pie slice (closed)
 * arc({ radius: 50, startAngle: 0, endAngle: Math.PI / 2, closePath: true })
 *
 * // Elliptical arc
 * arc({ radiusX: 80, radiusY: 40, startAngle: 0, endAngle: Math.PI })
 */
export class Arc extends Shape {
    protected centerPoint: Point;
    protected arcRadiusX: number;
    protected arcRadiusY: number;
    protected arcStartAngle: number;
    protected arcEndAngle: number;
    protected arcCounterclockwise: boolean;
    protected arcClosePath: boolean;

    constructor(options?: ArcOptions) {
        super({ ...ARC_DEFAULT_STYLE, ...options?.style });
        this.centerPoint = options?.center ? { ...options.center } : { x: 0, y: 0 };
        const defaultRadius = options?.radius ?? 50;
        this.arcRadiusX = options?.radiusX ?? defaultRadius;
        this.arcRadiusY = options?.radiusY ?? defaultRadius;
        this.arcStartAngle = options?.startAngle ?? 0;
        this.arcEndAngle = options?.endAngle ?? Math.PI;
        this.arcCounterclockwise = options?.counterclockwise ?? false;
        this.arcClosePath = options?.closePath ?? false;
    }

    /**
     * Set the center point.
     */
    setCenter(x: number, y: number): this {
        this.centerPoint = { x, y };
        return this;
    }

    /**
     * Set the radius (circular arc).
     */
    setRadius(radius: number): this {
        this.arcRadiusX = radius;
        this.arcRadiusY = radius;
        return this;
    }

    /**
     * Set radii for elliptical arc.
     */
    setRadii(radiusX: number, radiusY: number): this {
        this.arcRadiusX = radiusX;
        this.arcRadiusY = radiusY;
        return this;
    }

    /**
     * Set the start angle in radians.
     */
    setStartAngle(angle: number): this {
        this.arcStartAngle = angle;
        return this;
    }

    /**
     * Set the end angle in radians.
     */
    setEndAngle(angle: number): this {
        this.arcEndAngle = angle;
        return this;
    }

    /**
     * Set whether to close the path (pie slice).
     */
    setClosePath(close: boolean): this {
        this.arcClosePath = close;
        return this;
    }

    /**
     * Get center point.
     */
    getCenter(): Point {
        return { ...this.centerPoint };
    }

    /**
     * Get X radius.
     */
    getRadiusX(): number {
        return this.arcRadiusX;
    }

    /**
     * Get Y radius.
     */
    getRadiusY(): number {
        return this.arcRadiusY;
    }

    /**
     * Get start angle.
     */
    getStartAngle(): number {
        return this.arcStartAngle;
    }

    /**
     * Get end angle.
     */
    getEndAngle(): number {
        return this.arcEndAngle;
    }

    /**
     * Check if arc is elliptical.
     */
    isElliptical(): boolean {
        return this.arcRadiusX !== this.arcRadiusY;
    }

    /**
     * Get a point on the arc at parameter t (0-1).
     */
    getPointAt(t: number): Point {
        const angle = this.arcCounterclockwise
            ? this.arcStartAngle - t * (this.arcStartAngle - this.arcEndAngle)
            : this.arcStartAngle + t * (this.arcEndAngle - this.arcStartAngle);
        return {
            x: this.centerPoint.x + this.arcRadiusX * Math.cos(angle),
            y: this.centerPoint.y + this.arcRadiusY * Math.sin(angle),
        };
    }

    /**
     * Get the tangent at parameter t (0-1).
     */
    getTangentAt(t: number): Point {
        const angle = this.arcCounterclockwise
            ? this.arcStartAngle - t * (this.arcStartAngle - this.arcEndAngle)
            : this.arcStartAngle + t * (this.arcEndAngle - this.arcStartAngle);
        const direction = this.arcCounterclockwise ? -1 : 1;
        const dx = -this.arcRadiusX * Math.sin(angle) * direction;
        const dy = this.arcRadiusY * Math.cos(angle) * direction;
        const len = Math.sqrt(dx * dx + dy * dy);
        return len > 0 ? { x: dx / len, y: dy / len } : { x: 1, y: 0 };
    }

    getMorphPoints(segments = 32): Point[] {
        const pts: Point[] = [];
        for (let i = 0; i <= segments; i++) {
            pts.push(this.getPointAt(i / segments));
        }
        return pts;
    }

    render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        this.applyTransform(ctx);
        this.applyStyle(ctx);

        ctx.beginPath();

        if (this.arcClosePath) {
            ctx.moveTo(this.centerPoint.x, this.centerPoint.y);
        }

        if (this.isElliptical()) {
            ctx.ellipse(
                this.centerPoint.x, this.centerPoint.y,
                this.arcRadiusX, this.arcRadiusY,
                0, // rotation
                this.arcStartAngle, this.arcEndAngle,
                this.arcCounterclockwise
            );
        } else {
            ctx.arc(
                this.centerPoint.x, this.centerPoint.y,
                this.arcRadiusX,
                this.arcStartAngle, this.arcEndAngle,
                this.arcCounterclockwise
            );
        }

        if (this.arcClosePath) {
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
}

/**
 * Factory function to create an Arc.
 */
export function arc(options?: ArcOptions): Arc {
    return new Arc(options);
}
