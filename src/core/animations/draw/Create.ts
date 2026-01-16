import { Animation } from '../Animation';
import { VMobject } from '../../../mobjects/VMobject';
import { BezierPath } from '../../math/bezier/BezierPath';
import { getPartialPath } from './partialPath';

/**
 * Animation that progressively draws a VMobject's paths from start to end.
 * At progress 0, nothing is shown. At progress 1, the complete path is shown.
 */
export class Create<T extends VMobject = VMobject> extends Animation<T> {
    private readonly originalPaths: BezierPath[];
    private readonly originalOpacity: number;

    constructor(target: T) {
        super(target);
        this.originalPaths = target.paths.map(p => p.clone());
        this.originalOpacity = target.opacity;
    }

    interpolate(progress: number): void {
        if (progress <= 0) {
            // Show nothing - set empty paths and hide
            this.target.paths = [];
            this.target.setOpacity(0);
            return;
        }

        if (progress >= 1) {
            // Show complete paths
            this.target.paths = this.originalPaths.map(p => p.clone());
            this.target.setOpacity(this.originalOpacity === 0 ? 1 : this.originalOpacity);
            return;
        }

        // Show partial paths
        this.target.setOpacity(this.originalOpacity === 0 ? 1 : this.originalOpacity);
        const partialPaths: BezierPath[] = [];

        for (const originalPath of this.originalPaths) {
            const partial = getPartialPath(originalPath, progress);
            partialPaths.push(partial);
        }

        this.target.paths = partialPaths;
    }
}
