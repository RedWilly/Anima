import type { Vector } from '../vector';

export type PathCommandType = 'Move' | 'Line' | 'Quadratic' | 'Cubic' | 'Close';

export interface PathCommand {
    type: PathCommandType;
    end: Vector;
    control1?: Vector;
    control2?: Vector;
}

