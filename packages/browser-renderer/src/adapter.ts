/**
 * Canvas 2D rendering adapter.
 */

import type { Style } from '@anima/core';

/**
 * Render adapter interface for drawing primitives.
 */
export interface RenderAdapter {
    /** Clear the canvas */
    clear(): void;
    /** Draw a circle */
    drawCircle(x: number, y: number, radius: number, style: Style): void;
    /** Draw a rectangle */
    drawRect(x: number, y: number, width: number, height: number, style: Style): void;
    /** Get the underlying context */
    getContext(): CanvasRenderingContext2D;
    /** Get canvas dimensions */
    getSize(): { width: number; height: number };
}

/**
 * Canvas 2D rendering adapter implementation.
 */
export class CanvasAdapter implements RenderAdapter {
    private ctx: CanvasRenderingContext2D;
    private canvas: HTMLCanvasElement;

    constructor(canvas: HTMLCanvasElement) {
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Failed to get 2D context from canvas');
        }
        this.canvas = canvas;
        this.ctx = ctx;
    }

    /**
     * Clear the entire canvas.
     */
    clear(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Draw a circle.
     */
    drawCircle(x: number, y: number, radius: number, style: Style): void {
        const ctx = this.ctx;
        ctx.save();
        this.applyStyle(style);
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        if (style.fill) ctx.fill();
        if (style.stroke) ctx.stroke();
        ctx.restore();
    }

    /**
     * Draw a rectangle.
     */
    drawRect(x: number, y: number, width: number, height: number, style: Style): void {
        const ctx = this.ctx;
        ctx.save();
        this.applyStyle(style);
        if (style.fill) {
            ctx.fillRect(x, y, width, height);
        }
        if (style.stroke) {
            ctx.strokeRect(x, y, width, height);
        }
        ctx.restore();
    }

    /**
     * Get the canvas context.
     */
    getContext(): CanvasRenderingContext2D {
        return this.ctx;
    }

    /**
     * Get canvas dimensions.
     */
    getSize(): { width: number; height: number } {
        return {
            width: this.canvas.width,
            height: this.canvas.height,
        };
    }

    /**
     * Apply style properties to context.
     */
    private applyStyle(style: Style): void {
        if (style.fill) {
            this.ctx.fillStyle = style.fill;
        }
        if (style.stroke) {
            this.ctx.strokeStyle = style.stroke;
        }
        if (style.strokeWidth) {
            this.ctx.lineWidth = style.strokeWidth;
        }
    }
}

/**
 * Create a canvas adapter from an existing canvas element.
 */
export function createCanvasAdapter(canvas: HTMLCanvasElement): CanvasAdapter {
    return new CanvasAdapter(canvas);
}
