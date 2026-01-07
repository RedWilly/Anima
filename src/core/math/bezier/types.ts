import type { Vector2 } from '../Vector2/Vector2';

export type PathCommandType = 'Move' | 'Line' | 'Quadratic' | 'Cubic' | 'Close';

export interface PathCommand {
    type: PathCommandType;
    end: Vector2;
    control1?: Vector2;
    control2?: Vector2;
}
