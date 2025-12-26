/**
 * @anima/core - Animation engine core
 */

import { circle } from './entities/circle';
import { rectangle } from './entities/rectangle';
import { line } from './entities/line';
import { arrow } from './entities/arrow';
import { polygon } from './entities/polygon';
import { bezier } from './entities/bezier';
import { arc } from './entities/arc';
import { path } from './entities/path';
import { text } from './entities/text';
import { group } from './entities/group';
import { scene } from './scene/factory';

export const anima = {
    scene,
    circle,
    rectangle,
    line,
    arrow,
    polygon,
    bezier,
    arc,
    path,
    text,
    group,
};

// Types
export type {
    Point,
    Style,
    AnimationOptions,
    EasingName,
    EasingFunction,
    FontWeight,
    TextAlign,
    TextBaseline,
    Animatable,
    ActionInfo,
} from './types';

export type { CircleOptions } from './entities/circle';
export type { RectangleOptions } from './entities/rectangle';
export type { LineOptions } from './entities/line';
export type { ArrowOptions, ArrowHeads, ArrowHeadStyle } from './entities/arrow';
export type { PolygonOptions } from './entities/polygon';
export type { BezierOptions } from './entities/bezier';
export type { ArcOptions } from './entities/arc';
export type { PathOptions } from './entities/path';
export type { TextOptions, TextCharacterOptions, FontConfig } from './entities/text';
export type { GroupOptions } from './entities/group';
export type { SceneOptions } from './scene/scene';
export type { TimelineState, TimelineOptions, ScheduleMode, ParallelGroup } from './timeline/timeline';
export type { Action, ActionType } from './timeline/action';
export type { FontInfo, FontLoadOptions, GlyphMetrics, GlyphPosition, LayoutResult } from './font';

// Factory functions
export { circle } from './entities/circle';
export { rectangle } from './entities/rectangle';
export { line } from './entities/line';
export { arrow } from './entities/arrow';
export { polygon } from './entities/polygon';
export { bezier } from './entities/bezier';
export { arc } from './entities/arc';
export { path } from './entities/path';
export { text, TextCharacter } from './entities/text';
export { group } from './entities/group';
export { scene } from './scene/factory';

// Core (internal use)
export { Entity } from './entities/entity';
export { Shape } from './entities/shape';
export { Scene } from './scene/scene';
export { Timeline } from './timeline/timeline';
export { createAction } from './timeline/action';

// Utilities
export { linear, easeIn, easeOut, easeInOut, elastic, bounce, getEasing } from './easing';
export { lerp, clamp, Vector2 } from './math';
export { FontMetrics } from './font';
