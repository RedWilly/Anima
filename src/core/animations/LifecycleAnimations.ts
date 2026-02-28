import { Animation } from './Animation';
import type { AnimationLifecycle } from './types';
import type { Mobject } from '../mobjects';

/**
 * Abstract base class for animations that introduce an object to the scene.
 */
export abstract class IntroductoryAnimation<T extends Mobject = Mobject> extends Animation<T> {
    readonly lifecycle: AnimationLifecycle = 'introductory';
}

/**
 * Abstract base class for animations that transform an existing scene object.
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

/**
 * Abstract base class for animations that exit/remove an object from the scene.
 */
export abstract class ExitAnimation<T extends Mobject = Mobject> extends Animation<T> {
    readonly lifecycle: AnimationLifecycle = 'exit';
}
