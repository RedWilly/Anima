import { IntroductoryAnimation } from '../categories';
import { VMobject } from '../../../mobjects/VMobject';
import { BezierPath } from '../../math/bezier/BezierPath';
import { getPartialPath } from './partialPath';

/**
 * Checks if a VMobject is a VGroup (has getChildren method).
 * Uses duck-typing to avoid circular dependency with VGroup import.
 */
function isVGroup(target: VMobject): target is VMobject & { getChildren(): VMobject[] } {
    return typeof (target as { getChildren?: unknown }).getChildren === 'function';
}

/**
 * Stores original state for a single VMobject (used for VGroup children).
 */
interface ChildState {
    child: VMobject;
    originalPaths: BezierPath[];
    originalOpacity: number;
    originalFillOpacity: number;
}

/**
 * Animation that progressively draws a VMobject's paths from start to end.
 * Preserves both stroke and fill properties - the complete object is visible at the end.
 *
 * This is the canonical animation for progressive path drawing.
 * At progress 0, nothing is shown. At progress 1, the complete path is shown.
 *
 * Supports VGroup (including Text): animates each child's paths progressively.
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
    private readonly isVGroup: boolean;
    /** For non-VGroup targets: original paths on the target itself. */
    private readonly originalPaths: BezierPath[];
    private readonly originalOpacity: number;
    private readonly originalFillOpacity: number;
    /** For VGroup targets: original state of each child. */
    private readonly childStates: ChildState[];

    constructor(target: T) {
        super(target);
        this.isVGroup = isVGroup(target);
        this.originalOpacity = target.opacity;
        this.originalFillOpacity = target.getFillOpacity();

        if (this.isVGroup && isVGroup(target)) {
            // Store original state for each child
            this.originalPaths = [];
            this.childStates = [];
            for (const child of target.getChildren()) {
                this.childStates.push({
                    child,
                    originalPaths: child.paths.map((p: BezierPath) => p.clone()),
                    originalOpacity: child.opacity,
                    originalFillOpacity: child.getFillOpacity(),
                });
            }
        } else {
            // Store original paths on the target itself
            this.originalPaths = target.paths.map(p => p.clone());
            this.childStates = [];
        }
    }

    interpolate(progress: number): void {
        if (this.isVGroup) {
            this.interpolateVGroup(progress);
        } else {
            this.interpolateVMobject(progress);
        }
    }

    /** Interpolates a single VMobject (non-VGroup). */
    private interpolateVMobject(progress: number): void {
        if (progress <= 0) {
            this.target.paths = [];
            this.target.setOpacity(0);
            return;
        }

        // Make visible and preserve original fill opacity
        const targetOpacity = this.originalOpacity === 0 ? 1 : this.originalOpacity;
        this.target.setOpacity(targetOpacity);
        this.target.fill(this.target.getFillColor(), this.originalFillOpacity);

        if (progress >= 1) {
            this.target.paths = this.originalPaths.map(p => p.clone());
            return;
        }

        // Show partial paths
        const partialPaths: BezierPath[] = [];
        for (const originalPath of this.originalPaths) {
            partialPaths.push(getPartialPath(originalPath, progress));
        }
        this.target.paths = partialPaths;
    }

    /** Interpolates a VGroup by animating each child's paths. */
    private interpolateVGroup(progress: number): void {
        // Set parent VGroup opacity
        const targetOpacity = this.originalOpacity === 0 ? 1 : this.originalOpacity;
        this.target.setOpacity(progress <= 0 ? 0 : targetOpacity);

        // Animate each child
        for (const state of this.childStates) {
            const { child, originalPaths, originalOpacity, originalFillOpacity } = state;

            if (progress <= 0) {
                child.paths = [];
                child.setOpacity(0);
                continue;
            }

            // Make child visible
            const childOpacity = originalOpacity === 0 ? 1 : originalOpacity;
            child.setOpacity(childOpacity);
            child.fill(child.getFillColor(), originalFillOpacity);

            if (progress >= 1) {
                child.paths = originalPaths.map(p => p.clone());
                continue;
            }

            // Show partial paths for this child
            const partialPaths: BezierPath[] = [];
            for (const originalPath of originalPaths) {
                partialPaths.push(getPartialPath(originalPath, progress));
            }
            child.paths = partialPaths;
        }
    }
}
