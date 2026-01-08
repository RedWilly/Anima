import { describe, test, expect } from 'bun:test';
import * as fc from 'fast-check';
import { Graph } from '../../src/mobjects/graph/Graph';
import { Vector2 } from '../../src/core/math/Vector2/Vector2';

/** Generates a valid node ID string. */
const nodeIdArb = fc.stringMatching(/^[a-z][a-z0-9]{0,4}$/);

/** Generates a list of unique node IDs. */
const uniqueNodeIdsArb = fc.uniqueArray(nodeIdArb, { minLength: 1, maxLength: 10 });

describe('Graph Property Tests', () => {
    describe('Node Management Properties', () => {
        test('addNode then getNode returns the same node', () => {
            fc.assert(fc.property(
                nodeIdArb,
                (id) => {
                    const graph = new Graph();
                    const node = graph.addNode(id);
                    return graph.getNode(id) === node;
                }
            ));
        });

        test('addNode is idempotent - adding same id twice returns same node', () => {
            fc.assert(fc.property(
                nodeIdArb,
                (id) => {
                    const graph = new Graph();
                    const node1 = graph.addNode(id);
                    const node2 = graph.addNode(id);
                    return node1 === node2 && graph.getNodes().length === 1;
                }
            ));
        });

        test('removeNode then getNode returns undefined', () => {
            fc.assert(fc.property(
                nodeIdArb,
                (id) => {
                    const graph = new Graph();
                    graph.addNode(id);
                    graph.removeNode(id);
                    return graph.getNode(id) === undefined;
                }
            ));
        });

        test('getNodes length equals number of unique added nodes', () => {
            fc.assert(fc.property(
                uniqueNodeIdsArb,
                (ids) => {
                    const graph = new Graph();
                    for (const id of ids) {
                        graph.addNode(id);
                    }
                    return graph.getNodes().length === ids.length;
                }
            ));
        });

        test('node position matches config position', () => {
            fc.assert(fc.property(
                nodeIdArb,
                fc.double({ min: -100, max: 100, noNaN: true }),
                fc.double({ min: -100, max: 100, noNaN: true }),
                (id, x, y) => {
                    const graph = new Graph();
                    const node = graph.addNode(id, { position: new Vector2(x, y) });
                    return Math.abs(node.position.x - x) < 1e-6 &&
                        Math.abs(node.position.y - y) < 1e-6;
                }
            ));
        });
    });

    describe('Edge Management Properties', () => {
        test('addEdge creates edge between existing nodes', () => {
            fc.assert(fc.property(
                nodeIdArb,
                nodeIdArb.filter(id => id.length > 0),
                (id1, id2) => {
                    if (id1 === id2) return true; // Skip same-node edges
                    const graph = new Graph();
                    graph.addNode(id1);
                    graph.addNode(id2);
                    const edge = graph.addEdge(id1, id2);
                    return edge !== undefined &&
                        edge.source === id1 &&
                        edge.target === id2;
                }
            ));
        });

        test('addEdge is idempotent - adding same edge twice returns same edge', () => {
            fc.assert(fc.property(
                nodeIdArb,
                nodeIdArb.filter(id => id.length > 0),
                (id1, id2) => {
                    if (id1 === id2) return true;
                    const graph = new Graph();
                    graph.addNode(id1);
                    graph.addNode(id2);
                    const edge1 = graph.addEdge(id1, id2);
                    const edge2 = graph.addEdge(id1, id2);
                    return edge1 === edge2 && graph.getEdges().length === 1;
                }
            ));
        });

        test('addEdge returns undefined for non-existent source', () => {
            fc.assert(fc.property(
                nodeIdArb,
                nodeIdArb,
                (id1, id2) => {
                    const graph = new Graph();
                    graph.addNode(id2); // Only add target
                    const edge = graph.addEdge(id1, id2);
                    return edge === undefined;
                }
            ));
        });

        test('removeNode removes all connected edges', () => {
            fc.assert(fc.property(
                uniqueNodeIdsArb.filter(ids => ids.length >= 3),
                (ids) => {
                    const graph = new Graph();
                    for (const id of ids) {
                        graph.addNode(id);
                    }
                    // Connect first node to all others
                    const hub = ids[0]!;
                    for (let i = 1; i < ids.length; i++) {
                        graph.addEdge(hub, ids[i]!);
                    }
                    const edgesBefore = graph.getEdges().length;
                    graph.removeNode(hub);
                    const edgesAfter = graph.getEdges().length;
                    return edgesBefore === ids.length - 1 && edgesAfter === 0;
                }
            ));
        });

        test('getEdgePath returns valid path for existing edge', () => {
            fc.assert(fc.property(
                nodeIdArb,
                nodeIdArb.filter(id => id.length > 0),
                fc.double({ min: -50, max: 50, noNaN: true }),
                fc.double({ min: -50, max: 50, noNaN: true }),
                (id1, id2, x, y) => {
                    if (id1 === id2) return true;
                    const graph = new Graph();
                    graph.addNode(id1, { position: new Vector2(0, 0) });
                    graph.addNode(id2, { position: new Vector2(x, y) });
                    graph.addEdge(id1, id2);
                    const path = graph.getEdgePath(id1, id2);
                    return path !== undefined && path.getCommands().length > 0;
                }
            ));
        });
    });

    describe('Layout Properties', () => {
        test('circular layout places all nodes at equal distance from center', () => {
            fc.assert(fc.property(
                uniqueNodeIdsArb.filter(ids => ids.length >= 2),
                fc.double({ min: 1, max: 10, noNaN: true }),
                (ids, radius) => {
                    const graph = new Graph();
                    for (const id of ids) {
                        graph.addNode(id);
                    }
                    graph.layout('circular', { radius });

                    const distances = graph.getNodes().map(n => n.position.length());
                    const allSameDistance = distances.every(d =>
                        Math.abs(d - radius) < 0.01
                    );
                    return allSameDistance;
                }
            ));
        });

        test('layout updates edge paths to connect current node positions', () => {
            fc.assert(fc.property(
                fc.double({ min: 2, max: 8, noNaN: true }),
                (radius) => {
                    const graph = new Graph();
                    graph.addNode('a');
                    graph.addNode('b');
                    graph.addEdge('a', 'b');
                    graph.layout('circular', { radius });

                    const nodeA = graph.getNode('a')!;
                    const nodeB = graph.getNode('b')!;
                    const path = graph.getEdgePath('a', 'b')!;

                    const pathStart = path.getPointAt(0);
                    const pathEnd = path.getPointAt(1);

                    return Math.abs(pathStart.x - nodeA.position.x) < 0.01 &&
                        Math.abs(pathStart.y - nodeA.position.y) < 0.01 &&
                        Math.abs(pathEnd.x - nodeB.position.x) < 0.01 &&
                        Math.abs(pathEnd.y - nodeB.position.y) < 0.01;
                }
            ));
        });

        test('force-directed layout separates initially overlapping nodes', () => {
            fc.assert(fc.property(
                uniqueNodeIdsArb.filter(ids => ids.length >= 2 && ids.length <= 5),
                (ids) => {
                    const graph = new Graph();
                    // Place all nodes at origin
                    for (const id of ids) {
                        graph.addNode(id, { position: new Vector2(0, 0) });
                    }

                    graph.layout('force-directed', { iterations: 20, repulsion: 1 });

                    // Check that nodes have spread out
                    const nodes = graph.getNodes();
                    if (nodes.length < 2) return true;

                    let minDistance = Infinity;
                    for (let i = 0; i < nodes.length; i++) {
                        for (let j = i + 1; j < nodes.length; j++) {
                            const dist = nodes[i]!.position.subtract(nodes[j]!.position).length();
                            if (dist < minDistance) minDistance = dist;
                        }
                    }
                    // Nodes should have separated
                    return minDistance > 0.1;
                }
            ));
        });
    });

    describe('Graph Invariants', () => {
        test('graph children count equals nodes + edges', () => {
            fc.assert(fc.property(
                uniqueNodeIdsArb.filter(ids => ids.length >= 2),
                (ids) => {
                    const graph = new Graph();
                    for (const id of ids) {
                        graph.addNode(id);
                    }
                    // Add some edges
                    for (let i = 0; i < ids.length - 1; i++) {
                        graph.addEdge(ids[i]!, ids[i + 1]!);
                    }

                    const nodeCount = graph.getNodes().length;
                    const edgeCount = graph.getEdges().length;
                    const childCount = graph.getChildren().length;

                    return childCount === nodeCount + edgeCount;
                }
            ));
        });

        test('empty graph layout operations do not throw', () => {
            fc.assert(fc.property(
                fc.constantFrom('circular', 'tree', 'force-directed') as fc.Arbitrary<'circular' | 'tree' | 'force-directed'>,
                (layoutType) => {
                    const graph = new Graph();
                    try {
                        graph.layout(layoutType);
                        return true;
                    } catch {
                        return false;
                    }
                }
            ));
        });
    });
});
