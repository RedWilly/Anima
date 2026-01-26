import { ExitAnimation } from '../categories';
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
 * Animation that progressively removes a VMobject by erasing the path.
 * Reverse of Write animation - at progress 0, full object is visible;
 * at progress 1, nothing is visible.
 *
 * Supports VGroup (including Text): animates each child's paths progressively.
 *
 * This is an exit animation - the target must already be in the scene.
 *
 * @example
 * scene.play(new Write(text));
 * scene.play(new Unwrite(text));  // Text is erased progressively
 */
export class Unwrite<T extends VMobject = VMobject> extends ExitAnimation<T> {
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
        if (progress >= 1) {
            this.target.paths = [];
            this.target.setOpacity(0);
            return;
        }

        if (progress <= 0) {
            this.target.paths = this.originalPaths.map(p => p.clone());
            const targetOpacity = this.originalOpacity === 0 ? 1 : this.originalOpacity;
            this.target.setOpacity(targetOpacity);
            this.target.fill(this.target.getFillColor(), this.originalFillOpacity);
            return;
        }

        // Show partial paths (reverse progress)
        const reverseProgress = 1 - progress;
        const targetOpacity = this.originalOpacity === 0 ? 1 : this.originalOpacity;
        this.target.setOpacity(targetOpacity);
        this.target.fill(this.target.getFillColor(), this.originalFillOpacity);

        const partialPaths: BezierPath[] = [];
        for (const originalPath of this.originalPaths) {
            partialPaths.push(getPartialPath(originalPath, reverseProgress));
        }
        this.target.paths = partialPaths;
    }

    /** Interpolates a VGroup by animating each child's paths. */
    private interpolateVGroup(progress: number): void {
        if (progress >= 1) {
            this.target.setOpacity(0);
            for (const state of this.childStates) {
                state.child.paths = [];
                state.child.setOpacity(0);
            }
            return;
        }

        const targetOpacity = this.originalOpacity === 0 ? 1 : this.originalOpacity;
        this.target.setOpacity(targetOpacity);

        for (const state of this.childStates) {
            const { child, originalPaths, originalOpacity, originalFillOpacity } = state;
            const childOpacity = originalOpacity === 0 ? 1 : originalOpacity;

            if (progress <= 0) {
                child.paths = originalPaths.map(p => p.clone());
                child.setOpacity(childOpacity);
                child.fill(child.getFillColor(), originalFillOpacity);
                continue;
            }

            // Show partial paths (reverse progress)
            const reverseProgress = 1 - progress;
            child.setOpacity(childOpacity);
            child.fill(child.getFillColor(), originalFillOpacity);

            const partialPaths: BezierPath[] = [];
            for (const originalPath of originalPaths) {
                partialPaths.push(getPartialPath(originalPath, reverseProgress));
            }
            child.paths = partialPaths;
        }
    }
}
