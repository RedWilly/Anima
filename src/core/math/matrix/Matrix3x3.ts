import { Vector2 } from '../Vector2/Vector2';
import {
    createIdentity,
    createTranslation,
    createRotation,
    createScale,
    createShear
} from './factories';

/**
 * A 3x3 matrix class for 2D affine transformations.
 * Stored in row-major order:
 * [ 0  1  2 ]
 * [ 3  4  5 ]
 * [ 6  7  8 ]
 */
export class Matrix3x3 {
    readonly values: Float32Array;

    constructor(values: number[] | Float32Array) {
        if (values.length !== 9) {
            throw new Error('Matrix3x3 requires 9 values');
        }
        this.values = new Float32Array(values);
    }

    multiply(other: Matrix3x3): Matrix3x3 {
        const a = this.values;
        const b = other.values;
        const out = new Float32Array(9);

        const a00 = a[0]!, a01 = a[1]!, a02 = a[2]!;
        const a10 = a[3]!, a11 = a[4]!, a12 = a[5]!;
        const a20 = a[6]!, a21 = a[7]!, a22 = a[8]!;

        const b00 = b[0]!, b01 = b[1]!, b02 = b[2]!;
        const b10 = b[3]!, b11 = b[4]!, b12 = b[5]!;
        const b20 = b[6]!, b21 = b[7]!, b22 = b[8]!;

        out[0] = a00 * b00 + a01 * b10 + a02 * b20;
        out[1] = a00 * b01 + a01 * b11 + a02 * b21;
        out[2] = a00 * b02 + a01 * b12 + a02 * b22;
        out[3] = a10 * b00 + a11 * b10 + a12 * b20;
        out[4] = a10 * b01 + a11 * b11 + a12 * b21;
        out[5] = a10 * b02 + a11 * b12 + a12 * b22;
        out[6] = a20 * b00 + a21 * b10 + a22 * b20;
        out[7] = a20 * b01 + a21 * b11 + a22 * b21;
        out[8] = a20 * b02 + a21 * b12 + a22 * b22;

        return new Matrix3x3(out);
    }

    /** Transforms a Vector2 point (assumes z=1). */
    transformPoint(point: Vector2): Vector2 {
        const m = this.values;
        const x = point.x;
        const y = point.y;

        const m00 = m[0]!, m01 = m[1]!, m02 = m[2]!;
        const m10 = m[3]!, m11 = m[4]!, m12 = m[5]!;

        const tx = m00 * x + m01 * y + m02;
        const ty = m10 * x + m11 * y + m12;

        return new Vector2(tx, ty);
    }

    /** @throws Error if the matrix is not invertible. */
    inverse(): Matrix3x3 {
        const m = this.values;

        const m00 = m[0]!, m01 = m[1]!, m02 = m[2]!;
        const m10 = m[3]!, m11 = m[4]!, m12 = m[5]!;
        const m20 = m[6]!, m21 = m[7]!, m22 = m[8]!;

        const det =
            m00 * (m11 * m22 - m12 * m21) -
            m01 * (m10 * m22 - m12 * m20) +
            m02 * (m10 * m21 - m11 * m20);

        if (Math.abs(det) < 1e-10) {
            throw new Error('Matrix is not invertible');
        }

        const invDet = 1.0 / det;
        const out = new Float32Array(9);

        out[0] = (m11 * m22 - m12 * m21) * invDet;
        out[1] = (m02 * m21 - m01 * m22) * invDet;
        out[2] = (m01 * m12 - m02 * m11) * invDet;
        out[3] = (m12 * m20 - m10 * m22) * invDet;
        out[4] = (m00 * m22 - m02 * m20) * invDet;
        out[5] = (m02 * m10 - m00 * m12) * invDet;
        out[6] = (m10 * m21 - m11 * m20) * invDet;
        out[7] = (m01 * m20 - m00 * m21) * invDet;
        out[8] = (m00 * m11 - m01 * m10) * invDet;

        return new Matrix3x3(out);
    }

    static identity(): Matrix3x3 {
        return Matrix3x3.IDENTITY;
    }

    static translation(tx: number, ty: number): Matrix3x3 {
        return new Matrix3x3(createTranslation(tx, ty));
    }

    static rotation(angle: number): Matrix3x3 {
        return new Matrix3x3(createRotation(angle));
    }

    static scale(sx: number, sy: number): Matrix3x3 {
        return new Matrix3x3(createScale(sx, sy));
    }

    static shear(shx: number, shy: number): Matrix3x3 {
        return new Matrix3x3(createShear(shx, shy));
    }

    static readonly IDENTITY = new Matrix3x3(createIdentity());
}
