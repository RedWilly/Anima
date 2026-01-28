import { TransformativeAnimation } from '../categories';
import { Mobject } from '../../../mobjects/Mobject';
import { Vector2 } from '../../math/Vector2/Vector2';

/**
 * Animation that moves a Mobject from its current position to a destination.
 * Uses linear interpolation between start and end positions.
 * 
 * This is a transformative animation - the target must already be in the scene.
 * Start position is captured lazily when animation becomes active.
 * 
 * @example
 * scene.add(circle);  // or use FadeIn first
 * scene.play(new MoveTo(circle, 2, 0));  // Move to (2, 0)
 */
export class MoveTo<T extends Mobject = Mobject> extends TransformativeAnimation<T> {
    private startPosition!: Vector2;
    private readonly endPosition: Vector2;

    constructor(target: T, destination: Vector2);
    constructor(target: T, x: number, y: number);
    constructor(target: T, xOrDestination: number | Vector2, y?: number) {
        super(target);
        if (xOrDestination instanceof Vector2) {
            this.endPosition = xOrDestination;
        } else {
            this.endPosition = new Vector2(xOrDestination, y ?? 0);
        }
    }

    protected captureStartState(): void {
        this.startPosition = this.target.position;
    }

    interpolate(progress: number): void {
        this.ensureInitialized();
        const newPosition = this.startPosition.lerp(this.endPosition, progress);
        this.target.pos(newPosition.x, newPosition.y);
    }

    /** Returns the target position of the move animation. */
    getDestination(): Vector2 {
        return this.endPosition;
    }
}
