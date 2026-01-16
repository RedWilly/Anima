import { Animation } from '../Animation';
import { VMobject } from '../../../mobjects/VMobject';
import { BezierPath } from '../../math/bezier/BezierPath';
import { getPartialPath } from './partialPath';

/**
 * Animation that progressively removes a VMobject by erasing the path.
 * Reverse of Write animation - at progress 0, full object is visible;
 * at progress 1, nothing is visible.
 * Preserves both stroke and fill properties during the animation.
 */
export class Unwrite<T extends VMobject = VMobject> extends Animation<T> {
    private readonly originalPaths: BezierPath[];
    private readonly originalOpacity: number;
    private readonly originalFillOpacity: number;

    constructor(target: T) {
        super(target);
        this.originalPaths = target.paths.map(p => p.clone());
        this.originalOpacity = target.opacity;
        this.originalFillOpacity = target.fillOpacity;
    }

    /**
     * Interpolates the unwrite animation - progressively erases the path.
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
            // Start - show full paths
            this.target.paths = this.originalPaths.map(p => p.clone());
            const targetOpacity = this.originalOpacity === 0 ? 1 : this.originalOpacity;
            this.target.setOpacity(targetOpacity);
            this.target.fillOpacity = this.originalFillOpacity;
            return;
        }

        // Show partial paths (reverse progress)
        const reverseProgress = 1 - progress;
        const targetOpacity = this.originalOpacity === 0 ? 1 : this.originalOpacity;
        this.target.setOpacity(targetOpacity);
        this.target.fillOpacity = this.originalFillOpacity;

        const partialPaths: BezierPath[] = [];

        for (const originalPath of this.originalPaths) {
            const partial = getPartialPath(originalPath, reverseProgress);
            partialPaths.push(partial);
        }

        this.target.paths = partialPaths;
    }
}
