/**
 * Animation factories for Mobject fluent API.
 * Use with .parallel() to run animations simultaneously.
 *
 * @example
 * import { fadeIn, moveTo, rotate } from './fluent';
 * circle.parallel(fadeIn(1), moveTo(100, 50, 2), rotate(Math.PI));
 */
import type { Mobject } from '../../mobjects/Mobject';
import type { Animation } from '../../core/animations/Animation';
import { FadeIn, FadeOut } from '../../core/animations/fade';
import { MoveTo, Rotate, Scale } from '../../core/animations/transform';
import { DEFAULT_DURATION } from '../FluentTypes';

/** Factory function type for creating animations */
export type AnimFactory = (target: Mobject) => Animation<Mobject>;

export function fadeIn(duration: number = DEFAULT_DURATION): AnimFactory {
    return (target: Mobject) => new FadeIn(target).duration(duration);
}

export function fadeOut(duration: number = DEFAULT_DURATION): AnimFactory {
    return (target: Mobject) => new FadeOut(target).duration(duration);
}

export function moveTo(x: number, y: number, duration: number = DEFAULT_DURATION): AnimFactory {
    return (target: Mobject) => new MoveTo(target, x, y).duration(duration);
}

export function rotate(angle: number, duration: number = DEFAULT_DURATION): AnimFactory {
    return (target: Mobject) => new Rotate(target, angle).duration(duration);
}

export function scaleTo(factor: number, duration: number = DEFAULT_DURATION): AnimFactory {
    return (target: Mobject) => new Scale(target, factor).duration(duration);
}
