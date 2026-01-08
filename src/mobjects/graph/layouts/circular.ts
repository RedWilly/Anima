import { Vector2 } from '../../../core/math/Vector2/Vector2';
import type { GraphNode } from '../GraphNode';
import type { LayoutConfig } from '../types';

const DEFAULT_RADIUS = 3;

/**
 * Arranges nodes in a circular layout.
 * Nodes are evenly distributed around a circle of the specified radius.
 */
export function circularLayout(
    nodes: GraphNode[],
    config: LayoutConfig = {}
): Map<string, Vector2> {
    const positions = new Map<string, Vector2>();
    const radius = config.radius ?? DEFAULT_RADIUS;
    const count = nodes.length;

    if (count === 0) return positions;

    for (let i = 0; i < count; i++) {
        const angle = (2 * Math.PI * i) / count - Math.PI / 2; // Start from top
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        const node = nodes[i];
        if (node) {
            positions.set(node.id, new Vector2(x, y));
        }
    }

    return positions;
}
