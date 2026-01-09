// Core type
export type { EasingFunction } from './types';

// Standard easing functions
export {
    linear,
    easeInQuad,
    easeOutQuad,
    easeInOutQuad,
    easeInCubic,
    easeOutCubic,
    easeInOutCubic,
    easeInQuart,
    easeOutQuart,
    easeInOutQuart,
    easeInQuint,
    easeOutQuint,
    easeInOutQuint,
    easeInSine,
    easeOutSine,
    easeInOutSine,
    easeInExpo,
    easeOutExpo,
    easeInOutExpo,
    easeInCirc,
    easeOutCirc,
    easeInOutCirc,
    easeInBack,
    easeOutBack,
    easeInOutBack,
    easeInElastic,
    easeOutElastic,
    easeInOutElastic,
} from './standard';

// Bounce functions
export {
    easeInBounce,
    easeOutBounce,
    easeInOutBounce,
} from './bounce';

// Manim-style rate functions
export {
    smooth,
    doubleSmooth,
    rushInto,
    rushFrom,
    slowInto,
    thereAndBack,
    thereAndBackWithPause,
    runningStart,
    wiggle,
    notQuiteThere,
    lingering,
    exponentialDecay,
} from './manim';

// Custom easing registry
export {
    registerEasing,
    getEasing,
    hasEasing,
    unregisterEasing,
    clearRegistry,
} from './registry';

// Re-export smooth as the default easing
import { smooth } from './manim';
export { smooth as defaultEasing };
