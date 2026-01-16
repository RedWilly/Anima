import { Animation } from '../Animation';
import { Mobject } from '../../../mobjects/Mobject';
import { Vector2 } from '../../math/Vector2/Vector2';

/**
 * Animation that moves a Mobject from its current position to a destination.
 * Uses linear interpolation between start and end positions.
 */
export class MoveTo<T extends Mobject = Mobject> extends Animation<T> {
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
}
