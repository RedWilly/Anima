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
 * - Use lazy initialization to capture start state when animation becomes active
 * 
 * Examples: MoveTo, Rotate, Scale, MorphTo, Transform
 */
export abstract class TransformativeAnimation<T extends Mobject = Mobject> extends Animation<T> {
    readonly lifecycle: AnimationLifecycle = 'transformative';
    protected initialized = false;

    /**
     * Captures the start state from the target.
     * Called once when the animation first becomes active.
     */
    protected abstract captureStartState(): void;

    override ensureInitialized(): void {
        if (!this.initialized) {
            this.captureStartState();
            this.initialized = true;
        }
    }

    override reset(): void {
        this.initialized = false;
    }
}
