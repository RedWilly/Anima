import { Vector2 } from '../Vector2';

/**
 * A 3D vector class representing a point or direction in 3D space.
 */
export class Vector3 {
    readonly x: number;
    readonly y: number;
    readonly z: number;

    constructor(x: number, y: number, z: number = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    add(other: Vector3): Vector3 {
        return new Vector3(this.x + other.x, this.y + other.y, this.z + other.z);
    }

    subtract(other: Vector3): Vector3 {
        return new Vector3(this.x - other.x, this.y - other.y, this.z - other.z);
    }

    multiply(scalar: number): Vector3 {
        return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
    }

    dot(other: Vector3): number {
        return this.x * other.x + this.y * other.y + this.z * other.z;
    }

    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    normalize(): Vector3 {
        const len = this.length();
        if (len === 0) {
            return Vector3.ZERO;
        }
        return this.multiply(1 / len);
    }

    lerp(other: Vector3, t: number): Vector3 {
        return this.multiply(1 - t).add(other.multiply(t));
    }

    toVector2(): Vector2 {
        return new Vector2(this.x, this.y);
    }

    static fromVector2(v: Vector2, z: number = 0): Vector3 {
        return new Vector3(v.x, v.y, z);
    }

    equals(other: Vector3, tolerance: number = 1e-6): boolean {
        return (
            Math.abs(this.x - other.x) < tolerance &&
            Math.abs(this.y - other.y) < tolerance &&
            Math.abs(this.z - other.z) < tolerance
        );
    }

    static readonly ZERO = new Vector3(0, 0, 0);
}

