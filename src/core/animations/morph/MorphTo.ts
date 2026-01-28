import { TransformativeAnimation } from '../categories';
import { VMobject } from '../../../mobjects/VMobject';
import { BezierPath } from '../../math/bezier/BezierPath';

/**
 * Animation that morphs a VMobject from its current shape to a target shape.
 * Uses BezierPath interpolation for smooth path transitions.
 * 
 * This is a transformative animation - the source must already be in the scene.
 * The target VMobject is used only as a shape template and is NOT added to the scene.
 * Source paths are captured lazily when animation becomes active.
 * 
 * @example
 * scene.add(circle);
 * scene.play(new MorphTo(circle, square));  // circle morphs into square's shape
 */
export class MorphTo<T extends VMobject = VMobject> extends TransformativeAnimation<T> {
    private sourcePaths!: BezierPath[];
    private readonly targetPaths: BezierPath[];

    constructor(source: T, target: VMobject) {
        super(source);
        this.targetPaths = target.paths.map(p => p.clone());
    }

    protected captureStartState(): void {
        this.sourcePaths = this.target.paths.map(p => p.clone());
    }

    interpolate(progress: number): void {
        this.ensureInitialized();
        const maxPaths = Math.max(this.sourcePaths.length, this.targetPaths.length);
        const newPaths: BezierPath[] = [];

        for (let i = 0; i < maxPaths; i++) {
            const sourcePath = this.sourcePaths[i] ?? this.getEmptyPath();
            const targetPath = this.targetPaths[i] ?? this.getEmptyPath();
            const interpolated = BezierPath.interpolate(sourcePath, targetPath, progress);
            newPaths.push(interpolated);
        }

        this.target.paths = newPaths;
    }

    private getEmptyPath(): BezierPath {
        const path = new BezierPath();
        path.moveTo(this.target.position);
        return path;
    }
}
