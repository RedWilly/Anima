import { Animation } from '../Animation';
import { VMobject } from '../../../mobjects/VMobject';
import { BezierPath } from '../../math/bezier/BezierPath';
import { getPartialPath } from './partialPath';

/**
 * Animation that first draws the border progressively, then fills the shape.
 * The first 50% of the animation draws the stroke, the second 50% fades in the fill.
 */
export class Draw<T extends VMobject = VMobject> extends Animation<T> {
    private readonly originalPaths: BezierPath[];
    private readonly originalFillOpacity: number;
    private readonly originalOpacity: number;

    constructor(target: T) {
        super(target);
        this.originalPaths = target.paths.map(p => p.clone());
        this.originalFillOpacity = target.fillOpacity;
        this.originalOpacity = target.opacity;
    }

    /**
     * Interpolates the draw animation.
     * First half (0-0.5): draws stroke progressively
     * Second half (0.5-1): fills shape with opacity fade
     * @param progress Eased progress value in [0, 1].
     */
    interpolate(progress: number): void {
        // Make target visible
        const targetOpacity = this.originalOpacity === 0 ? 1 : this.originalOpacity;

        if (progress <= 0) {
            this.target.paths = [];
            this.target.setOpacity(0);
            this.target.fillOpacity = 0;
            return;
        }

        this.target.setOpacity(targetOpacity);

        if (progress < 0.5) {
            // First half: draw stroke progressively, no fill
            const strokeProgress = progress * 2; // Scale 0-0.5 to 0-1
            const partialPaths: BezierPath[] = [];

            for (const originalPath of this.originalPaths) {
                const partial = getPartialPath(originalPath, strokeProgress);
                partialPaths.push(partial);
            }

            this.target.paths = partialPaths;
            this.target.fillOpacity = 0;
        } else {
            // Second half: full stroke, fade in fill
            this.target.paths = this.originalPaths.map(p => p.clone());
            const fillProgress = (progress - 0.5) * 2; // Scale 0.5-1 to 0-1
            this.target.fillOpacity = this.originalFillOpacity * fillProgress;
        }
    }
}
