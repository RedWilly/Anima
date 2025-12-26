/**
 * Rectangle shape entity.
 */

import type { Point, Style } from '../types';
import { Shape } from './shape';

export interface RectangleOptions {
    /** Width in pixels (default: 100) */
    width?: number;
    /** Height in pixels (default: 100) */
    height?: number;
    /** Corner radius for rounded corners (default: 0) */
    cornerRadius?: number;
    /** Visual style */
    style?: Style;
}

/**
 * A rectangle shape with configurable dimensions and style.
 */
export class Rectangle extends Shape {
    private width: number;
    private height: number;
    private cornerRadius: number;

    constructor(options?: RectangleOptions) {
        super(options?.style);
        this.width = options?.width ?? 100;
        this.height = options?.height ?? 100;
        this.cornerRadius = options?.cornerRadius ?? 0;
    }

    /**
     * Set rectangle dimensions.
     */
    setSize(width: number, height: number): this {
        if (width <= 0 || height <= 0) {
            throw new Error(
                `Rectangle dimensions must be positive (received: ${width}x${height}). ` +
                'Use positive numbers, e.g., setSize(100, 50).'
            );
        }
        this.width = width;
        this.height = height;
        return this;
    }

    /**
     * Set corner radius for rounded corners.
     */
    setCornerRadius(radius: number): this {
        this.cornerRadius = Math.max(0, radius);
        return this;
    }

    /**
     * Get current dimensions.
     */
    getSize(): { width: number; height: number } {
        return { width: this.width, height: this.height };
    }

    getMorphPoints(): Point[] {
        const hw = this.width / 2;
        const hh = this.height / 2;
        return [
            { x: -hw, y: -hh },
            { x: hw, y: -hh },
            { x: hw, y: hh },
            { x: -hw, y: hh },
        ];
    }

    render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        this.applyTransform(ctx);
        this.applyStyle(ctx);

        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;

        if (this.cornerRadius > 0) {
            // Rounded rectangle
            const r = Math.min(this.cornerRadius, halfWidth, halfHeight);
            ctx.beginPath();
            ctx.moveTo(-halfWidth + r, -halfHeight);
            ctx.lineTo(halfWidth - r, -halfHeight);
            ctx.arcTo(halfWidth, -halfHeight, halfWidth, -halfHeight + r, r);
            ctx.lineTo(halfWidth, halfHeight - r);
            ctx.arcTo(halfWidth, halfHeight, halfWidth - r, halfHeight, r);
            ctx.lineTo(-halfWidth + r, halfHeight);
            ctx.arcTo(-halfWidth, halfHeight, -halfWidth, halfHeight - r, r);
            ctx.lineTo(-halfWidth, -halfHeight + r);
            ctx.arcTo(-halfWidth, -halfHeight, -halfWidth + r, -halfHeight, r);
            ctx.closePath();
        } else {
            // Regular rectangle
            ctx.beginPath();
            ctx.rect(-halfWidth, -halfHeight, this.width, this.height);
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
 * Factory function to create a Rectangle.
 */
export function rectangle(options?: RectangleOptions): Rectangle {
    return new Rectangle(options);
}
