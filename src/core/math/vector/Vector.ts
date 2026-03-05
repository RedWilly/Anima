/**
 * Unified vector type for both 2D and 3D usage.
 * - 2D vectors use z = 0
 * - 3D vectors use non-zero z when needed
 */
export class Vector {
  readonly x: number;
  readonly y: number;
  readonly z: number;

  constructor(x: number, y: number, z: number = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  add(other: Vector): Vector {
    return new Vector(this.x + other.x, this.y + other.y, this.z + other.z);
  }

  subtract(other: Vector): Vector {
    return new Vector(this.x - other.x, this.y - other.y, this.z - other.z);
  }

  multiply(scalar: number): Vector {
    return new Vector(this.x * scalar, this.y * scalar, this.z * scalar);
  }

  dot(other: Vector): number {
    return this.x * other.x + this.y * other.y + this.z * other.z;
  }

  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  normalize(): Vector {
    const len = this.length();
    if (len === 0) {
      return Vector.ZERO;
    }
    return this.multiply(1 / len);
  }

  lerp(other: Vector, t: number): Vector {
    return this.multiply(1 - t).add(other.multiply(t));
  }

  equals(other: Vector, tolerance: number = 1e-6): boolean {
    return (
      Math.abs(this.x - other.x) < tolerance &&
      Math.abs(this.y - other.y) < tolerance &&
      Math.abs(this.z - other.z) < tolerance
    );
  }

  toPlanar(): Vector {
    return new Vector(this.x, this.y, 0);
  }

  static fromPlanar(v: Vector, z: number = 0): Vector {
    return new Vector(v.x, v.y, z);
  }

  static readonly ZERO = new Vector(0, 0, 0);
  static readonly UP = new Vector(0, -1, 0);
  static readonly DOWN = new Vector(0, 1, 0);
  static readonly LEFT = new Vector(-1, 0, 0);
  static readonly RIGHT = new Vector(1, 0, 0);
}

