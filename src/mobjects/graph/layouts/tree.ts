import { Vector2 } from '../../../core/math/Vector2/Vector2';
import type { GraphNode } from '../GraphNode';
import type { GraphEdge } from '../GraphEdge';
import type { LayoutConfig } from '../types';

const DEFAULT_LEVEL_HEIGHT = 1.5;
const DEFAULT_SIBLING_SPACING = 1.0;

interface TreeNode {
    id: string;
    children: TreeNode[];
    depth: number;
    x: number;
    width: number;
}

/**
 * Builds a tree structure from nodes and edges.
 * Assumes directed edges from parent to child.
 */
function buildTree(
    nodes: GraphNode[],
    edges: GraphEdge[]
): TreeNode | undefined {
    if (nodes.length === 0) return undefined;

    const hasIncoming = new Set<string>();
    for (const edge of edges) {
        hasIncoming.add(edge.target);
    }

    const nodeMap = new Map<string, GraphNode>();
    for (const node of nodes) {
        nodeMap.set(node.id, node);
    }

    // Build adjacency list (parent -> children)
    const childrenMap = new Map<string, string[]>();
    for (const edge of edges) {
        const children = childrenMap.get(edge.source) ?? [];
        children.push(edge.target);
        childrenMap.set(edge.source, children);
    }

    let rootId: string | undefined;
    for (const node of nodes) {
        if (!hasIncoming.has(node.id)) {
            rootId = node.id;
            break;
        }
    }

    if (!rootId && nodes[0]) {
        rootId = nodes[0].id;
    }

    if (!rootId) return undefined;

    // Build tree recursively
    function buildNode(id: string, depth: number): TreeNode {
        const children = (childrenMap.get(id) ?? [])
            .map(childId => buildNode(childId, depth + 1));

        const width = children.length === 0
            ? 1
            : children.reduce((sum, c) => sum + c.width, 0);

        return { id, children, depth, x: 0, width };
    }

    return buildNode(rootId, 0);
}

/**
 * Recursively assigns x positions to tree nodes.
 */
function assignPositions(
    node: TreeNode,
    leftBound: number,
    spacing: number
): void {
    if (node.children.length === 0) {
        node.x = leftBound + node.width * spacing / 2;
        return;
    }

    let currentLeft = leftBound;
    for (const child of node.children) {
        assignPositions(child, currentLeft, spacing);
        currentLeft += child.width * spacing;
    }

    // Center parent over children
    const firstChild = node.children[0];
    const lastChild = node.children[node.children.length - 1];
    if (firstChild && lastChild) {
        node.x = (firstChild.x + lastChild.x) / 2;
    }
}

/**
 * Collects all positions from the tree.
 */
function collectPositions(
    node: TreeNode,
    levelHeight: number,
    positions: Map<string, Vector2>
): void {
    positions.set(node.id, new Vector2(node.x, node.depth * levelHeight));
    for (const child of node.children) {
        collectPositions(child, levelHeight, positions);
    }
}

/**
 * Arranges nodes in a hierarchical tree layout.
 * Assumes edges represent parent-child relationships.
 */
export function treeLayout(
    nodes: GraphNode[],
    edges: GraphEdge[],
    config: LayoutConfig = {}
): Map<string, Vector2> {
    const positions = new Map<string, Vector2>();
    const levelHeight = config.levelHeight ?? DEFAULT_LEVEL_HEIGHT;

    const tree = buildTree(nodes, edges);
    if (!tree) return positions;

    assignPositions(tree, 0, DEFAULT_SIBLING_SPACING);

    collectPositions(tree, levelHeight, positions);

    const allX = Array.from(positions.values()).map(p => p.x);
    const minX = Math.min(...allX);
    const maxX = Math.max(...allX);
    const centerOffset = (minX + maxX) / 2;

    for (const [id, pos] of positions) {
        positions.set(id, new Vector2(pos.x - centerOffset, pos.y));
    }

    return positions;
}
