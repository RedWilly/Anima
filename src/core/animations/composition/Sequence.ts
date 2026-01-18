import { Mobject } from '../../../mobjects/Mobject';
import { Animation } from '../Animation';
import type { AnimationLifecycle } from '../types';

/**
 * Executes animations in sequence, one after another.
 * Total duration equals the sum of all child animation durations.
 * 
 * This is a composition animation - its lifecycle is determined by its children.
 */
export class Sequence extends Animation<Mobject> {
    private readonly children: Animation[];
    private readonly childDurations: number[];
    private readonly totalChildDuration: number;

    /**
     * The lifecycle of Sequence is determined by its FIRST child animation.
     * If the first animation is introductory, it will register the target,
     * allowing subsequent transformative animations to work.
     */
    readonly lifecycle: AnimationLifecycle;

    constructor(animations: Animation[]) {
        super(new Mobject());
        this.children = animations;
        this.childDurations = animations.map((a) => a.getDuration());
        this.totalChildDuration = this.childDurations.reduce((sum, d) => sum + d, 0);
        this.durationSeconds = this.totalChildDuration;

        // Lifecycle is determined by FIRST animation in the sequence
        // If first is introductory, it registers the target for subsequent animations
        const first = animations[0];
        this.lifecycle = first?.lifecycle === 'introductory' ? 'introductory' : 'transformative';
    }

    override getDuration(): number {
        return this.durationSeconds;
    }

    getChildren(): readonly Animation[] {
        return this.children;
    }

    /**
     * Interpolates the sequence at the given progress.
     * Maps global progress to the correct child animation.
     */
    interpolate(progress: number): void {
        if (this.children.length === 0 || this.totalChildDuration === 0) {
            return;
        }

        const globalTime = progress * this.totalChildDuration;
        let accumulatedTime = 0;

        for (let i = 0; i < this.children.length; i++) {
            const child = this.children[i];
            const childDuration = this.childDurations[i];

            if (child === undefined || childDuration === undefined) {
                continue;
            }

            const childStart = accumulatedTime;
            const childEnd = accumulatedTime + childDuration;

            if (globalTime < childStart) {
                // Before this child starts - should not happen in normal flow
                child.update(0);
            } else if (globalTime >= childEnd) {
                // This child is complete
                child.update(1);
            } else {
                // This child is active
                const localProgress = (globalTime - childStart) / childDuration;
                child.update(localProgress);
            }

            accumulatedTime = childEnd;
        }
    }
}
