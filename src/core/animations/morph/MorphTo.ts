import { TransformativeAnimation } from '../LifecycleAnimations';
import type { VMobject } from '../../mobjects';
import { BezierPath, Color } from '../../math';

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
    private sourceStrokeColor!: Color;
    private sourceStrokeWidth!: number;
    private sourceFillColor!: Color;
    private sourceFillOpacity!: number;
    private readonly targetStrokeColor: Color;
    private readonly targetStrokeWidth: number;
    private readonly targetFillColor: Color;
    private readonly targetFillOpacity: number;

    constructor(source: T, target: VMobject) {
        super(source);
        this.targetPaths = target.paths.map(p => p.clone());
        this.targetStrokeColor = target.getStrokeColor();
        this.targetStrokeWidth = target.getStrokeWidth();
        this.targetFillColor = target.getFillColor();
        this.targetFillOpacity = target.getFillOpacity();
    }

    protected captureStartState(): void {
        this.sourcePaths = this.target.paths.map(p => p.clone());
        this.sourceStrokeColor = this.target.getStrokeColor();
        this.sourceStrokeWidth = this.target.getStrokeWidth();
        this.sourceFillColor = this.target.getFillColor();
        this.sourceFillOpacity = this.target.getFillOpacity();
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
        const strokeColor = this.sourceStrokeColor.lerp(this.targetStrokeColor, progress);
        const strokeWidth = this.sourceStrokeWidth + (this.targetStrokeWidth - this.sourceStrokeWidth) * progress;
        const fillColor = this.sourceFillColor.lerp(this.targetFillColor, progress);
        const fillOpacity = this.sourceFillOpacity + (this.targetFillOpacity - this.sourceFillOpacity) * progress;

        this.target.stroke(strokeColor, strokeWidth);
        this.target.fill(fillColor, fillOpacity);
    }

    private getEmptyPath(): BezierPath {
        const path = new BezierPath();
        path.moveTo(this.target.position);
        return path;
    }
}
