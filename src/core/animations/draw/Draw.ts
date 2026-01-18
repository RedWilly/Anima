import { IntroductoryAnimation } from '../categories';
import { VMobject } from '../../../mobjects/VMobject';
import { BezierPath } from '../../math/bezier/BezierPath';
import { getPartialPath } from './partialPath';

/**
 * Animation that first draws the border progressively, then fills the shape.
 * The first 50% of the animation draws the stroke, the second 50% fades in the fill.
 * 
 * This is an introductory animation - it auto-registers the target with the scene.
 * 
 * @example
 * const rect = new Rectangle(2, 1);
 * scene.play(new Draw(rect));  // Border draws, then fill fades in
 */
export class Draw<T extends VMobject = VMobject> extends IntroductoryAnimation<T> {
    private readonly originalPaths: BezierPath[];
    private readonly originalFillOpacity: number;
    private readonly originalOpacity: number;

    constructor(target: T) {
        super(target);
        this.originalPaths = target.paths.map(p => p.clone());
        this.originalFillOpacity = target.fillOpacity;
        this.originalOpacity = target.opacity;
    }

    /** Interpolates stroke drawing (0-0.5) and then fill fade (0.5-1). */
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
