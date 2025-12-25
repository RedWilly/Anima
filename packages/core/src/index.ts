/**
 * @anima/core - Animation engine core
 * 
 * Environment-agnostic animation primitives and timeline orchestration.
 */

// Types
export type { Point, Style, AnimationOptions, EasingName, EasingFunction } from './types';

// Entities
export { Entity } from './entities/entity';
export { Shape } from './entities/shape';
export { Circle, circle } from './entities/circle';
export type { CircleOptions } from './entities/circle';
export { Rectangle, rectangle } from './entities/rectangle';
export type { RectangleOptions } from './entities/rectangle';

// Timeline
export { Timeline } from './timeline/timeline';
export type { TimelineState, TimelineOptions } from './timeline/timeline';
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

