import { Vector2 } from '../../core/math/Vector2/Vector2';
import { Color } from '../../core/math/color/Color';

/** Unique identifier for graph nodes. */
export type GraphNodeId = string;

/** Configuration for creating a graph node. */
export interface NodeConfig {
    position?: Vector2;
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
    radius?: number;       // For circular layout
    levelHeight?: number;  // For tree layout
    iterations?: number;   // For force-directed layout
    springLength?: number; // For force-directed layout
    repulsion?: number;    // For force-directed layout
}
