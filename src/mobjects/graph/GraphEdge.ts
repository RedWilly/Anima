import { VMobject } from '../VMobject';
import { BezierPath } from '../../core/math/bezier/BezierPath';
import { Vector2 } from '../../core/math/Vector2/Vector2';
import { Color } from '../../core/math/color/Color';
import type { GraphNodeId, EdgeConfig } from './types';
import type { GraphNode } from './GraphNode';

/**
 * A graph edge represented as a BezierPath connecting two nodes.
 * Supports straight or curved edges with customizable styling.
 */
export class GraphEdge extends VMobject {
    readonly source: GraphNodeId;
    readonly target: GraphNodeId;
    private sourceNode: GraphNode;
    private targetNode: GraphNode;
    private curved: boolean;

    constructor(
        sourceNode: GraphNode,
        targetNode: GraphNode,
        config: EdgeConfig = {}
    ) {
        super();
        this.source = sourceNode.id;
        this.target = targetNode.id;
        this.sourceNode = sourceNode;
        this.targetNode = targetNode;
        this.curved = config.curved ?? false;

        // Apply styling
        this.strokeColor = config.strokeColor ?? Color.WHITE;
        this.strokeWidth = config.strokeWidth ?? 2;
        this.fillColor = Color.TRANSPARENT;
        this.fillOpacity = 0;

        this.updatePath();
    }

    /**
     * Recalculates the edge path based on current node positions.
     * Call this when nodes move to update the edge connection.
     */
    updatePath(): void {
        const startPos = this.sourceNode.getCenter();
        const endPos = this.targetNode.getCenter();

        const path = new BezierPath();
        path.moveTo(startPos);

        if (this.curved) {
            // Create a curved path using quadratic Bezier
            const mid = startPos.lerp(endPos, 0.5);
            const direction = endPos.subtract(startPos);
            const perpendicular = new Vector2(-direction.y, direction.x).normalize();
            const curveOffset = direction.length() * 0.2;
            const controlPoint = mid.add(perpendicular.multiply(curveOffset));

            path.quadraticTo(controlPoint, endPos);
        } else {
            // Straight line
            path.lineTo(endPos);
        }

        this.pathList = [path];
    }

    getPath(): BezierPath | undefined {
        return this.pathList[0];
    }

    /**
     * Updates node references (used when nodes are replaced).
     */
    setNodes(sourceNode: GraphNode, targetNode: GraphNode): void {
        this.sourceNode = sourceNode;
        this.targetNode = targetNode;
        this.updatePath();
    }
}
