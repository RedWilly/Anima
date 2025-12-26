/**
 * Circle shape entity.
 */

import type { Point, Style } from '../types';
import { Shape } from './shape';

export interface CircleOptions {
    /** Radius in pixels (default: 50) */
    radius?: number;
    /** Visual style */
    style?: Style;
}

/**
 * A circle shape with configurable radius and style.
 */
export class Circle extends Shape {
    private radius: number;

    constructor(options?: CircleOptions) {
        super(options?.style);
        this.radius = options?.radius ?? 50;
    }

    /**
     * Set the circle radius.
     */
    setRadius(value: number): this {
        if (value <= 0) {
            throw new Error(
                `Circle radius must be positive (received: ${value}). ` +
                'Use a positive number, e.g., setRadius(50).'
            );
        }
        this.radius = value;
        return this;
    }

    /**
     * Get the current radius.
     */
    getRadius(): number {
        return this.radius;
    }

    getMorphPoints(segments = 32): Point[] {
        const pts: Point[] = [];
        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            pts.push({
                x: Math.cos(angle) * this.radius,
                y: Math.sin(angle) * this.radius,
            });
        }
        return pts;
    }

    render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        this.applyTransform(ctx);
        this.applyStyle(ctx);

        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);

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
 * Factory function to create a Circle.
 */
export function circle(options?: CircleOptions): Circle {
    return new Circle(options);
}
