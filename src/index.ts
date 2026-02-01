// Core Classes - Essential for all users
export { Scene } from './core/scene';
export type { SceneConfig } from './core/scene';

// Mobjects - Visual objects that can be animated
export { Mobject, VMobject, VGroup } from './mobjects';

// Camera
export { Camera, CameraFrame } from './core/camera';
export type { CameraConfig, ResolvedCameraConfig } from './core/camera';


// Geometric Primitives
export { 
    Circle, 
    Rectangle, 
    Line, 
    Arrow, 
    Arc, 
    Polygon, 
    Point 
} from './mobjects/geometry';

// Text and Graph - Advanced visualization
export { Text, Glyph } from './mobjects/text';
export type { TextStyle } from './mobjects/text';
export { Graph, GraphNode, GraphEdge } from './mobjects/graph';
export type { 
    GraphNodeId, 
    NodeConfig, 
    EdgeConfig, 
    LayoutType,
    LayoutConfig 
} from './mobjects/graph';

// FluentAPI - Chainable animations (built into mobjects above)
// No exports needed - methods are available on mobject instances

// ProAPI - Explicit animation objects for advanced users
export {
    Animation,
    FadeIn,
    FadeOut,
    MoveTo,
    Rotate,
    Scale,
    MorphTo,
    Draw,
    Write,
    Unwrite,
    Sequence,
    Parallel,
    KeyframeTrack,
    KeyframeAnimation,
    Follow,
    Shake
} from './core/animations';

export type { 
    AnimationConfig,
    Keyframe 
} from './core/animations';

export { Color } from './core/math/color';

// Serialization - For saving/loading animations
export { serialize, deserialize } from './core/serialization';


export { Timeline } from './core/timeline';
export type { ScheduledAnimation, TimelineConfig } from './core/timeline';


export { Renderer, FrameRenderer, ProgressReporter, Resolution } from './core/renderer';

// Easing Functions - Essential for animation control
export * from './core/animations/easing';

