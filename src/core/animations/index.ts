// Animation base class
export { Animation } from './Animation';

// Fade animations
export { FadeIn, FadeOut } from './fade';

// Transform animations
export { MoveTo, Rotate, Scale } from './transform';

// Morph animations
export { MorphTo } from './morph';

// Draw animations
export { Create, Draw, Write, Unwrite } from './draw';

// Composition containers
export { Sequence, Parallel } from './composition';

// Keyframes
export { KeyframeTrack, KeyframeAnimation } from './keyframes';
export type { Keyframe } from './keyframes';

// Animation types
export type { AnimationConfig } from './types';

// Easing - re-export all from easing module
export * from './easing';

// Timeline - re-export from timeline module
export { Timeline } from '../timeline';
export type { ScheduledAnimation, TimelineConfig } from '../timeline';

// Scene - re-export from scene module
export { Scene } from '../scene';
export type { SceneConfig, ResolvedSceneConfig } from '../scene';

// Camera - re-export from camera module
export { Camera } from '../camera';
export type { CameraConfig, ResolvedCameraConfig } from '../camera';

export { serialize, deserialize } from '../serialization';

// Renderer - re-export from renderer module
export { Renderer, FrameRenderer, ProgressReporter, Resolution } from '../renderer';
export type {
    RenderConfig,
    ResolvedRenderConfig,
    RenderFormat,
    RenderQuality,
    RenderProgress,
    ProgressCallback,
} from '../renderer';
