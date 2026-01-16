/**
 * A 2D vector class representing a point or direction in 2D space.
 */
export class Vector2 {
  readonly x: number;
  readonly y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  add(other: Vector2): Vector2 {
    return new Vector2(this.x + other.x, this.y + other.y);
  }

  subtract(other: Vector2): Vector2 {
    return new Vector2(this.x - other.x, this.y - other.y);
  }

  multiply(scalar: number): Vector2 {
    return new Vector2(this.x * scalar, this.y * scalar);
  }

  dot(other: Vector2): number {
    return this.x * other.x + this.y * other.y;
  }

  /** Magnitude (length) of the vector. */
  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /** Returns a normalized unit vector. Returns ZERO for zero-length vectors. */
  normalize(): Vector2 {
    const len = this.length();
    if (len === 0) {
      return Vector2.ZERO;
    }
    return this.multiply(1 / len);
  }

  /** Linearly interpolates between this vector and another. */
  lerp(other: Vector2, t: number): Vector2 {
    return this.multiply(1 - t).add(other.multiply(t));
  }

  equals(other: Vector2, tolerance: number = 1e-6): boolean {
    return Math.abs(this.x - other.x) < tolerance && Math.abs(this.y - other.y) < tolerance;
  }

  static readonly ZERO = new Vector2(0, 0);
  static readonly UP = new Vector2(0, -1);
  static readonly DOWN = new Vector2(0, 1);
  static readonly LEFT = new Vector2(-1, 0);
  static readonly RIGHT = new Vector2(1, 0);
}
