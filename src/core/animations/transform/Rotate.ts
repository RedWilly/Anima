import { TransformativeAnimation } from '../categories';
import type { Mobject } from '../../../mobjects/Mobject';

/**
 * Animation that rotates a Mobject by a specified angle.
 * Uses linear interpolation between start and end rotation.
 * 
 * This is a transformative animation - the target must already be in the scene.
 * 
 * @example
 * scene.add(square);
 * scene.play(new Rotate(square, Math.PI / 4));  // Rotate 45 degrees
 */
export class Rotate<T extends Mobject = Mobject> extends TransformativeAnimation<T> {
    private readonly startRotation: number;
    private readonly endRotation: number;

    constructor(target: T, angle: number) {
        super(target);
        this.startRotation = target.rotation;
        this.endRotation = this.startRotation + angle;
    }

    interpolate(progress: number): void {
        const newRotation = this.startRotation + (this.endRotation - this.startRotation) * progress;
        this.target.setRotation(newRotation);
    }

    /** Returns the total rotation angle in radians. */
    getAngle(): number {
        return this.endRotation - this.startRotation;
    }
}
