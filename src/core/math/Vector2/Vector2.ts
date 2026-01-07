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

  /**
   * Adds another vector to this one.
   * @param other The vector to add.
   * @returns A new Vector2 representing the sum.
   */
  add(other: Vector2): Vector2 {
    return new Vector2(this.x + other.x, this.y + other.y);
  }

  /**
   * Subtracts another vector from this one.
   * @param other The vector to subtract.
   * @returns A new Vector2 representing the difference.
   */
  subtract(other: Vector2): Vector2 {
    return new Vector2(this.x - other.x, this.y - other.y);
  }

  /**
   * Multiplies this vector by a scalar value.
   * @param scalar The scalar to multiply by.
   * @returns A new Vector2 scaled by the scalar.
   */
  multiply(scalar: number): Vector2 {
    return new Vector2(this.x * scalar, this.y * scalar);
  }

  /**
   * Calculates the dot product of this vector and another.
   * @param other The other vector.
   * @returns The dot product.
   */
  dot(other: Vector2): number {
    return this.x * other.x + this.y * other.y;
  }

  /**
   * Calculates the magnitude (length) of the vector.
   * @returns The length of the vector.
   */
  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * Returns a normalized version of this vector (unit vector).
   * @returns A new Vector2 with length 1.
   */
  normalize(): Vector2 {
    const len = this.length();
    if (len === 0) {
      return Vector2.ZERO;
    }
    return this.multiply(1 / len);
  }

  /**
   * Linearly interpolates between this vector and another.
   * @param other The target vector.
   * @param t The interpolation factor (0-1).
   * @returns The interpolated vector.
   */
  lerp(other: Vector2, t: number): Vector2 {
    return this.multiply(1 - t).add(other.multiply(t));
  }

  /**
   * Checks if this vector is equal to another.
   * @param other The vector to compare.
   * @param tolerance The tolerance for equality check.
   * @returns True if equal, false otherwise.
   */
  equals(other: Vector2, tolerance: number = 1e-6): boolean {
    return Math.abs(this.x - other.x) < tolerance && Math.abs(this.y - other.y) < tolerance;
  }

  static readonly ZERO = new Vector2(0, 0);
  static readonly UP = new Vector2(0, -1);
  static readonly DOWN = new Vector2(0, 1);
  static readonly LEFT = new Vector2(-1, 0);
  static readonly RIGHT = new Vector2(1, 0);
}
