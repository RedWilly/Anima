import { Mobject } from './Mobject';
import { BezierPath } from '../core/math/bezier/BezierPath';
import type { PathCommand } from '../core/math/bezier/types';
import { Color } from '../core/math/color/Color';
import { Vector2 } from '../core/math/Vector2/Vector2';

/**
 * A Mobject that is defined by one or more BezierPaths.
 * Supports stroke and fill styling.
 */
export class VMobject extends Mobject {
    protected pathList: BezierPath[] = [];

    strokeColor: Color = Color.WHITE;
    strokeWidth: number = 2;
    fillColor: Color = Color.TRANSPARENT;
    fillOpacity: number = 0;

    constructor() {
        super();
    }

    get paths(): BezierPath[] {
        return this.pathList;
    }

    set paths(value: BezierPath[]) {
        this.pathList = value;
    }

    addPath(path: BezierPath): this {
        this.pathList.push(path);
        return this;
    }

    /**
     * Sets the stroke style.
     * @param color The stroke color.
     * @param width The stroke width in pixels.
     */
    stroke(color: Color, width: number): this {
        this.strokeColor = color;
        this.strokeWidth = width;
        return this;
    }

    /**
     * Sets the fill style.
     * @param color The fill color.
     * @param opacity The fill opacity (0-1).
     */
    fill(color: Color, opacity: number): this {
        this.fillColor = color;
        this.fillOpacity = opacity;
        return this;
    }

    /**
     * Returns all path commands defining this VMobject's geometry.
     * This is the lossless representation of the shape.
     * Use with setPoints() for perfect round-trip.
     */
    getPoints(): PathCommand[] {
        const commands: PathCommand[] = [];
        for (const path of this.pathList) {
            commands.push(...path.getCommands());
        }
        return commands;
    }

    /**
     * Sets the VMobject's paths from an array of PathCommands.
     * This preserves all command types (Move, Line, Quadratic, Cubic, Close).
     * Use with getPoints() for lossless round-trip.
     * @param commands Array of PathCommand objects.
     */
    setPoints(commands: PathCommand[]): this {
        if (commands.length === 0) {
            this.pathList = [];
            return this;
        }

        const path = new BezierPath();
        for (const cmd of commands) {
            switch (cmd.type) {
                case 'Move':
                    path.moveTo(cmd.end);
                    break;
                case 'Line':
                    path.lineTo(cmd.end);
                    break;
                case 'Quadratic':
                    if (cmd.control1) {
                        path.quadraticTo(cmd.control1, cmd.end);
                    }
                    break;
                case 'Cubic':
                    if (cmd.control1 && cmd.control2) {
                        path.cubicTo(cmd.control1, cmd.control2, cmd.end);
                    }
                    break;
                case 'Close':
                    path.closePath();
                    break;
            }
        }

        this.pathList = [path];
        return this;
    }

    /**
     * Returns a flat array of all anchor/control Vector2 points for bounding box calculations.
     * For path manipulation, use getPoints() instead.
     */
    private getPointsAsVectors(): Vector2[] {
        const points: Vector2[] = [];
        for (const cmd of this.getPoints()) {
            if (cmd.control1) points.push(cmd.control1);
            if (cmd.control2) points.push(cmd.control2);
            points.push(cmd.end);
        }
        return points;
    }

    /**
     * Returns the axis-aligned bounding box of the VMobject in world space.
     */
    getBoundingBox(): { minX: number; maxX: number; minY: number; maxY: number } {
        const points = this.getPointsAsVectors();
        const worldMatrix = this.getWorldMatrix();

        if (points.length === 0) {
            const pos = this.position;
            return { minX: pos.x, maxX: pos.x, minY: pos.y, maxY: pos.y };
        }

        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;

        for (const point of points) {
            const transformed = worldMatrix.transformPoint(point);
            if (transformed.x < minX) minX = transformed.x;
            if (transformed.x > maxX) maxX = transformed.x;
            if (transformed.y < minY) minY = transformed.y;
            if (transformed.y > maxY) maxY = transformed.y;
        }

        return { minX, maxX, minY, maxY };
    }
}
