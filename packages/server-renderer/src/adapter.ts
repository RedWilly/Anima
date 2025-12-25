/**
 * Server-side Canvas adapter using @napi-rs/canvas
 */

import { createCanvas, Canvas, CanvasRenderingContext2D } from '@napi-rs/canvas';
import type { Style } from '@anima/core';

/**
 * Server render adapter interface.
 */
export interface ServerRenderAdapter {
    clear(): void;
    drawCircle(x: number, y: number, radius: number, style: Style): void;
    drawRect(x: number, y: number, width: number, height: number, style: Style): void;
    getContext(): CanvasRenderingContext2D;
    toBuffer(format?: 'png' | 'jpeg'): Promise<Buffer>;
    getSize(): { width: number; height: number };
}

/**
 * Server-side canvas adapter using @napi-rs/canvas (Skia-based).
 */
export class ServerCanvasAdapter implements ServerRenderAdapter {
    private canvas: Canvas;
    private ctx: CanvasRenderingContext2D;

    constructor(width: number, height: number) {
        this.canvas = createCanvas(width, height);
        this.ctx = this.canvas.getContext('2d');
    }

    /**
     * Clear the canvas.
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
     * Export canvas to buffer.
     */
    async toBuffer(format: 'png' | 'jpeg' = 'png'): Promise<Buffer> {
        if (format === 'jpeg') {
            return this.canvas.toBuffer('image/jpeg');
        }
        return this.canvas.toBuffer('image/png');
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
     * Apply style to context.
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
 * Create a server canvas adapter.
 */
export function createServerCanvas(width: number, height: number): ServerCanvasAdapter {
    return new ServerCanvasAdapter(width, height);
}
