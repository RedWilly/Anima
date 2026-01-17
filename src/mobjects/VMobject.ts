import { Mobject } from './Mobject';
import { BezierPath } from '../core/math/bezier/BezierPath';
import type { PathCommand } from '../core/math/bezier/types';
import { Color } from '../core/math/color/Color';
import { Vector2 } from '../core/math/Vector2/Vector2';
import { Write, Unwrite, Draw, Create } from '../core/animations/draw';

/**
 * A Mobject that is defined by one or more BezierPaths.
 * Supports stroke and fill styling, plus VMobject-specific fluent animations.
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

    stroke(color: Color, width: number): this {
        this.strokeColor = color;
        this.strokeWidth = width;
        return this;
    }

    fill(color: Color, opacity: number): this {
        this.fillColor = color;
        this.fillOpacity = opacity;
        return this;
    }

    getPoints(): PathCommand[] {
        const commands: PathCommand[] = [];
        for (const path of this.pathList) {
            commands.push(...path.getCommands());
        }
        return commands;
    }

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

    private getPointsAsVectors(): Vector2[] {
        const points: Vector2[] = [];
        for (const cmd of this.getPoints()) {
            if (cmd.control1) points.push(cmd.control1);
            if (cmd.control2) points.push(cmd.control2);
            points.push(cmd.end);
        }
        return points;
    }

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

    // ========== VMobject-Specific Fluent Animation API ==========

    write(durationSeconds?: number): this {
        this.getQueue().enqueue((t: Mobject) => new Write(t as VMobject), durationSeconds);
        return this;
    }

    unwrite(durationSeconds?: number): this {
        this.getQueue().enqueue((t: Mobject) => new Unwrite(t as VMobject), durationSeconds);
        return this;
    }

    draw(durationSeconds?: number): this {
        this.getQueue().enqueue((t: Mobject) => new Draw(t as VMobject), durationSeconds);
        return this;
    }

    create(durationSeconds?: number): this {
        this.getQueue().enqueue((t: Mobject) => new Create(t as VMobject), durationSeconds);
        return this;
    }
}
