/**
 * Serialization module for the Anima animation engine.
 *
 * This module provides functionality to convert Scenes, Mobjects, and Animations
 * into JSON-compatible objects and back, enabling project persistence, undo/redo,
 * and cross-process communication.
 *
 * Example usage:
 * ```typescript
 * import { serialize, deserialize } from './serialization';
 *
 * const json = serialize(scene);
 * const restoredScene = deserialize(json);
 * ```
 */

// Main entry points
export { serialize, deserialize, serializeScene, deserializeScene } from './scene';

// Pretty printing
export { prettyPrint, prettyPrintCompact } from './prettyPrint';

// Mobject serialization
export { serializeMobject, deserializeMobject, resetIdCounter } from './mobject';

// Animation serialization
export { serializeAnimation, deserializeAnimation } from './animation';

// Primitive serialization
export {
    serializeVector2,
    deserializeVector2,
    serializeMatrix3x3,
    deserializeMatrix3x3,
    serializeColor,
    deserializeColor,
    serializeBezierPath,
    deserializeBezierPath,
} from './primitives';

// Custom serializer registry
export {
    registerSerializer,
    getSerializer,
    hasSerializer,
    unregisterSerializer,
    clearSerializerRegistry,
} from './registry';

// Easing lookup
export { getEasingName, getEasingByName } from './easingLookup';

// All types
export type {
    SerializedVector2,
    SerializedColor,
    SerializedMatrix3x3,
    SerializedPathCommand,
    SerializedBezierPath,
    SerializedMobject,
    SerializedVMobject,
    SerializedVGroup,
    SerializedCircle,
    SerializedRectangle,
    SerializedLine,
    SerializedArc,
    SerializedPolygon,
    SerializedAnimation,
    SerializedAnimationConfig,
    SerializedMoveTo,
    SerializedRotate,
    SerializedScale,
    SerializedSequence,
    SerializedParallel,
    SerializedScheduledAnimation,
    SerializedTimeline,
    SerializedSceneConfig,
    SerializedScene,
    MobjectType,
    AnimationType,
    CustomSerializer,
} from './types';
