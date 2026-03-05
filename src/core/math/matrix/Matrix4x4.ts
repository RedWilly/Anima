import { Vector } from '../vector';

/**
 * A 4x4 matrix class for 3D affine transforms and projection.
 * Stored in row-major order.
 */
export class Matrix4x4 {
    readonly values: Float32Array;

    constructor(values: number[] | Float32Array) {
        if (values.length !== 16) {
            throw new Error('Matrix4x4 requires 16 values');
        }
        this.values = new Float32Array(values);
    }

    multiply(other: Matrix4x4): Matrix4x4 {
        const a = this.values;
        const b = other.values;
        const out = new Float32Array(16);

        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                let sum = 0;
                for (let k = 0; k < 4; k++) {
                    sum += a[row * 4 + k]! * b[k * 4 + col]!;
                }
                out[row * 4 + col] = sum;
            }
        }

        return new Matrix4x4(out);
    }

    transformPoint(point: Vector): Vector {
        const m = this.values;
        const x = point.x;
        const y = point.y;
        const z = point.z;

        const tx = m[0]! * x + m[1]! * y + m[2]! * z + m[3]!;
        const ty = m[4]! * x + m[5]! * y + m[6]! * z + m[7]!;
        const tz = m[8]! * x + m[9]! * y + m[10]! * z + m[11]!;
        const tw = m[12]! * x + m[13]! * y + m[14]! * z + m[15]!;

        if (Math.abs(tw) < 1e-10 || Math.abs(tw - 1) < 1e-10) {
            return new Vector(tx, ty, tz);
        }

        return new Vector(tx / tw, ty / tw, tz / tw);
    }

    transformPoint2D(point: Vector): Vector {
        const transformed = this.transformPoint(Vector.fromPlanar(point, 0));
        return transformed.toPlanar();
    }

    inverse(): Matrix4x4 {
        const m = this.values;
        const out = new Float32Array(16);

        const m00 = m[0]!, m01 = m[1]!, m02 = m[2]!, m03 = m[3]!;
        const m10 = m[4]!, m11 = m[5]!, m12 = m[6]!, m13 = m[7]!;
        const m20 = m[8]!, m21 = m[9]!, m22 = m[10]!, m23 = m[11]!;
        const m30 = m[12]!, m31 = m[13]!, m32 = m[14]!, m33 = m[15]!;

        const b00 = m00 * m11 - m01 * m10;
        const b01 = m00 * m12 - m02 * m10;
        const b02 = m00 * m13 - m03 * m10;
        const b03 = m01 * m12 - m02 * m11;
        const b04 = m01 * m13 - m03 * m11;
        const b05 = m02 * m13 - m03 * m12;
        const b06 = m20 * m31 - m21 * m30;
        const b07 = m20 * m32 - m22 * m30;
        const b08 = m20 * m33 - m23 * m30;
        const b09 = m21 * m32 - m22 * m31;
        const b10 = m21 * m33 - m23 * m31;
        const b11 = m22 * m33 - m23 * m32;

        const det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
        if (Math.abs(det) < 1e-10) {
            throw new Error('Matrix is not invertible');
        }
        const invDet = 1 / det;

        out[0] = (m11 * b11 - m12 * b10 + m13 * b09) * invDet;
        out[1] = (m02 * b10 - m01 * b11 - m03 * b09) * invDet;
        out[2] = (m31 * b05 - m32 * b04 + m33 * b03) * invDet;
        out[3] = (m22 * b04 - m21 * b05 - m23 * b03) * invDet;
        out[4] = (m12 * b08 - m10 * b11 - m13 * b07) * invDet;
        out[5] = (m00 * b11 - m02 * b08 + m03 * b07) * invDet;
        out[6] = (m32 * b02 - m30 * b05 - m33 * b01) * invDet;
        out[7] = (m20 * b05 - m22 * b02 + m23 * b01) * invDet;
        out[8] = (m10 * b10 - m11 * b08 + m13 * b06) * invDet;
        out[9] = (m01 * b08 - m00 * b10 - m03 * b06) * invDet;
        out[10] = (m30 * b04 - m31 * b02 + m33 * b00) * invDet;
        out[11] = (m21 * b02 - m20 * b04 - m23 * b00) * invDet;
        out[12] = (m11 * b07 - m10 * b09 - m12 * b06) * invDet;
        out[13] = (m00 * b09 - m01 * b07 + m02 * b06) * invDet;
        out[14] = (m31 * b01 - m30 * b03 - m32 * b00) * invDet;
        out[15] = (m20 * b03 - m21 * b01 + m22 * b00) * invDet;

        return new Matrix4x4(out);
    }

    static identity(): Matrix4x4 {
        return Matrix4x4.IDENTITY;
    }

    static translation(tx: number, ty: number, tz: number = 0): Matrix4x4 {
        return new Matrix4x4([
            1, 0, 0, tx,
            0, 1, 0, ty,
            0, 0, 1, tz,
            0, 0, 0, 1,
        ]);
    }

    static rotationX(angle: number): Matrix4x4 {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        return new Matrix4x4([
            1, 0, 0, 0,
            0, c, -s, 0,
            0, s, c, 0,
            0, 0, 0, 1,
        ]);
    }

    static rotationY(angle: number): Matrix4x4 {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        return new Matrix4x4([
            c, 0, s, 0,
            0, 1, 0, 0,
            -s, 0, c, 0,
            0, 0, 0, 1,
        ]);
    }

    static rotationZ(angle: number): Matrix4x4 {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        return new Matrix4x4([
            c, -s, 0, 0,
            s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ]);
    }

    static scale(sx: number, sy: number, sz: number = 1): Matrix4x4 {
        return new Matrix4x4([
            sx, 0, 0, 0,
            0, sy, 0, 0,
            0, 0, sz, 0,
            0, 0, 0, 1,
        ]);
    }

    static readonly IDENTITY = new Matrix4x4([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
    ]);
}

