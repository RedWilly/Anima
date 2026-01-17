/**
 * Serialization types and interfaces.
 * All serialized types are plain JSON-compatible objects.
 */

import type { PathCommandType } from '../math/bezier/types';

// ========== Primitive Serialized Types ==========

export interface SerializedVector2 {
    readonly x: number;
    readonly y: number;
}

export interface SerializedColor {
    readonly r: number;
    readonly g: number;
    readonly b: number;
    readonly a: number;
}

export interface SerializedMatrix3x3 {
    readonly values: readonly number[];
}

export interface SerializedPathCommand {
    readonly type: PathCommandType;
    readonly end: SerializedVector2;
    readonly control1?: SerializedVector2;
    readonly control2?: SerializedVector2;
}

export interface SerializedBezierPath {
    readonly commands: readonly SerializedPathCommand[];
}

// ========== Mobject Serialized Types ==========

/** Type discriminator for polymorphic deserialization */
export type MobjectType =
    | 'Mobject'
    | 'VMobject'
    | 'VGroup'
    | 'Circle'
    | 'Rectangle'
    | 'Line'
    | 'Arrow'
    | 'Arc'
    | 'Polygon'
    | 'Point'
    | 'Text'
    | 'Glyph'
    | 'Graph'
    | 'GraphNode'
    | 'GraphEdge'
    | string; // Allow custom types

export interface SerializedMobject {
    readonly type: MobjectType;
    readonly id: string;
    readonly matrix: SerializedMatrix3x3;
    readonly opacity: number;
}

export interface SerializedVMobject extends SerializedMobject {
    readonly paths: readonly SerializedBezierPath[];
    readonly strokeColor: SerializedColor;
    readonly strokeWidth: number;
    readonly fillColor: SerializedColor;
    readonly fillOpacity: number;
}

export interface SerializedVGroup extends SerializedMobject {
    readonly children: readonly SerializedMobject[];
}

// Primitive-specific serialized types with constructor args
export interface SerializedCircle extends SerializedVMobject {
    readonly type: 'Circle';
    readonly radius: number;
}

export interface SerializedRectangle extends SerializedVMobject {
    readonly type: 'Rectangle';
    readonly width: number;
    readonly height: number;
}

export interface SerializedLine extends SerializedVMobject {
    readonly type: 'Line';
    readonly start: SerializedVector2;
    readonly end: SerializedVector2;
}

export interface SerializedArc extends SerializedVMobject {
    readonly type: 'Arc';
    readonly radius: number;
    readonly startAngle: number;
    readonly endAngle: number;
}

export interface SerializedPolygon extends SerializedVMobject {
    readonly type: 'Polygon';
    readonly vertices: readonly SerializedVector2[];
}

export interface SerializedPoint extends SerializedVMobject {
    readonly type: 'Point';
    readonly position: SerializedVector2;
}

// ========== Animation Serialized Types ==========

export type AnimationType =
    | 'FadeIn'
    | 'FadeOut'
    | 'MoveTo'
    | 'Rotate'
    | 'Scale'
    | 'MorphTo'
    | 'Create'
    | 'Draw'
    | 'Write'
    | 'Unwrite'
    | 'Sequence'
    | 'Parallel'
    | 'KeyframeAnimation'
    | string;

export interface SerializedAnimationConfig {
    readonly durationSeconds: number;
    readonly delaySeconds: number;
    readonly easingName: string;
}

export interface SerializedAnimation {
    readonly type: AnimationType;
    readonly targetId: string;
    readonly config: SerializedAnimationConfig;
}

export interface SerializedMoveTo extends SerializedAnimation {
    readonly type: 'MoveTo';
    readonly destination: SerializedVector2;
}

export interface SerializedRotate extends SerializedAnimation {
    readonly type: 'Rotate';
    readonly angle: number;
}

export interface SerializedScale extends SerializedAnimation {
    readonly type: 'Scale';
    readonly factor: number;
}

export interface SerializedMorphTo extends SerializedAnimation {
    readonly type: 'MorphTo';
    readonly targetShapeId: string;
}

export interface SerializedSequence extends SerializedAnimation {
    readonly type: 'Sequence';
    readonly animations: readonly SerializedAnimation[];
}

export interface SerializedParallel extends SerializedAnimation {
    readonly type: 'Parallel';
    readonly animations: readonly SerializedAnimation[];
}

// ========== Timeline/Scene Serialized Types ==========

export interface SerializedScheduledAnimation {
    readonly animation: SerializedAnimation;
    readonly startTime: number;
}

export interface SerializedTimeline {
    readonly loop: boolean;
    readonly scheduled: readonly SerializedScheduledAnimation[];
}

export interface SerializedSceneConfig {
    readonly width: number;
    readonly height: number;
    readonly backgroundColor: SerializedColor;
    readonly frameRate: number;
}

export interface SerializedScene {
    readonly version: string;
    readonly config: SerializedSceneConfig;
    readonly mobjects: readonly SerializedMobject[];
    readonly timeline: SerializedTimeline;
}

// ========== Custom Serializer Hook ==========

export interface CustomSerializer<T> {
    readonly typeName: string;
    serialize(instance: T): SerializedMobject;
    deserialize(data: SerializedMobject): T;
}
