/**
 * Bezier curve shape entity - cubic and quadratic bezier curves.
 */

import type { Point, Style } from '../../types';
import { Shape } from '../shape';

export interface BezierOptions {
    /** Starting point (default: { x: 0, y: 0 }) */
    start?: Point;
    /** First control point */
    control1?: Point;
    /** Second control point (cubic only, omit for quadratic) */
    control2?: Point;
    /** Ending point (default: { x: 100, y: 0 }) */
    end?: Point;
    /** Visual style */
    style?: Style;
}

/**
 * Default style for bezier curves - stroke only.
 */
const BEZIER_DEFAULT_STYLE: Style = {
    fill: '',
    stroke: '#9b59b6',
    strokeWidth: 2,
};

/**
 * A bezier curve shape supporting both quadratic (1 control point)
 * and cubic (2 control points) curves.
 *
 * @example
 * // Quadratic bezier (1 control point)
 * bezier({ start: {x: 0, y: 0}, control1: {x: 50, y: -50}, end: {x: 100, y: 0} })
 *
 * // Cubic bezier (2 control points)
 * bezier({ start: {x: 0, y: 0}, control1: {x: 25, y: -50}, control2: {x: 75, y: 50}, end: {x: 100, y: 0} })
 */
export class Bezier extends Shape {
    protected startPoint: Point;
    protected control1Point: Point;
    protected control2Point: Point | null;
    protected endPoint: Point;

    constructor(options?: BezierOptions) {
        super({ ...BEZIER_DEFAULT_STYLE, ...options?.style });
        this.startPoint = options?.start ? { ...options.start } : { x: -50, y: 0 };
        this.control1Point = options?.control1 ? { ...options.control1 } : { x: -25, y: -50 };
        this.control2Point = options?.control2 ? { ...options.control2 } : null;
        this.endPoint = options?.end ? { ...options.end } : { x: 50, y: 0 };
        // Bezier curves default to no fill
        this.style.fill = '';
    }

    isCubic(): boolean {
        return this.control2Point !== null;
    }

    setStart(x: number, y: number): this {
        this.startPoint = { x, y };
        return this;
    }

    setControl1(x: number, y: number): this {
        this.control1Point = { x, y };
        return this;
    }

    /** Converts curve to cubic by adding second control point. */
    setControl2(x: number, y: number): this {
        this.control2Point = { x, y };
        return this;
    }

    /** Converts curve back to quadratic. */
    removeControl2(): this {
        this.control2Point = null;
        return this;
    }

    setEnd(x: number, y: number): this {
        this.endPoint = { x, y };
        return this;
    }

    getStart(): Point {
        return { ...this.startPoint };
    }

    getControl1(): Point {
        return { ...this.control1Point };
    }

    getControl2(): Point | null {
        return this.control2Point ? { ...this.control2Point } : null;
    }

    getEnd(): Point {
        return { ...this.endPoint };
    }

    /** Returns interpolated position along curve. */
    getPointAt(t: number): Point {
        const t2 = t * t;
        const t3 = t2 * t;
        const mt = 1 - t;
        const mt2 = mt * mt;
        const mt3 = mt2 * mt;

        if (this.control2Point) {
            // Cubic bezier: B(t) = (1-t)³P₀ + 3(1-t)²tP₁ + 3(1-t)t²P₂ + t³P₃
            return {
                x: mt3 * this.startPoint.x +
                    3 * mt2 * t * this.control1Point.x +
                    3 * mt * t2 * this.control2Point.x +
                    t3 * this.endPoint.x,
                y: mt3 * this.startPoint.y +
                    3 * mt2 * t * this.control1Point.y +
                    3 * mt * t2 * this.control2Point.y +
                    t3 * this.endPoint.y,
            };
        } else {
            // Quadratic bezier: B(t) = (1-t)²P₀ + 2(1-t)tP₁ + t²P₂
            return {
                x: mt2 * this.startPoint.x +
                    2 * mt * t * this.control1Point.x +
                    t2 * this.endPoint.x,
                y: mt2 * this.startPoint.y +
                    2 * mt * t * this.control1Point.y +
                    t2 * this.endPoint.y,
            };
        }
    }

    getTangentAt(t: number): Point {
        const mt = 1 - t;

        if (this.control2Point) {
            const dx = 3 * mt * mt * (this.control1Point.x - this.startPoint.x) +
                6 * mt * t * (this.control2Point.x - this.control1Point.x) +
                3 * t * t * (this.endPoint.x - this.control2Point.x);
            const dy = 3 * mt * mt * (this.control1Point.y - this.startPoint.y) +
                6 * mt * t * (this.control2Point.y - this.control1Point.y) +
                3 * t * t * (this.endPoint.y - this.control2Point.y);
            const len = Math.sqrt(dx * dx + dy * dy);
            return len > 0 ? { x: dx / len, y: dy / len } : { x: 1, y: 0 };
        } else {
            const dx = 2 * mt * (this.control1Point.x - this.startPoint.x) +
                2 * t * (this.endPoint.x - this.control1Point.x);
            const dy = 2 * mt * (this.control1Point.y - this.startPoint.y) +
                2 * t * (this.endPoint.y - this.control1Point.y);
            const len = Math.sqrt(dx * dx + dy * dy);
            return len > 0 ? { x: dx / len, y: dy / len } : { x: 1, y: 0 };
        }
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
        ctx.moveTo(this.startPoint.x, this.startPoint.y);

        if (this.control2Point) {
            ctx.bezierCurveTo(
                this.control1Point.x, this.control1Point.y,
                this.control2Point.x, this.control2Point.y,
                this.endPoint.x, this.endPoint.y
            );
        } else {
            ctx.quadraticCurveTo(
                this.control1Point.x, this.control1Point.y,
                this.endPoint.x, this.endPoint.y
            );
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

export function bezier(options?: BezierOptions): Bezier {
    return new Bezier(options);
}
