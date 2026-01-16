import { Animation } from '../Animation';
import { VMobject } from '../../../mobjects/VMobject';
import { BezierPath } from '../../math/bezier/BezierPath';
import { getPartialPath } from './partialPath';

/**
 * Animation that progressively draws a VMobject by revealing the stroke.
 * Preserves both stroke and fill properties - the complete object is visible at the end.
 * Similar to Create but commonly used for Text objects.
 */
export class Write<T extends VMobject = VMobject> extends Animation<T> {
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
     * Interpolates the write animation - progressively draws the path.
     * @param progress Eased progress value in [0, 1].
     */
    interpolate(progress: number): void {
        if (progress <= 0) {
            this.target.paths = [];
            this.target.setOpacity(0);
            return;
        }

        // Make visible and preserve original fill opacity
        const targetOpacity = this.originalOpacity === 0 ? 1 : this.originalOpacity;
        this.target.setOpacity(targetOpacity);
        this.target.fillOpacity = this.originalFillOpacity;

        if (progress >= 1) {
            // Complete - show full paths
            this.target.paths = this.originalPaths.map(p => p.clone());
            return;
        }

        // Show partial paths
        const partialPaths: BezierPath[] = [];

        for (const originalPath of this.originalPaths) {
            const partial = getPartialPath(originalPath, progress);
            partialPaths.push(partial);
        }

        this.target.paths = partialPaths;
    }
}
