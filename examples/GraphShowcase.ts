/**
 * Graph Showcase: Three Creative Graph Examples
 * 
 * Scene 1: Social Network - Force-directed layout with node interactions
 * Scene 2: File System Tree - Hierarchical tree layout
 * Scene 3: Molecule Viewer - Circular layout with animated bonds
 */
import {
    Scene,
    Graph,
    Color,
    FadeIn,
    FadeOut,
    Scale,
    Rotate,
    easeInOutQuad,
    easeOutBack
} from '../src/index';

// ============================================================================
// Scene 1: Social Network Visualization
// ============================================================================
export class SocialNetworkScene extends Scene {
    constructor() {
        super({ width: 1920, height: 1080, frameRate: 60 });

        const graph = new Graph();

        // Add people as nodes with different colors for groups
        const groupA = Color.fromHex('#FF6B6B'); // Red group
        const groupB = Color.fromHex('#4ECDC4'); // Teal group
        const groupC = Color.fromHex('#FFE66D'); // Yellow group

        // Group A - Close friends
        graph.addNode('Alice', { position: { x: 0, y: 0 }, radius: 0.4, fillColor: groupA, fillOpacity: 0.8, strokeColor: Color.WHITE, strokeWidth: 3 });
        graph.addNode('Bob', { radius: 0.35, fillColor: groupA, fillOpacity: 0.8, strokeColor: Color.WHITE, strokeWidth: 2 });
        graph.addNode('Carol', { radius: 0.35, fillColor: groupA, fillOpacity: 0.8, strokeColor: Color.WHITE, strokeWidth: 2 });

        // Group B - Work colleagues
        graph.addNode('Dave', { radius: 0.3, fillColor: groupB, fillOpacity: 0.8, strokeColor: Color.WHITE, strokeWidth: 2 });
        graph.addNode('Eve', { radius: 0.3, fillColor: groupB, fillOpacity: 0.8, strokeColor: Color.WHITE, strokeWidth: 2 });
        graph.addNode('Frank', { radius: 0.25, fillColor: groupB, fillOpacity: 0.8, strokeColor: Color.WHITE, strokeWidth: 2 });

        // Group C - Family
        graph.addNode('Grace', { radius: 0.35, fillColor: groupC, fillOpacity: 0.8, strokeColor: Color.WHITE, strokeWidth: 2 });
        graph.addNode('Henry', { radius: 0.3, fillColor: groupC, fillOpacity: 0.8, strokeColor: Color.WHITE, strokeWidth: 2 });

        // Connections within groups
        graph.addEdge('Alice', 'Bob', { strokeColor: groupA, strokeWidth: 3 });
        graph.addEdge('Alice', 'Carol', { strokeColor: groupA, strokeWidth: 3 });
        graph.addEdge('Bob', 'Carol', { strokeColor: groupA, strokeWidth: 2, curved: true });

        graph.addEdge('Dave', 'Eve', { strokeColor: groupB, strokeWidth: 2 });
        graph.addEdge('Eve', 'Frank', { strokeColor: groupB, strokeWidth: 2 });

        graph.addEdge('Grace', 'Henry', { strokeColor: groupC, strokeWidth: 3 });

        // Cross-group connections (Alice is the connector)
        graph.addEdge('Alice', 'Dave', { strokeColor: Color.WHITE, strokeWidth: 1, curved: true });
        graph.addEdge('Alice', 'Grace', { strokeColor: Color.WHITE, strokeWidth: 2 });

        // Apply force-directed layout
        graph.layout('force-directed', {
            iterations: 100,
            springLength: 2,
            repulsion: 1.5,
            attraction: 0.08
        });

        // Center the graph
        graph.pos(0, 0);

        // Add graph to scene
        this.add(graph);

        // Fade in the graph
        this.play(new FadeIn(graph).duration(1).ease(easeOutBack));

        this.wait(0.5);

        // Use camera system to zoom out and reveal full graph
        this.play(this.frame.zoomOut(3).duration(1.5).ease(easeInOutQuad));

        this.wait(1);

        this.play(new FadeOut(graph).duration(1));
    }
}

// ============================================================================
// Scene 2: File System Tree
// ============================================================================
export class FileSystemScene extends Scene {
    constructor() {
        super({ width: 1920, height: 1080, frameRate: 60 });

        const graph = new Graph();

        const folderColor = Color.fromHex('#F4A460'); // Sandy brown
        const fileColor = Color.fromHex('#87CEEB');   // Sky blue
        const rootColor = Color.fromHex('#9370DB');   // Medium purple

        // Root
        graph.addNode('root', { radius: 0.4, fillColor: rootColor, fillOpacity: 0.9, strokeColor: Color.WHITE, strokeWidth: 3 });

        // Level 1 - Main folders
        graph.addNode('src', { radius: 0.35, fillColor: folderColor, fillOpacity: 0.8, strokeColor: Color.WHITE, strokeWidth: 2 });
        graph.addNode('docs', { radius: 0.3, fillColor: folderColor, fillOpacity: 0.8, strokeColor: Color.WHITE, strokeWidth: 2 });
        graph.addNode('tests', { radius: 0.3, fillColor: folderColor, fillOpacity: 0.8, strokeColor: Color.WHITE, strokeWidth: 2 });

        // Level 2 - Subfolders and files
        graph.addNode('components', { radius: 0.25, fillColor: folderColor, fillOpacity: 0.7, strokeColor: Color.WHITE, strokeWidth: 1 });
        graph.addNode('utils', { radius: 0.25, fillColor: folderColor, fillOpacity: 0.7, strokeColor: Color.WHITE, strokeWidth: 1 });
        graph.addNode('index.ts', { radius: 0.2, fillColor: fileColor, fillOpacity: 0.8, strokeColor: Color.WHITE, strokeWidth: 1 });

        graph.addNode('README.md', { radius: 0.2, fillColor: fileColor, fillOpacity: 0.8, strokeColor: Color.WHITE, strokeWidth: 1 });
        graph.addNode('API.md', { radius: 0.2, fillColor: fileColor, fillOpacity: 0.8, strokeColor: Color.WHITE, strokeWidth: 1 });

        graph.addNode('unit', { radius: 0.25, fillColor: folderColor, fillOpacity: 0.7, strokeColor: Color.WHITE, strokeWidth: 1 });
        graph.addNode('e2e', { radius: 0.25, fillColor: folderColor, fillOpacity: 0.7, strokeColor: Color.WHITE, strokeWidth: 1 });

        // Level 3 - Leaf files
        graph.addNode('Button.tsx', { radius: 0.15, fillColor: fileColor, fillOpacity: 0.7, strokeColor: Color.WHITE, strokeWidth: 1 });
        graph.addNode('Modal.tsx', { radius: 0.15, fillColor: fileColor, fillOpacity: 0.7, strokeColor: Color.WHITE, strokeWidth: 1 });
        graph.addNode('helpers.ts', { radius: 0.15, fillColor: fileColor, fillOpacity: 0.7, strokeColor: Color.WHITE, strokeWidth: 1 });

        // Edges (parent -> child)
        graph.addEdge('root', 'src', { strokeColor: rootColor, strokeWidth: 2 });
        graph.addEdge('root', 'docs', { strokeColor: rootColor, strokeWidth: 2 });
        graph.addEdge('root', 'tests', { strokeColor: rootColor, strokeWidth: 2 });

        graph.addEdge('src', 'components', { strokeColor: folderColor, strokeWidth: 2 });
        graph.addEdge('src', 'utils', { strokeColor: folderColor, strokeWidth: 2 });
        graph.addEdge('src', 'index.ts', { strokeColor: folderColor, strokeWidth: 1 });

        graph.addEdge('docs', 'README.md', { strokeColor: folderColor, strokeWidth: 1 });
        graph.addEdge('docs', 'API.md', { strokeColor: folderColor, strokeWidth: 1 });

        graph.addEdge('tests', 'unit', { strokeColor: folderColor, strokeWidth: 2 });
        graph.addEdge('tests', 'e2e', { strokeColor: folderColor, strokeWidth: 2 });

        graph.addEdge('components', 'Button.tsx', { strokeColor: fileColor, strokeWidth: 1 });
        graph.addEdge('components', 'Modal.tsx', { strokeColor: fileColor, strokeWidth: 1 });
        graph.addEdge('utils', 'helpers.ts', { strokeColor: fileColor, strokeWidth: 1 });

        // Apply tree layout
        graph.layout('tree', {
            levelHeight: 1.5,
            siblingSpacing: 1.0
        });

        // Center the tree (tree grows downward, so shift up)
        graph.pos(0, -2);

        // Fade in the tree
        this.play(new FadeIn(graph).duration(1.5).ease(easeInOutQuad));

        this.wait(1.5);

        // Gentle rotation to show structure
        this.play(new Rotate(graph, Math.PI / 12).duration(1));
        this.play(new Rotate(graph, -Math.PI / 6).duration(1));
        this.play(new Rotate(graph, Math.PI / 12).duration(1));

        this.wait(0.5);

        this.play(new FadeOut(graph).duration(1));
    }
}

// ============================================================================
// Scene 3: Molecule Viewer (Benzene Ring)
// ============================================================================
export class MoleculeScene extends Scene {
    constructor() {
        super({ width: 1920, height: 1080, frameRate: 60 });

        const graph = new Graph();

        const carbonColor = Color.fromHex('#2C3E50');   // Dark blue-gray
        const hydrogenColor = Color.fromHex('#ECF0F1'); // Light gray
        const bondColor = Color.fromHex('#7F8C8D');     // Gray

        // Benzene ring - 6 carbon atoms in a hexagon
        graph.addNode('C1', { radius: 0.3, fillColor: carbonColor, fillOpacity: 1, strokeColor: Color.WHITE, strokeWidth: 2 });
        graph.addNode('C2', { radius: 0.3, fillColor: carbonColor, fillOpacity: 1, strokeColor: Color.WHITE, strokeWidth: 2 });
        graph.addNode('C3', { radius: 0.3, fillColor: carbonColor, fillOpacity: 1, strokeColor: Color.WHITE, strokeWidth: 2 });
        graph.addNode('C4', { radius: 0.3, fillColor: carbonColor, fillOpacity: 1, strokeColor: Color.WHITE, strokeWidth: 2 });
        graph.addNode('C5', { radius: 0.3, fillColor: carbonColor, fillOpacity: 1, strokeColor: Color.WHITE, strokeWidth: 2 });
        graph.addNode('C6', { radius: 0.3, fillColor: carbonColor, fillOpacity: 1, strokeColor: Color.WHITE, strokeWidth: 2 });

        // Hydrogen atoms attached to each carbon
        graph.addNode('H1', { radius: 0.15, fillColor: hydrogenColor, fillOpacity: 0.9, strokeColor: bondColor, strokeWidth: 1 });
        graph.addNode('H2', { radius: 0.15, fillColor: hydrogenColor, fillOpacity: 0.9, strokeColor: bondColor, strokeWidth: 1 });
        graph.addNode('H3', { radius: 0.15, fillColor: hydrogenColor, fillOpacity: 0.9, strokeColor: bondColor, strokeWidth: 1 });
        graph.addNode('H4', { radius: 0.15, fillColor: hydrogenColor, fillOpacity: 0.9, strokeColor: bondColor, strokeWidth: 1 });
        graph.addNode('H5', { radius: 0.15, fillColor: hydrogenColor, fillOpacity: 0.9, strokeColor: bondColor, strokeWidth: 1 });
        graph.addNode('H6', { radius: 0.15, fillColor: hydrogenColor, fillOpacity: 0.9, strokeColor: bondColor, strokeWidth: 1 });

        // Carbon-Carbon bonds (the ring)
        graph.addEdge('C1', 'C2', { strokeColor: carbonColor, strokeWidth: 4 });
        graph.addEdge('C2', 'C3', { strokeColor: carbonColor, strokeWidth: 2 });
        graph.addEdge('C3', 'C4', { strokeColor: carbonColor, strokeWidth: 4 });
        graph.addEdge('C4', 'C5', { strokeColor: carbonColor, strokeWidth: 2 });
        graph.addEdge('C5', 'C6', { strokeColor: carbonColor, strokeWidth: 4 });
        graph.addEdge('C6', 'C1', { strokeColor: carbonColor, strokeWidth: 2 });

        // Carbon-Hydrogen bonds
        graph.addEdge('C1', 'H1', { strokeColor: bondColor, strokeWidth: 1 });
        graph.addEdge('C2', 'H2', { strokeColor: bondColor, strokeWidth: 1 });
        graph.addEdge('C3', 'H3', { strokeColor: bondColor, strokeWidth: 1 });
        graph.addEdge('C4', 'H4', { strokeColor: bondColor, strokeWidth: 1 });
        graph.addEdge('C5', 'H5', { strokeColor: bondColor, strokeWidth: 1 });
        graph.addEdge('C6', 'H6', { strokeColor: bondColor, strokeWidth: 1 });

        // Position carbons in a hexagon manually
        const ringRadius = 1.5;
        const hydrogenDistance = 2.5;
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 2;
            const carbon = graph.getNode(`C${i + 1}`);
            const hydrogen = graph.getNode(`H${i + 1}`);
            if (carbon) carbon.pos(ringRadius * Math.cos(angle), ringRadius * Math.sin(angle));
            if (hydrogen) hydrogen.pos(hydrogenDistance * Math.cos(angle), hydrogenDistance * Math.sin(angle));
        }
        graph.updateEdges();

        // Animate molecule appearing
        this.play(new FadeIn(graph).duration(1).ease(easeOutBack));

        this.wait(0.5);

        // Rotate the molecule like it's spinning in 3D
        this.play(new Rotate(graph, Math.PI * 2).duration(3).ease(easeInOutQuad));

        this.wait(0.5);

        // Pulse effect
        this.play(new Scale(graph, 1.2).duration(0.4));
        this.play(new Scale(graph, 1 / 1.2).duration(0.4));

        this.wait(0.5);

        this.play(new FadeOut(graph).duration(1));
    }
}
