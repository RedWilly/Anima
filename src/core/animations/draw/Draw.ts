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
 * Animation that first draws the border progressively, then fills the shape.
 * The first 50% of the animation draws the stroke, the second 50% fades in the fill.
 *
 * Supports VGroup (including Text): animates each child's paths progressively.
 *
 * This is an introductory animation - it auto-registers the target with the scene.
 *
 * @example
 * const rect = new Rectangle(2, 1);
 * scene.play(new Draw(rect));  // Border draws, then fill fades in
 */
export class Draw<T extends VMobject = VMobject> extends IntroductoryAnimation<T> {
    private readonly isVGroup: boolean;
    /** For non-VGroup targets: original paths on the target itself. */
    private readonly originalPaths: BezierPath[];
    private readonly originalFillOpacity: number;
    private readonly originalOpacity: number;
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

    /** Interpolates stroke drawing (0-0.5) and then fill fade (0.5-1). */
    interpolate(progress: number): void {
        if (this.isVGroup) {
            this.interpolateVGroup(progress);
        } else {
            this.interpolateVMobject(progress);
        }
    }

    /** Interpolates a single VMobject (non-VGroup). */
    private interpolateVMobject(progress: number): void {
        const targetOpacity = this.originalOpacity === 0 ? 1 : this.originalOpacity;

        if (progress <= 0) {
            this.target.paths = [];
            this.target.setOpacity(0);
            this.target.fill(this.target.getFillColor(), 0);
            return;
        }

        this.target.setOpacity(targetOpacity);

        if (progress < 0.5) {
            // First half: draw stroke progressively, no fill
            const strokeProgress = progress * 2;
            const partialPaths: BezierPath[] = [];
            for (const originalPath of this.originalPaths) {
                partialPaths.push(getPartialPath(originalPath, strokeProgress));
            }
            this.target.paths = partialPaths;
            this.target.fill(this.target.getFillColor(), 0);
        } else {
            // Second half: full stroke, fade in fill
            this.target.paths = this.originalPaths.map(p => p.clone());
            const fillProgress = (progress - 0.5) * 2;
            this.target.fill(this.target.getFillColor(), this.originalFillOpacity * fillProgress);
        }
    }

    /** Interpolates a VGroup by animating each child's paths. */
    private interpolateVGroup(progress: number): void {
        const targetOpacity = this.originalOpacity === 0 ? 1 : this.originalOpacity;
        this.target.setOpacity(progress <= 0 ? 0 : targetOpacity);

        for (const state of this.childStates) {
            const { child, originalPaths, originalOpacity, originalFillOpacity } = state;
            const childOpacity = originalOpacity === 0 ? 1 : originalOpacity;

            if (progress <= 0) {
                child.paths = [];
                child.setOpacity(0);
                child.fill(child.getFillColor(), 0);
                continue;
            }

            child.setOpacity(childOpacity);

            if (progress < 0.5) {
                // First half: draw stroke progressively, no fill
                const strokeProgress = progress * 2;
                const partialPaths: BezierPath[] = [];
                for (const originalPath of originalPaths) {
                    partialPaths.push(getPartialPath(originalPath, strokeProgress));
                }
                child.paths = partialPaths;
                child.fill(child.getFillColor(), 0);
            } else {
                // Second half: full stroke, fade in fill
                child.paths = originalPaths.map(p => p.clone());
                const fillProgress = (progress - 0.5) * 2;
                child.fill(child.getFillColor(), originalFillOpacity * fillProgress);
            }
        }
    }
}
