import { Mobject } from '../../../mobjects/Mobject';
import { Animation } from '../Animation';

/**
 * Executes animations in parallel, all starting at the same time.
 * Total duration equals the maximum of all child animation durations.
 */
export class Parallel extends Animation<Mobject> {
    private readonly children: Animation[];
    private readonly maxChildDuration: number;

    constructor(animations: Animation[]) {
        super(new Mobject());
        this.children = animations;
        this.maxChildDuration = animations.reduce(
            (max, a) => Math.max(max, a.getDuration()),
            0
        );
        this.durationSeconds = this.maxChildDuration;
    }

    /** Returns the total duration (max of all child durations). */
    override getDuration(): number {
        return this.durationSeconds;
    }

    /** Returns the child animations. */
    getChildren(): readonly Animation[] {
        return this.children;
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
}
