/**
 * Shape base class for visual primitives.
 */

import type { Point, Style } from '../types';
import { Entity } from './entity';

/**
 * Default style for shapes.
 */
const DEFAULT_STYLE: Required<Style> = {
    fill: '#3498db',
    stroke: '#2980b9',
    strokeWidth: 2,
};

/**
 * Abstract base class for shapes (Circle, Rectangle, etc.)
 */
export abstract class Shape extends Entity {
    protected style: Required<Style>;

    constructor(style?: Style) {
        super();
        this.style = {
            fill: style?.fill ?? DEFAULT_STYLE.fill,
            stroke: style?.stroke ?? DEFAULT_STYLE.stroke,
            strokeWidth: style?.strokeWidth ?? DEFAULT_STYLE.strokeWidth,
        };
    }

    /**
     * Set the fill color.
     */
    fill(color: string): this {
        this.style.fill = color;
        return this;
    }

    /**
     * Set the stroke color.
     */
    stroke(color: string): this {
        this.style.stroke = color;
        return this;
    }

    /**
     * Set the stroke width.
     */
    strokeWidth(width: number): this {
        this.style.strokeWidth = width;
        return this;
    }

    /**
     * Apply style to canvas context.
     */
    protected applyStyle(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.style.fill;
        ctx.strokeStyle = this.style.stroke;
        ctx.lineWidth = this.style.strokeWidth;
    }

    /**
     * Apply transform to canvas context.
     */
    protected applyTransform(ctx: CanvasRenderingContext2D): void {
        ctx.translate(this.currentPosition.x, this.currentPosition.y);
        ctx.rotate(this.currentRotation);
        ctx.scale(this.currentScale.x, this.currentScale.y);
        ctx.globalAlpha = this.currentOpacity;
    }

    /**
     * Get vector points for morphing.
     * @param segments - Number of segments for curved shapes
     */
    abstract getMorphPoints(segments?: number): Point[];
}
