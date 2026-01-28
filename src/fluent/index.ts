/**
 * FluentAPI module for chainable animations.
 *
 * The fluent API allows building animations through method chaining:
 * @example
 * circle.fadeIn(1).moveTo(100, 50, 2).rotate(Math.PI);
 *
 * For parallel animations, use factory functions:
 * @example
 * import { fadeIn, moveTo, rotate } from './fluent';
 * circle.parallel(fadeIn(1), moveTo(100, 50), rotate(Math.PI));
 */

// Core queue management
export { AnimationQueue } from './AnimationQueue';

// Types
export type {
    FluentConfig,
    AnimationFactory,
    QueuedAnimation,
    QueuedPrebuilt,
    QueueEntry,
} from './FluentTypes';
export { DEFAULT_DURATION, isPrebuilt } from './FluentTypes';

// Animation factories for .parallel()

