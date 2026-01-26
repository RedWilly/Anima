import { IntroductoryAnimation } from '../categories';
import { VMobject } from '../../../mobjects/VMobject';
import { BezierPath } from '../../math/bezier/BezierPath';
import { getPartialPath } from './partialPath';

/**
 * Animation that progressively draws a VMobject's paths from start to end.
 * Preserves both stroke and fill properties - the complete object is visible at the end.
 *
 * This is the canonical animation for progressive path drawing.
 * At progress 0, nothing is shown. At progress 1, the complete path is shown.
 *
 * This is an introductory animation - it auto-registers the target with the scene.
 *
 * @example
 * const circle = new Circle(1);
 * scene.play(new Write(circle));  // Circle is drawn progressively
 *
 * const text = new Text('Hello');
 * scene.play(new Write(text));  // Text is written progressively
 */
export class Write<T extends VMobject = VMobject> extends IntroductoryAnimation<T> {
    private readonly originalPaths: BezierPath[];
    private readonly originalOpacity: number;
    private readonly originalFillOpacity: number;

    constructor(target: T) {
        super(target);
        this.originalPaths = target.paths.map(p => p.clone());
        this.originalOpacity = target.opacity;
        this.originalFillOpacity = target.fillOpacity;
    }

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
