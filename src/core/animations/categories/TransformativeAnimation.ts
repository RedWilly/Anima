import { Animation } from '../Animation';
import type { AnimationLifecycle } from '../types';
import type { Mobject } from '../../../mobjects/Mobject';

/**
 * Abstract base class for animations that transform an existing scene object.
 * 
 * Transformative animations:
 * - Require the target to already be registered with the scene
 * - Throw an error if the target is not in the scene
 * - Operate on objects that are already visible or have been introduced
 * 
 * Examples: MoveTo, Rotate, Scale, MorphTo, Transform
 */
export abstract class TransformativeAnimation<T extends Mobject = Mobject> extends Animation<T> {
    readonly lifecycle: AnimationLifecycle = 'transformative';
}
