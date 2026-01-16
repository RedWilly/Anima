import { Animation } from '../Animation';
import { VMobject } from '../../../mobjects/VMobject';
import { BezierPath } from '../../math/bezier/BezierPath';

/**
 * Animation that morphs a VMobject from its current shape to a target shape.
 * Uses BezierPath interpolation for smooth path transitions.
 */
export class MorphTo<T extends VMobject = VMobject> extends Animation<T> {
    private readonly sourcePaths: BezierPath[];
    private readonly targetPaths: BezierPath[];

    constructor(source: T, target: VMobject) {
        super(source);
        this.sourcePaths = source.paths.map(p => p.clone());
        this.targetPaths = target.paths.map(p => p.clone());
    }

    interpolate(progress: number): void {
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
