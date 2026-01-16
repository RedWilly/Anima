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

// Animation types
export type { AnimationConfig } from './types';

// Easing - re-export all from easing module
export * from './easing';
