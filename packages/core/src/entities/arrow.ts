/**
 * Arrow shape entity - a line with arrowhead(s).
 */

import type { Style } from '../types';
import { Line, type LineOptions } from './line';

/** Where to draw arrowheads */
export type ArrowHeads = 'start' | 'end' | 'both';

/** Arrowhead visual style */
export type ArrowHeadStyle = 'filled' | 'outline';

/**
 * Default style for arrows.
 */
const ARROW_DEFAULT_STYLE: Style = {
    fill: '',
    stroke: '#3498db',
    strokeWidth: 2,
};

export interface ArrowOptions extends LineOptions {
    /** Size of the arrowhead in pixels (default: 10) */
    headSize?: number;
    /** Visual style of arrowhead (default: 'filled') */
    headStyle?: ArrowHeadStyle;
    /** Which ends have arrowheads (default: 'end') */
    heads?: ArrowHeads;
}

/**
 * An arrow shape - a line segment with arrowhead(s).
 * Extends Line with configurable arrowhead rendering.
 */
export class Arrow extends Line {
    protected headSize: number;
    protected headStyle: ArrowHeadStyle;
    protected heads: ArrowHeads;

    constructor(options?: ArrowOptions) {
        super({ ...options, style: options?.style ?? ARROW_DEFAULT_STYLE });
        this.headSize = options?.headSize ?? 10;
        this.headStyle = options?.headStyle ?? 'filled';
        this.heads = options?.heads ?? 'end';

        if (this.headSize <= 0) {
            throw new Error(
                `Arrow headSize must be positive (received: ${this.headSize}). ` +
                'Use a positive number, e.g., headSize: 10.'
            );
        }
    }

    /**
     * Set the arrowhead size.
     */
    setHeadSize(size: number): this {
        if (size <= 0) {
            throw new Error(
                `Arrow headSize must be positive (received: ${size}). ` +
                'Use a positive number, e.g., setHeadSize(10).'
            );
        }
        this.headSize = size;
        return this;
    }

    /**
     * Set which ends have arrowheads.
     */
    setHeads(heads: ArrowHeads): this {
        this.heads = heads;
        return this;
    }

    /**
     * Set the arrowhead style.
     */
    setHeadStyle(style: ArrowHeadStyle): this {
        this.headStyle = style;
        return this;
    }

    /**
     * Get arrowhead configuration.
     */
    getHeadConfig(): { size: number; style: ArrowHeadStyle; heads: ArrowHeads } {
        return {
            size: this.headSize,
            style: this.headStyle,
            heads: this.heads,
        };
    }

    /**
     * Draw an arrowhead at the specified point and angle.
     */
    protected drawArrowhead(
        ctx: CanvasRenderingContext2D,
        tipX: number,
        tipY: number,
        angle: number
    ): void {
        const size = this.headSize;
        const halfAngle = Math.PI / 6; // 30 degrees

        // Calculate the two base points of the arrowhead triangle
        const x1 = tipX - size * Math.cos(angle - halfAngle);
        const y1 = tipY - size * Math.sin(angle - halfAngle);
        const x2 = tipX - size * Math.cos(angle + halfAngle);
        const y2 = tipY - size * Math.sin(angle + halfAngle);

        ctx.beginPath();
        ctx.moveTo(tipX, tipY);
        ctx.lineTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.closePath();

        if (this.headStyle === 'filled') {
            ctx.fillStyle = this.style.stroke;
            ctx.fill();
        } else {
            ctx.stroke();
        }
    }

    /**
     * Render the arrow to a canvas context.
     */
    render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        this.applyTransform(ctx);
        this.applyStyle(ctx);

        // Draw the line
        ctx.beginPath();
        ctx.moveTo(this.fromPoint.x, this.fromPoint.y);
        ctx.lineTo(this.toPoint.x, this.toPoint.y);

        if (this.style.stroke && this.style.strokeWidth > 0) {
            ctx.stroke();
        }

        // Calculate line angle
        const angle = this.getAngle();

        // Draw arrowheads
        if (this.heads === 'end' || this.heads === 'both') {
            this.drawArrowhead(ctx, this.toPoint.x, this.toPoint.y, angle);
        }

        if (this.heads === 'start' || this.heads === 'both') {
            // Reverse angle for start arrowhead
            this.drawArrowhead(
                ctx,
                this.fromPoint.x,
                this.fromPoint.y,
                angle + Math.PI
            );
        }

        ctx.restore();
    }
}

/**
 * Factory function to create an Arrow.
 */
export function arrow(options?: ArrowOptions): Arrow {
    return new Arrow(options);
}

