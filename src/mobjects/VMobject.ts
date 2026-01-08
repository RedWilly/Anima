import { Mobject } from './Mobject';
import { BezierPath } from '../core/math/bezier/BezierPath';
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
     * Returns a flat array of all points (anchors and controls) in the paths.
     * This captures the geometry of the paths.
     */
    getPoints(): Vector2[] {
        const points: Vector2[] = [];
        for (const path of this.pathList) {
            for (const cmd of path.getCommands()) {
                if (cmd.type === 'Move') {
                    points.push(cmd.end);
                } else if (cmd.type === 'Line') {
                    points.push(cmd.end);
                } else if (cmd.type === 'Quadratic') {
                    if (cmd.control1) points.push(cmd.control1);
                    points.push(cmd.end);
                } else if (cmd.type === 'Cubic') {
                    if (cmd.control1) points.push(cmd.control1);
                    if (cmd.control2) points.push(cmd.control2);
                    points.push(cmd.end);
                } else if (cmd.type === 'Close') {
                    points.push(cmd.end);
                }
            }
        }
        return points;
    }

    /**
     * Sets the points of the VMobject. 
     * This implementation creates a single path connecting the points with lines (polyline).
     * @param points The array of points to connect.
     */
    setPoints(points: Vector2[]): this {
        if (points.length === 0) {
            this.pathList = [];
            return this;
        }

        const path = new BezierPath();
        path.moveTo(points[0]!);

        for (let i = 1; i < points.length; i++) {
            path.lineTo(points[i]!);
        }

        this.pathList = [path];
        return this;
    }

    /**
     * Returns the axis-aligned bounding box of the VMobject in world space.
     */
    getBoundingBox(): { minX: number; maxX: number; minY: number; maxY: number } {
        const points = this.getPoints();
        if (points.length === 0) {
            const pos = this.position;
            return { minX: pos.x, maxX: pos.x, minY: pos.y, maxY: pos.y };
        }

        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;

        for (const point of points) {
            const transformed = this.transformMatrix.transformPoint(point);
            if (transformed.x < minX) minX = transformed.x;
            if (transformed.x > maxX) maxX = transformed.x;
            if (transformed.y < minY) minY = transformed.y;
            if (transformed.y > maxY) maxY = transformed.y;
        }

        return { minX, maxX, minY, maxY };
    }
}
