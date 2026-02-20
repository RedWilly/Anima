import { Mobject } from './Mobject';
import { hashNumber, hashString, hashCompose } from '../core/cache/Hashable';
import type { Animation } from '../core/animations/Animation';
import { BezierPath } from '../core/math/bezier/BezierPath';
import type { PathCommand } from '../core/math/bezier/types';
import { Color } from '../core/math/color/Color';
import { Vector2 } from '../core/math/Vector2/Vector2';
import { Write, Unwrite, Draw } from '../core/animations/draw';

/**
 * A Mobject that is defined by one or more BezierPaths.
 * Supports stroke and fill styling, plus VMobject-specific fluent animations.
 *
 * Default behavior: visible with white stroke, no fill.
 * - Stroke: white, width 2 (visible by default)
 * - Fill: not rendered by default (fillOpacity = 0)
 *
 * When .fill(color) is called, the default stroke is disabled unless
 * .stroke(color, width) was called explicitly.
 *
 * Use .stroke(color, width) to add a stroke.
 * Use .fill(color) to add a fill (opacity defaults to 1).
 */
export class VMobject extends Mobject {
    protected pathList: BezierPath[] = [];

    /** Stroke color. Only rendered if strokeWidth > 0. */
    protected strokeColor: Color = Color.WHITE;
    /** Stroke width. Default 2 for visibility. */
    protected strokeWidth: number = 2;
    /** Fill color. Only rendered if fillOpacity > 0. */
    protected fillColor: Color = Color.TRANSPARENT;
    /** Fill opacity. Default 0 means no fill is rendered. */
    protected fillOpacity: number = 0;
    /** Tracks whether stroke() was explicitly called. */
    protected strokeExplicitlySet: boolean = false;

    constructor() {
        super();
    }

    get paths(): BezierPath[] {
        return this.pathList;
    }

    set paths(value: BezierPath[]) {
        this.pathList = value;
    }

    /**
     * Gets the stroke color.
     */
    getStrokeColor(): Color {
        return this.strokeColor;
    }

    /**
     * Gets the stroke width.
     */
    getStrokeWidth(): number {
        return this.strokeWidth;
    }

    /**
     * Gets the fill color.
     */
    getFillColor(): Color {
        return this.fillColor;
    }

    /**
     * Gets the fill opacity.
     */
    getFillOpacity(): number {
        return this.fillOpacity;
    }

    /**
     * Adds a new path to the VMobject.
     * @param path - The BezierPath to add.
     * @returns this for chaining.
     */
    addPath(path: BezierPath): this {
        this.pathList.push(path);
        return this;
    }

    /**
     * Sets the stroke color and width.
     * @param color - The stroke color.
     * @param width - The stroke width. Default is 2.
     * @returns this for chaining.
     */
    stroke(color: Color, width: number = 2): this {
        this.strokeColor = color;
        this.strokeWidth = width;
        this.strokeExplicitlySet = true;
        return this;
    }

    /**
     * Sets the fill color and opacity.
     * If stroke was not explicitly set, the default stroke is disabled.
     * @param color - The fill color.
     * @param opacity - The fill opacity. Defaults to the color's alpha value.
     * @returns this for chaining.
     */
    fill(color: Color, opacity?: number): this {
        this.fillColor = color;
        this.fillOpacity = opacity ?? color.a;
        // Disable default stroke when fill is set (unless stroke was explicitly set)
        if (!this.strokeExplicitlySet) {
            this.strokeWidth = 0;
        }
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

    /**
     * Progressively draws the VMobject's paths from start to end.
     * Preserves fill throughout the animation.
     * @param durationSeconds - Animation duration in seconds.
     * @returns this for chaining.
     */
    write(durationSeconds?: number): this & { toAnimation(): Animation<Mobject> } {
        const animation = new Write(this);
        if (durationSeconds !== undefined) {
            animation.duration(durationSeconds);
        }
        this.getQueue().enqueueAnimation(animation);
        return this;
    }

    /**
     * Progressively removes the VMobject's paths (reverse of write).
     * @param durationSeconds - Animation duration in seconds.
     * @returns this for chaining.
     */
    unwrite(durationSeconds?: number): this & { toAnimation(): Animation<Mobject> } {
        const animation = new Unwrite(this);
        if (durationSeconds !== undefined) {
            animation.duration(durationSeconds);
        }
        this.getQueue().enqueueAnimation(animation);
        return this;
    }

    /**
     * First draws the stroke progressively (0-50%), then fades in the fill (50-100%).
     * @param durationSeconds - Animation duration in seconds.
     * @returns this for chaining.
     */
    draw(durationSeconds?: number): this & { toAnimation(): Animation<Mobject> } {
        const animation = new Draw(this);
        if (durationSeconds !== undefined) {
            animation.duration(durationSeconds);
        }
        this.getQueue().enqueueAnimation(animation);
        return this;
    }

    /**
     * Extends parent hash with VMobject-specific state:
     * stroke/fill colors, widths, opacity, and path geometry.
     */
    override computeHash(): number {
        const parentHash = super.computeHash();
        const pathHash = hashString(
            this.pathList.map(p =>
                p.getCommands().map(c =>
                    `${c.type}:${c.end.x},${c.end.y}` +
                    (c.control1 ? `:${c.control1.x},${c.control1.y}` : '') +
                    (c.control2 ? `:${c.control2.x},${c.control2.y}` : '')
                ).join('|')
            ).join('||'),
        );
        return hashCompose(
            parentHash,
            hashNumber(this.strokeColor.r),
            hashNumber(this.strokeColor.g),
            hashNumber(this.strokeColor.b),
            hashNumber(this.strokeColor.a),
            hashNumber(this.strokeWidth),
            hashNumber(this.fillColor.r),
            hashNumber(this.fillColor.g),
            hashNumber(this.fillColor.b),
            hashNumber(this.fillColor.a),
            hashNumber(this.fillOpacity),
            pathHash,
        );
    }
}
