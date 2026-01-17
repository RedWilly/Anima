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
import { Write, Unwrite, Draw, Create } from '../../core/animations/draw';
import { DEFAULT_DURATION } from '../FluentTypes';
import type { AnimFactory } from './mobject';

export function write(duration: number = DEFAULT_DURATION): AnimFactory {
    return (target: Mobject) => new Write(target as VMobject).duration(duration);
}

export function unwrite(duration: number = DEFAULT_DURATION): AnimFactory {
    return (target: Mobject) => new Unwrite(target as VMobject).duration(duration);
}

export function draw(duration: number = DEFAULT_DURATION): AnimFactory {
    return (target: Mobject) => new Draw(target as VMobject).duration(duration);
}

export function create(duration: number = DEFAULT_DURATION): AnimFactory {
    return (target: Mobject) => new Create(target as VMobject).duration(duration);
}
