import { Animation } from '../Animation';
import type { AnimationLifecycle } from '../types';
import type { Mobject } from '../../../mobjects/Mobject';

/**
 * Abstract base class for animations that exit/remove an object from the scene.
 * 
 * Exit animations:
 * - Require the target to already be registered with the scene
 * - Throw an error if the target is not in the scene
 * - Typically animate opacity or scale to 0
 * - May optionally auto-remove the target from the scene after completion
 * 
 * Examples: FadeOut, ShrinkToCenter, Uncreate
 */
export abstract class ExitAnimation<T extends Mobject = Mobject> extends Animation<T> {
    readonly lifecycle: AnimationLifecycle = 'exit';
}
