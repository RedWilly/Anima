import { Vector2 } from '../../../core/math/Vector2/Vector2';
import type { GraphNode } from '../GraphNode';
import type { GraphEdge } from '../GraphEdge';
import type { LayoutConfig } from '../types';

const DEFAULT_ITERATIONS = 50;
const DEFAULT_SPRING_LENGTH = 1.5;
const DEFAULT_REPULSION = 1.0;
const DEFAULT_ATTRACTION = 0.1;
const DAMPING = 0.85;
const MIN_DISTANCE = 0.01;

interface NodeState {
    position: Vector2;
    velocity: Vector2;
}

/**
 * Applies force-directed layout using spring simulation.
 * Nodes repel each other while edges act as springs.
 */
export function forceDirectedLayout(
    nodes: GraphNode[],
    edges: GraphEdge[],
    config: LayoutConfig = {}
): Map<string, Vector2> {
    const positions = new Map<string, Vector2>();
    const iterations = config.iterations ?? DEFAULT_ITERATIONS;
    const springLength = config.springLength ?? DEFAULT_SPRING_LENGTH;
    const repulsion = config.repulsion ?? DEFAULT_REPULSION;

    if (nodes.length === 0) return positions;

    // Initialize node states with current positions or random
    const states = new Map<string, NodeState>();
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node) {
            // Start with a circular distribution to avoid overlap
            const angle = (2 * Math.PI * i) / nodes.length;
            const initialPos = new Vector2(
                Math.cos(angle) * 2,
                Math.sin(angle) * 2
            );
            states.set(node.id, {
                position: initialPos,
                velocity: Vector2.ZERO
            });
        }
    }

    // Build edge lookup
    const edgeSet = new Set<string>();
    for (const edge of edges) {
        edgeSet.add(`${edge.source}-${edge.target}`);
        edgeSet.add(`${edge.target}-${edge.source}`);
    }

    // Run simulation
    for (let iter = 0; iter < iterations; iter++) {
        const forces = new Map<string, Vector2>();

        // Initialize forces
        for (const node of nodes) {
            forces.set(node.id, Vector2.ZERO);
        }

        // Calculate repulsion forces between all node pairs
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const nodeA = nodes[i];
                const nodeB = nodes[j];
                if (!nodeA || !nodeB) continue;

                const stateA = states.get(nodeA.id);
                const stateB = states.get(nodeB.id);
                if (!stateA || !stateB) continue;

                const delta = stateA.position.subtract(stateB.position);
                const distance = Math.max(delta.length(), MIN_DISTANCE);
                const force = delta.normalize().multiply(repulsion / (distance * distance));

                const forceA = forces.get(nodeA.id) ?? Vector2.ZERO;
                const forceB = forces.get(nodeB.id) ?? Vector2.ZERO;
                forces.set(nodeA.id, forceA.add(force));
                forces.set(nodeB.id, forceB.subtract(force));
            }
        }

        // Calculate attraction forces along edges
        for (const edge of edges) {
            const stateA = states.get(edge.source);
            const stateB = states.get(edge.target);
            if (!stateA || !stateB) continue;

            const delta = stateB.position.subtract(stateA.position);
            const distance = delta.length();
            const displacement = distance - springLength;
            const force = delta.normalize().multiply(displacement * DEFAULT_ATTRACTION);

            const forceA = forces.get(edge.source) ?? Vector2.ZERO;
            const forceB = forces.get(edge.target) ?? Vector2.ZERO;
            forces.set(edge.source, forceA.add(force));
            forces.set(edge.target, forceB.subtract(force));
        }

        // Apply forces and update positions
        for (const node of nodes) {
            const state = states.get(node.id);
            const force = forces.get(node.id);
            if (!state || !force) continue;

            state.velocity = state.velocity.add(force).multiply(DAMPING);
            state.position = state.position.add(state.velocity);
        }
    }

    // Collect final positions
    for (const node of nodes) {
        const state = states.get(node.id);
        if (state) {
            positions.set(node.id, state.position);
        }
    }

    return positions;
}
