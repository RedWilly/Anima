import { Animation } from '../Animation';
import type { AnimationLifecycle } from '../types';
import type { Mobject } from '../../../mobjects/Mobject';

/**
 * Abstract base class for animations that introduce an object to the scene.
 *
 * Introductory animations:
 * - Automatically register the target with the scene if not already present
 * - Do not require the target to be in the scene beforehand
 * - Typically animate opacity or drawing from 0 to visible
 *
 * Examples: FadeIn, Write, Draw, GrowFromCenter, SpinIn
 */
export abstract class IntroductoryAnimation<T extends Mobject = Mobject> extends Animation<T> {
    readonly lifecycle: AnimationLifecycle = 'introductory';
}
