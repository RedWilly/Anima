import { TransformativeAnimation } from '../categories';
import type { Mobject } from '../../../mobjects/Mobject';

/**
 * Animation that rotates a Mobject by a specified angle.
 * Uses linear interpolation between start and end rotation.
 * 
 * This is a transformative animation - the target must already be in the scene.
 * Start rotation is captured lazily when animation becomes active.
 * 
 * @example
 * scene.add(square);
 * scene.play(new Rotate(square, Math.PI / 4));  // Rotate 45 degrees
 */
export class Rotate<T extends Mobject = Mobject> extends TransformativeAnimation<T> {
    private startRotation!: number;
    private endRotation!: number;
    private readonly angle: number;

    constructor(target: T, angle: number) {
        super(target);
        this.angle = angle;
    }

    protected captureStartState(): void {
        this.startRotation = this.target.rotation;
        this.endRotation = this.startRotation + this.angle;
    }

    interpolate(progress: number): void {
        this.ensureInitialized();
        const newRotation = this.startRotation + (this.endRotation - this.startRotation) * progress;
        this.target.setRotation(newRotation);
    }

    /** Returns the total rotation angle in radians. */
    getAngle(): number {
        return this.angle;
    }
}
