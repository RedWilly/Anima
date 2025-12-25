/**
 * @anima/core - Animation engine core
 * 
 * Environment-agnostic animation primitives and timeline orchestration.
 */

// Types
export type { Point, Style, AnimationOptions, EasingName, EasingFunction, FontWeight, TextAlign, TextBaseline, Animatable, ActionInfo } from './types';

// Entities
export { Entity } from './entities/entity';
export { Shape } from './entities/shape';
export { Circle, circle } from './entities/circle';
export type { CircleOptions } from './entities/circle';
export { Rectangle, rectangle } from './entities/rectangle';
export type { RectangleOptions } from './entities/rectangle';
export { Line, line } from './entities/line';
export type { LineOptions } from './entities/line';
export { Arrow, arrow } from './entities/arrow';
export type { ArrowOptions, ArrowHeads, ArrowHeadStyle } from './entities/arrow';
export { Polygon, polygon } from './entities/polygon';
export type { PolygonOptions } from './entities/polygon';
export { Text, text, TextCharacter } from './entities/text';
export type { TextOptions, TextCharacterOptions, FontConfig } from './entities/text';

// Timeline
export { Timeline } from './timeline/timeline';
export type { TimelineState, TimelineOptions, ScheduleMode, ParallelGroup } from './timeline/timeline';
export { createAction } from './timeline/action';
export type { Action, ActionType } from './timeline/action';

// Scene
export { Scene } from './scene/scene';
export type { SceneOptions } from './scene/scene';
export { scene } from './scene/factory';

// Easing
export { linear, easeIn, easeOut, easeInOut, elastic, bounce, getEasing } from './easing';

// Math utilities
export { lerp, clamp, Vector2 } from './math';

// Font metrics
export { FontMetrics } from './font';
export type {
    FontInfo,
    FontLoadOptions,
    GlyphMetrics,
    GlyphPosition,
    LayoutResult,
} from './font';

