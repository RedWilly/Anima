/**
 * @anima/core - Animation engine core
 */

import { circle } from './entities';
import { rectangle } from './entities';
import { line } from './entities';
import { arrow } from './entities';
import { polygon } from './entities';
import { bezier } from './entities';
import { arc } from './entities';
import { path } from './entities';
import { text } from './entities';
import { group } from './entities';
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

export type {
    CircleOptions,
    RectangleOptions,
    LineOptions,
    ArrowOptions, ArrowHeads, ArrowHeadStyle,
    PolygonOptions, MorphTarget, MorphOptions,
    BezierOptions,
    ArcOptions,
    PathOptions,
    TextOptions, TextCharacterOptions, FontConfig,
    GroupOptions,
} from './entities';

export type { SceneOptions } from './scene/scene';
export type { TimelineState, TimelineOptions, ScheduleMode, ParallelGroup } from './timeline/timeline';
export type { Action, ActionType } from './timeline/action';
export type { FontInfo, FontLoadOptions, GlyphMetrics, GlyphPosition, LayoutResult } from './font';

// Factory functions
export {
    circle,
    rectangle,
    line,
    arrow,
    polygon,
    bezier,
    arc,
    path,
    text,
    TextCharacter,
    group,
} from './entities';
export { scene } from './scene/factory';

// Core (internal use)
export { Entity, Shape } from './entities';
export { Scene } from './scene/scene';
export { Timeline } from './timeline/timeline';
export { createAction } from './timeline/action';

// Utilities
export { linear, easeIn, easeOut, easeInOut, elastic, bounce, getEasing } from './easing';
export { lerp, clamp, Vector2 } from './math';
export { FontMetrics } from './font';

// Morph utilities
export { isSubPaths, interpolatePoints, interpolateSubPaths, interpolateStyle } from './entities';
