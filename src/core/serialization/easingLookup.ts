/**
 * Easing function lookup for serialization.
 * Maps easing functions to names and vice versa.
 */

import type { EasingFunction } from '../animations/easing';
import {
    linear,
    easeInQuad, easeOutQuad, easeInOutQuad,
    easeInCubic, easeOutCubic, easeInOutCubic,
    easeInQuart, easeOutQuart, easeInOutQuart,
    easeInQuint, easeOutQuint, easeInOutQuint,
    easeInSine, easeOutSine, easeInOutSine,
    easeInExpo, easeOutExpo, easeInOutExpo,
    easeInCirc, easeOutCirc, easeInOutCirc,
    easeInBack, easeOutBack, easeInOutBack,
    easeInElastic, easeOutElastic, easeInOutElastic,
    easeInBounce, easeOutBounce, easeInOutBounce,
    smooth, doubleSmooth, rushInto, rushFrom,
    slowInto, thereAndBack,
    wiggle, lingering, runningStart,
} from '../animations/easing';

// Mapping from function reference to name
const easingToName = new Map<EasingFunction, string>();
const nameToEasing = new Map<string, EasingFunction>();

function register(name: string, fn: EasingFunction): void {
    easingToName.set(fn, name);
    nameToEasing.set(name, fn);
}

// Register all built-in easing functions
register('linear', linear);
register('easeInQuad', easeInQuad);
register('easeOutQuad', easeOutQuad);
register('easeInOutQuad', easeInOutQuad);
register('easeInCubic', easeInCubic);
register('easeOutCubic', easeOutCubic);
register('easeInOutCubic', easeInOutCubic);
register('easeInQuart', easeInQuart);
register('easeOutQuart', easeOutQuart);
register('easeInOutQuart', easeInOutQuart);
register('easeInQuint', easeInQuint);
register('easeOutQuint', easeOutQuint);
register('easeInOutQuint', easeInOutQuint);
register('easeInSine', easeInSine);
register('easeOutSine', easeOutSine);
register('easeInOutSine', easeInOutSine);
register('easeInExpo', easeInExpo);
register('easeOutExpo', easeOutExpo);
register('easeInOutExpo', easeInOutExpo);
register('easeInCirc', easeInCirc);
register('easeOutCirc', easeOutCirc);
register('easeInOutCirc', easeInOutCirc);
register('easeInBack', easeInBack);
register('easeOutBack', easeOutBack);
register('easeInOutBack', easeInOutBack);
register('easeInElastic', easeInElastic);
register('easeOutElastic', easeOutElastic);
register('easeInOutElastic', easeInOutElastic);
register('easeInBounce', easeInBounce);
register('easeOutBounce', easeOutBounce);
register('easeInOutBounce', easeInOutBounce);
register('smooth', smooth);
register('doubleSmooth', doubleSmooth);
register('rushInto', rushInto);
register('rushFrom', rushFrom);
register('slowInto', slowInto);
register('thereAndBack', thereAndBack);
register('wiggle', wiggle);
register('lingering', lingering());
register('runningStart', runningStart());

/**
 * Get the name of an easing function.
 */
export function getEasingName(fn: EasingFunction): string {
    return easingToName.get(fn) ?? 'smooth';
}

/**
 * Get an easing function by name.
 */
export function getEasingByName(name: string): EasingFunction | undefined {
    return nameToEasing.get(name);
}
