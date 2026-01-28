import { Mobject } from '../../../mobjects/Mobject';
import { Animation } from '../Animation';
import type { AnimationLifecycle } from '../types';

/**
 * Executes animations in parallel, all starting at the same time.
 * Total duration equals the maximum of all child animation durations.
 * 
 * This is a composition animation - its lifecycle is determined by its children.
 * By default, uses 'transformative' lifecycle if children are mixed.
 * 
 * All children are initialized together before any interpolation begins,
 * ensuring they all capture state at the same moment.
 */
export class Parallel extends Animation<Mobject> {
    private readonly children: Animation[];
    private readonly maxChildDuration: number;

    /**
     * The lifecycle of Parallel is 'introductory' only if ALL children are introductory.
     * Otherwise, it defaults to 'transformative'.
     */
    readonly lifecycle: AnimationLifecycle;

    constructor(animations: Animation[]) {
        super(new Mobject());
        this.children = animations;
        this.maxChildDuration = animations.reduce(
            (max, a) => Math.max(max, a.getDuration()),
            0
        );
        this.durationSeconds = this.maxChildDuration;

        // Lifecycle is introductory only if ALL children are introductory
        this.lifecycle = animations.every(a => a.lifecycle === 'introductory')
            ? 'introductory'
            : 'transformative';
    }

    override getDuration(): number {
        return this.durationSeconds;
    }

    getChildren(): readonly Animation[] {
        return this.children;
    }

    /**
     * Ensures all children are initialized together.
     * This captures start state for all parallel animations at the same moment.
     */
    override ensureInitialized(): void {
        for (const child of this.children) {
            child.ensureInitialized();
        }
    }

    override reset(): void {
        for (const child of this.children) {
            child.reset();
        }
    }

    /**
     * Interpolates all child animations at the given progress.
     * Each child's progress is scaled based on its duration relative to the container.
     */
    interpolate(progress: number): void {
        if (this.children.length === 0 || this.maxChildDuration === 0) {
            return;
        }

        const globalTime = progress * this.maxChildDuration;

        for (const child of this.children) {
            const childDuration = child.getDuration();

            if (childDuration === 0) {
                child.update(1);
                continue;
            }

            // Calculate local progress for this child
            const localProgress = Math.min(1, globalTime / childDuration);
            child.update(localProgress);
        }
    }

    override update(progress: number): void {
        // Pre-initialize ALL children before ANY interpolation
        // This ensures parallel animations capture state at the same moment
        this.ensureInitialized();

        const clampedProgress = Math.max(0, Math.min(1, progress));
        // Composition animations should not apply easing to their children
        this.interpolate(clampedProgress);
    }
}
