/**
 * Entity exports.
 */

export { Entity } from './entity';
export { Shape } from './shape';

// Shapes
export {
    Arc, arc,
    Arrow, arrow,
    Bezier, bezier,
    Circle, circle,
    Line, line,
    Path, path,
    Polygon, polygon,
    Rectangle, rectangle,
    isSubPaths,
    interpolatePoints,
    interpolateSubPaths,
    interpolateStyle,
} from './shapes';

export type {
    ArcOptions,
    ArrowOptions, ArrowHeads, ArrowHeadStyle,
    BezierOptions,
    CircleOptions,
    LineOptions,
    PathOptions,
    PolygonOptions, MorphTarget, MorphOptions,
    RectangleOptions,
} from './shapes';

// Text
export { Text, text, TextCharacter } from './text';
export type { TextOptions, TextCharacterOptions, FontConfig } from './text';

// Group
export { Group, group } from './group';
export type { GroupOptions } from './group';
