// Animation base class
export { Animation } from './Animation';

// Fade animations
export { FadeIn, FadeOut } from './fade';

// Transform animations
export { MoveTo, Rotate, Scale } from './transform';

// Morph animations
export { MorphTo } from './morph';

// Draw animations
export { Draw, Write, Unwrite } from './draw';

// Composition containers
export { Sequence, Parallel } from './composition';

// Keyframes
export { KeyframeTrack, KeyframeAnimation } from './keyframes';
export type { Keyframe } from './keyframes';

// Camera animations
export { Follow, Shake } from './camera';

// Animation types
export type { 
    AnimationConfig,
    FluentConfig,
    AnimationFactory,
    QueuedAnimation,
    QueuedPrebuilt,
    QueueEntry,
} from './types';
export { DEFAULT_DURATION, isPrebuilt } from './types';
