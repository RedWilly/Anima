/**
 * Animation factories for VMobject fluent API.
 * Use with .parallel() to run animations simultaneously.
 *
 * @example
 * import { write, draw } from './fluent';
 * circle.parallel(write(2), fadeIn(1));
 */
import type { Mobject } from '../../mobjects/Mobject';
import type { VMobject } from '../../mobjects/VMobject';
import { Write, Unwrite, Draw } from '../../core/animations/draw';
import { DEFAULT_DURATION } from '../FluentTypes';
import type { AnimFactory } from './mobject';

/**
 * Factory for Write animation - progressively draws paths.
 * @param duration - Animation duration in seconds.
 */
export function write(duration: number = DEFAULT_DURATION): AnimFactory {
    return (target: Mobject) => new Write(target as VMobject).duration(duration);
}

/**
 * Factory for Unwrite animation - progressively removes paths.
 * @param duration - Animation duration in seconds.
 */
export function unwrite(duration: number = DEFAULT_DURATION): AnimFactory {
    return (target: Mobject) => new Unwrite(target as VMobject).duration(duration);
}

/**
 * Factory for Draw animation - draws stroke first, then fades in fill.
 * @param duration - Animation duration in seconds.
 */
export function draw(duration: number = DEFAULT_DURATION): AnimFactory {
    return (target: Mobject) => new Draw(target as VMobject).duration(duration);
}
