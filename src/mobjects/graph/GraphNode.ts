import { VMobject } from '../VMobject';
import { BezierPath } from '../../core/math/bezier/BezierPath';
import { Vector2 } from '../../core/math/Vector2/Vector2';
import { Color } from '../../core/math/color/Color';
import type { GraphNodeId, NodeConfig } from './types';

const DEFAULT_RADIUS = 0.25;

/**
 * A graph node represented as a circular VMobject.
 * Supports customizable radius, stroke, and fill styling.
 */
export class GraphNode extends VMobject {
    readonly id: GraphNodeId;
    private nodeRadius: number;

    constructor(id: GraphNodeId, config: NodeConfig = {}) {
        super();
        this.id = id;
        this.nodeRadius = config.radius ?? DEFAULT_RADIUS;

        // Apply initial position
        if (config.position) {
            this.pos(config.position.x, config.position.y);
        }

        // Apply styling
        this.strokeColor = config.strokeColor ?? Color.WHITE;
        this.strokeWidth = config.strokeWidth ?? 2;
        this.fillColor = config.fillColor ?? Color.TRANSPARENT;
        this.fillOpacity = config.fillOpacity ?? 0;

        this.generateCirclePath();
    }

    get radius(): number {
        return this.nodeRadius;
    }

    /**
     * Generates a circular BezierPath approximation using cubic Bezier curves.
     * Uses the standard 4-point circle approximation with control point factor ~0.5523.
     */
    private generateCirclePath(): void {
        const path = new BezierPath();
        const r = this.nodeRadius;
        const k = 0.5522847498; // Magic number for circle approximation

        // Start at the right-most point
        path.moveTo(new Vector2(r, 0));

        // Top-right quadrant
        path.cubicTo(
            new Vector2(r, r * k),
            new Vector2(r * k, r),
            new Vector2(0, r)
        );

        // Top-left quadrant
        path.cubicTo(
            new Vector2(-r * k, r),
            new Vector2(-r, r * k),
            new Vector2(-r, 0)
        );

        // Bottom-left quadrant
        path.cubicTo(
            new Vector2(-r, -r * k),
            new Vector2(-r * k, -r),
            new Vector2(0, -r)
        );

        // Bottom-right quadrant
        path.cubicTo(
            new Vector2(r * k, -r),
            new Vector2(r, -r * k),
            new Vector2(r, 0)
        );

        path.closePath();
        this.pathList = [path];
    }

    getCenter(): Vector2 {
        return this.position;
    }
}
