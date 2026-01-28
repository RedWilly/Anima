import { TransformativeAnimation } from '../categories';
import { Mobject } from '../../../mobjects/Mobject';
import { Vector2 } from '../../math/Vector2/Vector2';

/**
 * Animation that scales a Mobject to a target scale factor.
 * Uses linear interpolation between start and end scale.
 * 
 * This is a transformative animation - the target must already be in the scene.
 * Start scale is captured lazily when animation becomes active.
 * 
 * @example
 * scene.add(circle);
 * scene.play(new Scale(circle, 2));  // Scale to 2x
 */
export class Scale<T extends Mobject = Mobject> extends TransformativeAnimation<T> {
    private startScale!: Vector2;
    private readonly endScale: Vector2;

    constructor(target: T, factor: number);
    constructor(target: T, factorX: number, factorY: number);
    constructor(target: T, factorX: number, factorY?: number) {
        super(target);
        const endX = factorX;
        const endY = factorY ?? factorX;
        this.endScale = new Vector2(endX, endY);
    }

    protected captureStartState(): void {
        this.startScale = this.target.scale;
    }

    interpolate(progress: number): void {
        this.ensureInitialized();
        const newScale = this.startScale.lerp(this.endScale, progress);
        this.target.setScale(newScale.x, newScale.y);
    }

    /** Returns the scale factor. */
    getFactor(): number {
        return this.endScale.x;
    }
}
