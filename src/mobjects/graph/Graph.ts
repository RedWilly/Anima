import { VGroup } from '../VGroup';
import { Vector2 } from '../../core/math/Vector2/Vector2';
import { GraphNode } from './GraphNode';
import { GraphEdge } from './GraphEdge';
import { circularLayout, treeLayout, forceDirectedLayout } from './layouts';
import type {
    GraphNodeId,
    NodeConfig,
    EdgeConfig,
    LayoutType,
    LayoutConfig
} from './types';

/**
 * A graph structure containing nodes and edges.
 * Manages nodes as VMobjects and edges as BezierPath curves.
 * Supports multiple layout algorithms for automatic positioning.
 */
export class Graph extends VGroup {
    private nodes: Map<GraphNodeId, GraphNode> = new Map();
    private edges: GraphEdge[] = [];

    constructor() {
        super();
    }

    /**
     * Adds a node to the graph.
     * @param id Unique identifier for the node.
     * @param config Optional configuration for the node.
     */
    addNode(id: GraphNodeId, config: NodeConfig = {}): GraphNode {
        if (this.nodes.has(id)) {
            const existing = this.nodes.get(id);
            if (existing) return existing;
        }

        const node = new GraphNode(id, config);
        this.nodes.set(id, node);
        this.add(node);
        return node;
    }

    /**
     * Removes a node and all connected edges from the graph.
     * @param id The node identifier to remove.
     */
    removeNode(id: GraphNodeId): this {
        const node = this.nodes.get(id);
        if (!node) return this;

        // Remove connected edges
        const connectedEdges = this.edges.filter(
            e => e.source === id || e.target === id
        );
        for (const edge of connectedEdges) {
            this.removeEdgeInternal(edge);
        }

        // Remove node
        this.nodes.delete(id);
        this.remove(node);
        return this;
    }

    /**
     * Returns the node VMobject for the given id.
     * @param id The node identifier.
     */
    getNode(id: GraphNodeId): GraphNode | undefined {
        return this.nodes.get(id);
    }

    /**
     * Returns all nodes in the graph.
     */
    getNodes(): GraphNode[] {
        return Array.from(this.nodes.values());
    }

    /**
     * Adds an edge between two nodes.
     * @param sourceId Source node identifier.
     * @param targetId Target node identifier.
     * @param config Optional edge configuration.
     */
    addEdge(
        sourceId: GraphNodeId,
        targetId: GraphNodeId,
        config: EdgeConfig = {}
    ): GraphEdge | undefined {
        const sourceNode = this.nodes.get(sourceId);
        const targetNode = this.nodes.get(targetId);

        if (!sourceNode || !targetNode) {
            return undefined;
        }

        const existing = this.edges.find(
            e => (e.source === sourceId && e.target === targetId) ||
                (e.source === targetId && e.target === sourceId)
        );
        if (existing) return existing;

        const edge = new GraphEdge(sourceNode, targetNode, config);
        this.edges.push(edge);
        this.add(edge);
        return edge;
    }

    /**
     * Removes an edge between two nodes.
     * @param sourceId Source node identifier.
     * @param targetId Target node identifier.
     */
    removeEdge(sourceId: GraphNodeId, targetId: GraphNodeId): this {
        const edge = this.edges.find(
            e => (e.source === sourceId && e.target === targetId) ||
                (e.source === targetId && e.target === sourceId)
        );
        if (edge) {
            this.removeEdgeInternal(edge);
        }
        return this;
    }

    private removeEdgeInternal(edge: GraphEdge): void {
        const index = this.edges.indexOf(edge);
        if (index > -1) {
            this.edges.splice(index, 1);
            this.remove(edge);
        }
    }

    /**
     * Returns the BezierPath for an edge between two nodes.
     * @param sourceId Source node identifier.
     * @param targetId Target node identifier.
     */
    getEdgePath(
        sourceId: GraphNodeId,
        targetId: GraphNodeId
    ): ReturnType<GraphEdge['getPath']> {
        const edge = this.edges.find(
            e => (e.source === sourceId && e.target === targetId) ||
                (e.source === targetId && e.target === sourceId)
        );
        return edge?.getPath();
    }

    /**
     * Returns all edges in the graph.
     */
    getEdges(): GraphEdge[] {
        return [...this.edges];
    }

    /**
     * Applies a layout algorithm to reposition all nodes.
     * @param type The layout algorithm to use.
     * @param config Optional layout configuration.
     */
    layout(type: LayoutType, config: LayoutConfig = {}): this {
        const nodeArray = this.getNodes();
        let positions: Map<string, Vector2>;

        switch (type) {
            case 'circular':
                positions = circularLayout(nodeArray, config);
                break;
            case 'tree':
                positions = treeLayout(nodeArray, this.edges, config);
                break;
            case 'force-directed':
                positions = forceDirectedLayout(nodeArray, this.edges, config);
                break;
            default:
                positions = new Map();
        }

        for (const [id, position] of positions) {
            const node = this.nodes.get(id);
            if (node) {
                node.pos(position.x, position.y);
            }
        }

        this.updateEdges();

        return this;
    }

    /**
     * Updates all edge paths to reflect current node positions.
     */
    updateEdges(): this {
        for (const edge of this.edges) {
            edge.updatePath();
        }
        return this;
    }
}
