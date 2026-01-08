import { describe, test, expect } from 'bun:test';
import { Graph } from '../../../../src/mobjects/graph/Graph';
import { Vector2 } from '../../../../src/core/math/Vector2/Vector2';
import { Color } from '../../../../src/core/math/color/Color';

describe('Graph', () => {
    describe('Node Management', () => {
        test('addNode adds a node to the graph', () => {
            const graph = new Graph();
            const node = graph.addNode('A');

            expect(node.id).toBe('A');
            expect(graph.getNode('A')).toBe(node);
            expect(graph.getNodes()).toHaveLength(1);
        });

        test('addNode with position sets node position', () => {
            const graph = new Graph();
            const node = graph.addNode('A', { position: new Vector2(10, 20) });

            expect(node.position.x).toBeCloseTo(10);
            expect(node.position.y).toBeCloseTo(20);
        });

        test('addNode does not duplicate existing node', () => {
            const graph = new Graph();
            const node1 = graph.addNode('A');
            const node2 = graph.addNode('A');

            expect(node1).toBe(node2);
            expect(graph.getNodes()).toHaveLength(1);
        });

        test('removeNode removes node from graph', () => {
            const graph = new Graph();
            graph.addNode('A');
            graph.addNode('B');

            graph.removeNode('A');

            expect(graph.getNode('A')).toBeUndefined();
            expect(graph.getNodes()).toHaveLength(1);
        });

        test('removeNode removes connected edges', () => {
            const graph = new Graph();
            graph.addNode('A');
            graph.addNode('B');
            graph.addNode('C');
            graph.addEdge('A', 'B');
            graph.addEdge('A', 'C');

            graph.removeNode('A');

            expect(graph.getEdges()).toHaveLength(0);
        });

        test('getNode returns undefined for non-existent node', () => {
            const graph = new Graph();
            expect(graph.getNode('nonexistent')).toBeUndefined();
        });
    });

    describe('Edge Management', () => {
        test('addEdge connects two nodes', () => {
            const graph = new Graph();
            graph.addNode('A');
            graph.addNode('B');

            const edge = graph.addEdge('A', 'B');

            expect(edge).toBeDefined();
            expect(edge?.source).toBe('A');
            expect(edge?.target).toBe('B');
            expect(graph.getEdges()).toHaveLength(1);
        });

        test('addEdge returns undefined for non-existent nodes', () => {
            const graph = new Graph();
            graph.addNode('A');

            const edge = graph.addEdge('A', 'B');

            expect(edge).toBeUndefined();
        });

        test('addEdge does not duplicate existing edge', () => {
            const graph = new Graph();
            graph.addNode('A');
            graph.addNode('B');

            const edge1 = graph.addEdge('A', 'B');
            const edge2 = graph.addEdge('A', 'B');

            expect(edge1).toBe(edge2);
            expect(graph.getEdges()).toHaveLength(1);
        });

        test('removeEdge removes edge from graph', () => {
            const graph = new Graph();
            graph.addNode('A');
            graph.addNode('B');
            graph.addEdge('A', 'B');

            graph.removeEdge('A', 'B');

            expect(graph.getEdges()).toHaveLength(0);
        });

        test('getEdgePath returns BezierPath for edge', () => {
            const graph = new Graph();
            graph.addNode('A', { position: new Vector2(0, 0) });
            graph.addNode('B', { position: new Vector2(10, 0) });
            graph.addEdge('A', 'B');

            const path = graph.getEdgePath('A', 'B');

            expect(path).toBeDefined();
            expect(path?.getPointAt(0).x).toBeCloseTo(0);
            expect(path?.getPointAt(1).x).toBeCloseTo(10);
        });
    });

    describe('Node Styling', () => {
        test('node inherits VMobject styling', () => {
            const graph = new Graph();
            const node = graph.addNode('A', {
                strokeColor: Color.RED,
                strokeWidth: 3,
                fillColor: Color.BLUE,
                fillOpacity: 0.5
            });

            expect(node.strokeColor).toBe(Color.RED);
            expect(node.strokeWidth).toBe(3);
            expect(node.fillColor).toBe(Color.BLUE);
            expect(node.fillOpacity).toBe(0.5);
        });

        test('node stroke and fill can be changed', () => {
            const graph = new Graph();
            const node = graph.addNode('A');

            node.stroke(Color.GREEN, 5);
            node.fill(Color.YELLOW, 0.8);

            expect(node.strokeColor).toBe(Color.GREEN);
            expect(node.strokeWidth).toBe(5);
            expect(node.fillColor).toBe(Color.YELLOW);
            expect(node.fillOpacity).toBe(0.8);
        });
    });

    describe('Edge as BezierPath', () => {
        test('edge has BezierPath', () => {
            const graph = new Graph();
            graph.addNode('A');
            graph.addNode('B');
            const edge = graph.addEdge('A', 'B');

            const path = edge?.getPath();

            expect(path).toBeDefined();
            expect(path?.getCommands().length).toBeGreaterThan(0);
        });

        test('edge can be styled independently', () => {
            const graph = new Graph();
            graph.addNode('A');
            graph.addNode('B');
            const edge = graph.addEdge('A', 'B', {
                strokeColor: Color.RED,
                strokeWidth: 4
            });

            expect(edge?.strokeColor).toBe(Color.RED);
            expect(edge?.strokeWidth).toBe(4);
        });

        test('curved edge creates quadratic bezier', () => {
            const graph = new Graph();
            graph.addNode('A', { position: new Vector2(0, 0) });
            graph.addNode('B', { position: new Vector2(10, 0) });
            const edge = graph.addEdge('A', 'B', { curved: true });

            const path = edge?.getPath();
            const commands = path?.getCommands();

            // Should have Move and Quadratic commands
            expect(commands?.some(c => c.type === 'Quadratic')).toBe(true);
        });
    });

    describe('Layout Algorithms', () => {
        test('circular layout positions nodes in circle', () => {
            const graph = new Graph();
            graph.addNode('A');
            graph.addNode('B');
            graph.addNode('C');
            graph.addNode('D');

            graph.layout('circular', { radius: 5 });

            // All nodes should be at approximately radius 5 from center
            for (const node of graph.getNodes()) {
                const distance = node.position.length();
                expect(distance).toBeCloseTo(5, 1);
            }
        });

        test('tree layout positions nodes hierarchically', () => {
            const graph = new Graph();
            graph.addNode('root');
            graph.addNode('child1');
            graph.addNode('child2');
            graph.addEdge('root', 'child1');
            graph.addEdge('root', 'child2');

            graph.layout('tree', { levelHeight: 2 });

            const root = graph.getNode('root');
            const child1 = graph.getNode('child1');
            const child2 = graph.getNode('child2');

            // Children should be below root (larger y)
            expect(child1!.position.y).toBeGreaterThan(root!.position.y);
            expect(child2!.position.y).toBeGreaterThan(root!.position.y);
        });

        test('force-directed layout repositions nodes', () => {
            const graph = new Graph();
            graph.addNode('A', { position: new Vector2(0, 0) });
            graph.addNode('B', { position: new Vector2(0, 0) });
            graph.addNode('C', { position: new Vector2(0, 0) });

            const initialPositions = graph.getNodes().map(n => n.position);

            graph.layout('force-directed', { iterations: 10 });

            // Nodes should have spread apart
            const finalPositions = graph.getNodes().map(n => n.position);
            const positionsChanged = finalPositions.some((pos, i) => {
                const initial = initialPositions[i];
                return initial && !pos.equals(initial);
            });

            expect(positionsChanged).toBe(true);
        });

        test('layout updates edge paths', () => {
            const graph = new Graph();
            graph.addNode('A', { position: new Vector2(0, 0) });
            graph.addNode('B', { position: new Vector2(1, 0) });
            graph.addEdge('A', 'B');

            graph.layout('circular', { radius: 5 });

            const path = graph.getEdgePath('A', 'B');
            const start = path?.getPointAt(0);
            const end = path?.getPointAt(1);

            // Edge should connect to new node positions
            const nodeA = graph.getNode('A');
            const nodeB = graph.getNode('B');
            expect(start?.x).toBeCloseTo(nodeA!.position.x);
            expect(end?.x).toBeCloseTo(nodeB!.position.x);
        });
    });

    describe('Empty Graph', () => {
        test('empty graph operations do not throw', () => {
            const graph = new Graph();

            expect(() => graph.layout('circular')).not.toThrow();
            expect(() => graph.removeNode('nonexistent')).not.toThrow();
            expect(() => graph.removeEdge('a', 'b')).not.toThrow();
        });
    });
});
