# Graph

`Graph` is a `VGroup` that manages nodes and edges with layout algorithms. Use it for network diagrams, trees, and structured visualizations.

## Creating a Graph

```ts
import { Graph, Color } from 'anima';

const graph = new Graph();
```

## Adding Nodes

```ts
graph.addNode(id, config?)  // Returns GraphNode (a Circle subclass)
```

`id` is a string. `config` is optional:

```ts
interface NodeConfig {
  position?: { x: number; y: number };
  radius?: number;         // default: circle default
  strokeColor?: Color;
  strokeWidth?: number;
  fillColor?: Color;
  fillOpacity?: number;
}
```

Example:

```ts
graph.addNode('A', {
  radius: 0.4,
  fillColor: Color.fromHex('#FF6B6B'),
  fillOpacity: 0.8,
  strokeColor: Color.WHITE,
  strokeWidth: 3
});
graph.addNode('B', { radius: 0.3, fillColor: Color.BLUE, fillOpacity: 1 });
```

## Adding Edges

```ts
graph.addEdge(sourceId, targetId, config?)  // Returns GraphEdge or undefined
```

Both nodes must exist. `config` is optional:

```ts
interface EdgeConfig {
  strokeColor?: Color;
  strokeWidth?: number;
  curved?: boolean;       // curved edge
}
```

Example:

```ts
graph.addEdge('A', 'B', { strokeColor: Color.WHITE, strokeWidth: 2 });
graph.addEdge('B', 'C', { curved: true, strokeColor: Color.YELLOW });
```

## Removing Nodes and Edges

```ts
graph.removeNode('A');         // Also removes all connected edges
graph.removeEdge('A', 'B');    // Remove specific edge
```

## Querying

```ts
graph.getNode('A')          // GraphNode | undefined
graph.getNodes()            // GraphNode[]
graph.getEdges()            // GraphEdge[]
graph.getEdgePath('A', 'B') // BezierPath of the edge
```

## Layout Algorithms

```ts
graph.layout(type, config?)
```

### Circular

Arranges nodes in a circle:

```ts
graph.layout('circular', {
  radius: 2     // circle radius in world units
});
```

### Tree

Hierarchical top-down tree:

```ts
graph.layout('tree', {
  levelHeight: 1.5,      // vertical spacing between levels
  siblingSpacing: 1.0     // horizontal spacing between siblings
});
```

### Force-Directed

Physics simulation for organic layouts:

```ts
graph.layout('force-directed', {
  iterations: 100,        // simulation steps (default varies)
  springLength: 2,        // ideal edge length
  repulsion: 1.5,         // node repulsion force
  attraction: 0.08,       // edge attraction force
  damping: undefined,     // velocity damping
  minDistance: undefined   // minimum node distance
});
```

## Manual Positioning

Position nodes manually and call `updateEdges()` to recalculate edge paths:

```ts
const nodeA = graph.getNode('A');
const nodeB = graph.getNode('B');
if (nodeA) nodeA.pos(0, 0);
if (nodeB) nodeB.pos(3, 2);

graph.updateEdges();  // REQUIRED after manual positioning
```

## Animating Graphs

Since `Graph` extends `VGroup`, it supports all animations:

```ts
this.play(new FadeIn(graph).duration(1).ease(easeOutBack));
this.play(new Rotate(graph, Math.PI * 2).duration(3));

// Pulse effect
this.play(new Scale(graph, 1.2).duration(0.4));
this.play(new Scale(graph, 1 / 1.2).duration(0.4));

this.play(new FadeOut(graph).duration(1));
```

## Full Example

```ts
const graph = new Graph();

graph.addNode('root', { radius: 0.4, fillColor: Color.fromHex('#9370DB'), fillOpacity: 0.9 });
graph.addNode('child1', { radius: 0.3, fillColor: Color.fromHex('#F4A460'), fillOpacity: 0.8 });
graph.addNode('child2', { radius: 0.3, fillColor: Color.fromHex('#87CEEB'), fillOpacity: 0.8 });

graph.addEdge('root', 'child1', { strokeColor: Color.WHITE, strokeWidth: 2 });
graph.addEdge('root', 'child2', { strokeColor: Color.WHITE, strokeWidth: 2 });

graph.layout('tree', { levelHeight: 2, siblingSpacing: 1.5 });

this.play(new FadeIn(graph).duration(1));
```
