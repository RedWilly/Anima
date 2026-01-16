import { Animation } from '../Animation';
import { VMobject } from '../../../mobjects/VMobject';
import { BezierPath } from '../../math/bezier/BezierPath';
import { getPartialPath } from './partialPath';

/**
 * Animation that simulates erasing by progressively removing the stroke.
 * Reverse of Write animation - at progress 0, full stroke is visible;
 * at progress 1, nothing is visible.
 */
export class Unwrite<T extends VMobject = VMobject> extends Animation<T> {
    private readonly originalPaths: BezierPath[];
    private readonly originalOpacity: number;

    constructor(target: T) {
        super(target);
        this.originalPaths = target.paths.map(p => p.clone());
        this.originalOpacity = target.opacity;
    }

    /**
     * Interpolates the unwrite animation - progressively erases stroke.
     * @param progress Eased progress value in [0, 1].
     */
    interpolate(progress: number): void {
        if (progress >= 1) {
            // Complete - show nothing
            this.target.paths = [];
            this.target.setOpacity(0);
            return;
        }

        if (progress <= 0) {
            // Start - show full stroke
            this.target.paths = this.originalPaths.map(p => p.clone());
            const targetOpacity = this.originalOpacity === 0 ? 1 : this.originalOpacity;
            this.target.setOpacity(targetOpacity);
            return;
        }

        // Show partial stroke (reverse progress)
        const reverseProgress = 1 - progress;
        const targetOpacity = this.originalOpacity === 0 ? 1 : this.originalOpacity;
        this.target.setOpacity(targetOpacity);
        this.target.fillOpacity = 0;

        const partialPaths: BezierPath[] = [];

        for (const originalPath of this.originalPaths) {
            const partial = getPartialPath(originalPath, reverseProgress);
            partialPaths.push(partial);
        }

        this.target.paths = partialPaths;
    }
}
