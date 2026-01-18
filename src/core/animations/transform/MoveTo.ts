import { TransformativeAnimation } from '../categories';
import { Mobject } from '../../../mobjects/Mobject';
import { Vector2 } from '../../math/Vector2/Vector2';

/**
 * Animation that moves a Mobject from its current position to a destination.
 * Uses linear interpolation between start and end positions.
 * 
 * This is a transformative animation - the target must already be in the scene.
 * 
 * @example
 * scene.add(circle);  // or use FadeIn first
 * scene.play(new MoveTo(circle, 2, 0));  // Move to (2, 0)
 */
export class MoveTo<T extends Mobject = Mobject> extends TransformativeAnimation<T> {
    private readonly startPosition: Vector2;
    private readonly endPosition: Vector2;

    constructor(target: T, destination: Vector2);
    constructor(target: T, x: number, y: number);
    constructor(target: T, xOrDestination: number | Vector2, y?: number) {
        super(target);
        this.startPosition = target.position;
        if (xOrDestination instanceof Vector2) {
            this.endPosition = xOrDestination;
        } else {
            this.endPosition = new Vector2(xOrDestination, y ?? 0);
        }
    }

    interpolate(progress: number): void {
        const newPosition = this.startPosition.lerp(this.endPosition, progress);
        this.target.pos(newPosition.x, newPosition.y);
    }

    /** Returns the target position of the move animation. */
    getDestination(): Vector2 {
        return this.endPosition;
    }
}
