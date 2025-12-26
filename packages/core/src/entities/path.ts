/**
 * Path shape entity - SVG-like path with chainable commands.
 */

import type { Point, Style } from '../types';
import { Shape } from './shape';

/** Path command types */
type PathCommand =
    | { type: 'M'; x: number; y: number }
    | { type: 'L'; x: number; y: number }
    | { type: 'Q'; cx: number; cy: number; x: number; y: number }
    | { type: 'C'; c1x: number; c1y: number; c2x: number; c2y: number; x: number; y: number }
    | { type: 'A'; rx: number; ry: number; rotation: number; largeArc: boolean; sweep: boolean; x: number; y: number }
    | { type: 'Z' };

export interface PathOptions {
    /** Initial commands (optional) */
    commands?: PathCommand[];
    /** Visual style */
    style?: Style;
}

/**
 * Default style for paths - stroke only.
 */
const PATH_DEFAULT_STYLE: Style = {
    fill: '',
    stroke: '#1abc9c',
    strokeWidth: 2,
};

/**
 * An SVG-like path with chainable drawing commands.
 *
 * @example
 * path()
 *   .moveTo(0, 0)
 *   .lineTo(100, 0)
 *   .quadraticTo(150, 50, 100, 100)
 *   .lineTo(0, 100)
 *   .close()
 */
export class Path extends Shape {
    protected commands: PathCommand[] = [];
    protected cachedLength: number | null = null;

    constructor(options?: PathOptions) {
        super({ ...PATH_DEFAULT_STYLE, ...options?.style });
        if (options?.commands) {
            this.commands = [...options.commands];
        }
    }

    moveTo(x: number, y: number): this {
        this.commands.push({ type: 'M', x, y });
        this.cachedLength = null;
        return this;
    }

    lineTo(x: number, y: number): this {
        this.commands.push({ type: 'L', x, y });
        this.cachedLength = null;
        return this;
    }

    quadraticTo(cx: number, cy: number, x: number, y: number): this {
        this.commands.push({ type: 'Q', cx, cy, x, y });
        this.cachedLength = null;
        return this;
    }

    cubicTo(c1x: number, c1y: number, c2x: number, c2y: number, x: number, y: number): this {
        this.commands.push({ type: 'C', c1x, c1y, c2x, c2y, x, y });
        this.cachedLength = null;
        return this;
    }

    arcTo(rx: number, ry: number, rotation: number, largeArc: boolean, sweep: boolean, x: number, y: number): this {
        this.commands.push({ type: 'A', rx, ry, rotation, largeArc, sweep, x, y });
        this.cachedLength = null;
        return this;
    }

    close(): this {
        this.commands.push({ type: 'Z' });
        return this;
    }

    clear(): this {
        this.commands = [];
        this.cachedLength = null;
        return this;
    }

    getCommands(): readonly PathCommand[] {
        return this.commands;
    }

    /** Uses line segment approximation for curves. */
    getLength(): number {
        if (this.cachedLength !== null) {
            return this.cachedLength;
        }

        let length = 0;
        let currentX = 0;
        let currentY = 0;
        let startX = 0;
        let startY = 0;

        for (const cmd of this.commands) {
            switch (cmd.type) {
                case 'M':
                    currentX = cmd.x;
                    currentY = cmd.y;
                    startX = cmd.x;
                    startY = cmd.y;
                    break;
                case 'L':
                    length += Math.sqrt((cmd.x - currentX) ** 2 + (cmd.y - currentY) ** 2);
                    currentX = cmd.x;
                    currentY = cmd.y;
                    break;
                case 'Q':
                    // Approximate quadratic bezier length
                    length += this.approximateCurveLength(
                        currentX, currentY, cmd.cx, cmd.cy, cmd.x, cmd.y
                    );
                    currentX = cmd.x;
                    currentY = cmd.y;
                    break;
                case 'C':
                    // Approximate cubic bezier length
                    length += this.approximateCubicLength(
                        currentX, currentY, cmd.c1x, cmd.c1y, cmd.c2x, cmd.c2y, cmd.x, cmd.y
                    );
                    currentX = cmd.x;
                    currentY = cmd.y;
                    break;
                case 'A':
                    // Approximate arc length
                    length += this.approximateArcLength(cmd.rx, cmd.ry);
                    currentX = cmd.x;
                    currentY = cmd.y;
                    break;
                case 'Z':
                    length += Math.sqrt((startX - currentX) ** 2 + (startY - currentY) ** 2);
                    currentX = startX;
                    currentY = startY;
                    break;
            }
        }

        this.cachedLength = length;
        return length;
    }

    /** Returns interpolated position along the entire path. */
    getPointAt(t: number): Point {
        const targetLength = t * this.getLength();
        let currentLength = 0;
        let currentX = 0;
        let currentY = 0;
        let startX = 0;
        let startY = 0;

        for (const cmd of this.commands) {
            const prevX = currentX;
            const prevY = currentY;

            switch (cmd.type) {
                case 'M':
                    currentX = cmd.x;
                    currentY = cmd.y;
                    startX = cmd.x;
                    startY = cmd.y;
                    break;
                case 'L': {
                    const segmentLength = Math.sqrt((cmd.x - prevX) ** 2 + (cmd.y - prevY) ** 2);
                    if (currentLength + segmentLength >= targetLength) {
                        const localT = (targetLength - currentLength) / segmentLength;
                        return {
                            x: prevX + localT * (cmd.x - prevX),
                            y: prevY + localT * (cmd.y - prevY),
                        };
                    }
                    currentLength += segmentLength;
                    currentX = cmd.x;
                    currentY = cmd.y;
                    break;
                }
                case 'Q': {
                    const segmentLength = this.approximateCurveLength(prevX, prevY, cmd.cx, cmd.cy, cmd.x, cmd.y);
                    if (currentLength + segmentLength >= targetLength) {
                        const localT = (targetLength - currentLength) / segmentLength;
                        return this.quadraticPoint(prevX, prevY, cmd.cx, cmd.cy, cmd.x, cmd.y, localT);
                    }
                    currentLength += segmentLength;
                    currentX = cmd.x;
                    currentY = cmd.y;
                    break;
                }
                case 'C': {
                    const segmentLength = this.approximateCubicLength(prevX, prevY, cmd.c1x, cmd.c1y, cmd.c2x, cmd.c2y, cmd.x, cmd.y);
                    if (currentLength + segmentLength >= targetLength) {
                        const localT = (targetLength - currentLength) / segmentLength;
                        return this.cubicPoint(prevX, prevY, cmd.c1x, cmd.c1y, cmd.c2x, cmd.c2y, cmd.x, cmd.y, localT);
                    }
                    currentLength += segmentLength;
                    currentX = cmd.x;
                    currentY = cmd.y;
                    break;
                }
                case 'A': {
                    // Simplified - treat as line for now
                    const segmentLength = Math.sqrt((cmd.x - prevX) ** 2 + (cmd.y - prevY) ** 2);
                    if (currentLength + segmentLength >= targetLength) {
                        const localT = (targetLength - currentLength) / segmentLength;
                        return {
                            x: prevX + localT * (cmd.x - prevX),
                            y: prevY + localT * (cmd.y - prevY),
                        };
                    }
                    currentLength += segmentLength;
                    currentX = cmd.x;
                    currentY = cmd.y;
                    break;
                }
                case 'Z': {
                    const segmentLength = Math.sqrt((startX - prevX) ** 2 + (startY - prevY) ** 2);
                    if (currentLength + segmentLength >= targetLength) {
                        const localT = (targetLength - currentLength) / segmentLength;
                        return {
                            x: prevX + localT * (startX - prevX),
                            y: prevY + localT * (startY - prevY),
                        };
                    }
                    currentLength += segmentLength;
                    currentX = startX;
                    currentY = startY;
                    break;
                }
            }
        }

        return { x: currentX, y: currentY };
    }

    render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        this.applyTransform(ctx);
        this.applyStyle(ctx);

        ctx.beginPath();

        for (const cmd of this.commands) {
            switch (cmd.type) {
                case 'M':
                    ctx.moveTo(cmd.x, cmd.y);
                    break;
                case 'L':
                    ctx.lineTo(cmd.x, cmd.y);
                    break;
                case 'Q':
                    ctx.quadraticCurveTo(cmd.cx, cmd.cy, cmd.x, cmd.y);
                    break;
                case 'C':
                    ctx.bezierCurveTo(cmd.c1x, cmd.c1y, cmd.c2x, cmd.c2y, cmd.x, cmd.y);
                    break;
                case 'A':
                    // Canvas doesn't have direct arc-to, approximate with bezier
                    ctx.lineTo(cmd.x, cmd.y);
                    break;
                case 'Z':
                    ctx.closePath();
                    break;
            }
        }

        if (this.style.fill) {
            ctx.fill();
        }
        if (this.style.stroke && this.style.strokeWidth > 0) {
            ctx.stroke();
        }

        ctx.restore();
    }

    // Helper methods for length/point calculations
    private approximateCurveLength(x0: number, y0: number, cx: number, cy: number, x: number, y: number): number {
        // Approximate with line segments
        const steps = 10;
        let length = 0;
        let prevX = x0;
        let prevY = y0;
        for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            const pt = this.quadraticPoint(x0, y0, cx, cy, x, y, t);
            length += Math.sqrt((pt.x - prevX) ** 2 + (pt.y - prevY) ** 2);
            prevX = pt.x;
            prevY = pt.y;
        }
        return length;
    }

    private approximateCubicLength(x0: number, y0: number, c1x: number, c1y: number, c2x: number, c2y: number, x: number, y: number): number {
        const steps = 10;
        let length = 0;
        let prevX = x0;
        let prevY = y0;
        for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            const pt = this.cubicPoint(x0, y0, c1x, c1y, c2x, c2y, x, y, t);
            length += Math.sqrt((pt.x - prevX) ** 2 + (pt.y - prevY) ** 2);
            prevX = pt.x;
            prevY = pt.y;
        }
        return length;
    }

    private approximateArcLength(rx: number, ry: number): number {
        // Rough approximation using average radius
        return Math.PI * (rx + ry) / 2;
    }

    private quadraticPoint(x0: number, y0: number, cx: number, cy: number, x: number, y: number, t: number): Point {
        const mt = 1 - t;
        return {
            x: mt * mt * x0 + 2 * mt * t * cx + t * t * x,
            y: mt * mt * y0 + 2 * mt * t * cy + t * t * y,
        };
    }

    private cubicPoint(x0: number, y0: number, c1x: number, c1y: number, c2x: number, c2y: number, x: number, y: number, t: number): Point {
        const mt = 1 - t;
        const mt2 = mt * mt;
        const mt3 = mt2 * mt;
        const t2 = t * t;
        const t3 = t2 * t;
        return {
            x: mt3 * x0 + 3 * mt2 * t * c1x + 3 * mt * t2 * c2x + t3 * x,
            y: mt3 * y0 + 3 * mt2 * t * c1y + 3 * mt * t2 * c2y + t3 * y,
        };
    }
}

export function path(options?: PathOptions): Path {
    return new Path(options);
}
