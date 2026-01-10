import { Animation } from '../Animation';
import { Mobject } from '../../../mobjects/Mobject';

/**
 * Animation that rotates a Mobject by a specified angle.
 * Uses linear interpolation between start and end rotation.
 */
export class Rotate<T extends Mobject = Mobject> extends Animation<T> {
    private readonly startRotation: number;
    private readonly endRotation: number;

    /**
     * Creates a Rotate animation.
     * @param target The Mobject to rotate.
     * @param angle The rotation angle in radians.
     */
    constructor(target: T, angle: number) {
        super(target);
        this.startRotation = target.rotation;
        this.endRotation = this.startRotation + angle;
    }

    /**
     * Interpolates the rotation from start to end.
     * @param progress Eased progress value in [0, 1].
     */
    interpolate(progress: number): void {
        const newRotation = this.startRotation + (this.endRotation - this.startRotation) * progress;
        this.target.setRotation(newRotation);
    }
}
