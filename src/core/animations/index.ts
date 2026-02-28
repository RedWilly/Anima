// Animation base class
export { Animation } from './Animation';
export {
    IntroductoryAnimation,
    TransformativeAnimation,
    ExitAnimation,
} from './LifecycleAnimations';

// Fade animations
export { FadeIn } from './fade/FadeIn';
export { FadeOut } from './fade/FadeOut';

// Transform animations
export { MoveTo } from './transform/MoveTo';
export { Rotate } from './transform/Rotate';
export { Scale } from './transform/Scale';

// Morph animations
export { MorphTo } from './morph/MorphTo';

// Draw animations
export { Draw } from './draw/Draw';
export { Write } from './draw/Write';
export { Unwrite } from './draw/Unwrite';

// Composition containers
export { Sequence } from './composition/Sequence';
export { Parallel } from './composition/Parallel';

// Keyframes
export { KeyframeTrack } from './keyframes/KeyframeTrack';
export { KeyframeAnimation } from './keyframes/KeyframeAnimation';
export type { Keyframe } from './keyframes/types';

// Camera animations
export { Follow } from './camera/Follow';
export { Shake } from './camera/Shake';

// Fluent construction helpers
export {
    createFadeIn,
    createFadeOut,
    createMoveTo,
    createMorphTo,
    createRotate,
    createScale,
    createParallel,
    createSequence,
    createWrite,
    createUnwrite,
    createDraw,
} from './fluent';

// Introspection and scheduling helpers
export {
    getAnimationChildren,
    getAnimationTotalTime,
    getLongestAnimationTotalTime,
} from './introspection';

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
export type { EasingFunction } from './easing';
