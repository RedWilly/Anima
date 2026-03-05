import { TransformativeAnimation } from '../LifecycleAnimations';
import type { Mobject } from '../../mobjects';
import { Vector } from '../../math';

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
  private startPosition!: Vector;
  private readonly endPosition: Vector;

  constructor(target: T, destination: Vector);
  constructor(target: T, x: number, y: number, z?: number);
  constructor(target: T, xOrDestination: number | Vector, y?: number, z?: number) {
    super(target);

    if (typeof xOrDestination !== 'number') {
      this.endPosition = xOrDestination;
      return;
    }

    this.endPosition = new Vector(xOrDestination, y ?? 0, z ?? 0);
  }

  protected captureStartState(): void {
    this.startPosition = this.target.position;
  }

  interpolate(progress: number): void {
    this.ensureInitialized();
    const newPosition = this.startPosition.lerp(this.endPosition, progress);
    this.target.pos(newPosition.x, newPosition.y, newPosition.z);
  }

  /** Returns the target position of the move animation. */
  getDestination(): Vector {
    return this.endPosition;
  }
}

