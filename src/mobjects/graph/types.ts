import { Color } from '../../core/math/color/Color';

/** Unique identifier for graph nodes. */
export type GraphNodeId = string;

/** Configuration for creating a graph node. */
export interface NodeConfig {
    position?: { x: number; y: number };
    radius?: number;
    strokeColor?: Color;
    strokeWidth?: number;
    fillColor?: Color;
    fillOpacity?: number;
}

/** Configuration for creating a graph edge. */
export interface EdgeConfig {
    strokeColor?: Color;
    strokeWidth?: number;
    curved?: boolean;
}

/** Supported layout algorithms. */
export type LayoutType = 'force-directed' | 'tree' | 'circular';

/** Configuration for graph layout algorithms. */
export interface LayoutConfig {
    // Circular layout
    radius?: number;

    // Tree layout
    levelHeight?: number;
    siblingSpacing?: number;

    // Force-directed layout
    iterations?: number;
    springLength?: number;
    repulsion?: number;
    attraction?: number;
    damping?: number;
    minDistance?: number;
}
