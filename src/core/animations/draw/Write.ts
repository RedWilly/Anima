import { Animation } from '../Animation';
import { VMobject } from '../../../mobjects/VMobject';
import { BezierPath } from '../../math/bezier/BezierPath';
import { getPartialPath } from './partialPath';

/**
 * Animation that simulates hand-writing by progressively drawing the stroke.
 * Only shows stroke, not fill - ideal for text and handwriting effects.
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
     * Interpolates the write animation - progressively draws stroke only.
     * @param progress Eased progress value in [0, 1].
     */
    interpolate(progress: number): void {
        if (progress <= 0) {
            this.target.paths = [];
            this.target.setOpacity(0);
            return;
        }

        // Make visible and disable fill for writing effect
        const targetOpacity = this.originalOpacity === 0 ? 1 : this.originalOpacity;
        this.target.setOpacity(targetOpacity);
        this.target.fillOpacity = 0;

        if (progress >= 1) {
            // Complete - show full stroke
            this.target.paths = this.originalPaths.map(p => p.clone());
            return;
        }

        // Show partial stroke
        const partialPaths: BezierPath[] = [];

        for (const originalPath of this.originalPaths) {
            const partial = getPartialPath(originalPath, progress);
            partialPaths.push(partial);
        }

        this.target.paths = partialPaths;
    }
}
