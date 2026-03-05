import { describe, test, expect } from 'bun:test';
import * as fc from 'fast-check';
import { Matrix4x4 } from '../../src/core/math/matrix/Matrix4x4';
import { Vector } from '../../src/core/math/vector/Vector';

const arbMatrix4x4 = fc.array(
    fc.double({ min: -50, max: 50, noNaN: true }),
    { minLength: 16, maxLength: 16 },
).map((values) => new Matrix4x4(values));

const arbInvertibleMatrix4x4 = fc.tuple(
    fc.double({ min: 0.1, max: 10, noNaN: true }),
    fc.double({ min: 0.1, max: 10, noNaN: true }),
    fc.double({ min: 0.1, max: 10, noNaN: true }),
    fc.double({ min: -Math.PI, max: Math.PI, noNaN: true }),
    fc.double({ min: -100, max: 100, noNaN: true }),
    fc.double({ min: -100, max: 100, noNaN: true }),
    fc.double({ min: -100, max: 100, noNaN: true }),
).map(([sx, sy, sz, angle, tx, ty, tz]) =>
    Matrix4x4.translation(tx, ty, tz)
        .multiply(Matrix4x4.rotationZ(angle))
        .multiply(Matrix4x4.scale(sx, sy, sz)),
);

function matricesEqual(a: Matrix4x4, b: Matrix4x4, eps = 1e-5): boolean {
    for (let i = 0; i < 16; i++) {
        if (Math.abs(a.values[i]! - b.values[i]!) > eps) return false;
    }
    return true;
}

describe('Matrix4x4 Property Tests', () => {
    test('identity * M == M', () => {
        fc.assert(fc.property(arbMatrix4x4, (m) => {
            const result = Matrix4x4.identity().multiply(m);
            return matricesEqual(result, m);
        }));
    });

    test('M * identity == M', () => {
        fc.assert(fc.property(arbMatrix4x4, (m) => {
            const result = m.multiply(Matrix4x4.identity());
            return matricesEqual(result, m);
        }));
    });

    test('M * inverse(M) ~= identity for invertible matrices', () => {
        fc.assert(fc.property(arbInvertibleMatrix4x4, (m) => {
            const inv = m.inverse();
            const result = m.multiply(inv);
            return matricesEqual(result, Matrix4x4.identity(), 1e-4);
        }));
    });

    test('translation transforms 3D points correctly', () => {
        fc.assert(fc.property(
            fc.double({ min: -100, max: 100, noNaN: true }),
            fc.double({ min: -100, max: 100, noNaN: true }),
            fc.double({ min: -100, max: 100, noNaN: true }),
            fc.double({ min: -1000, max: 1000, noNaN: true }),
            fc.double({ min: -1000, max: 1000, noNaN: true }),
            fc.double({ min: -1000, max: 1000, noNaN: true }),
            (tx, ty, tz, x, y, z) => {
                const t = Matrix4x4.translation(tx, ty, tz);
                const p = new Vector(x, y, z);
                const out = t.transformPoint(p);
                return (
                    Math.abs(out.x - (x + tx)) < 1e-5 &&
                    Math.abs(out.y - (y + ty)) < 1e-5 &&
                    Math.abs(out.z - (z + tz)) < 1e-5
                );
            },
        ));
    });

    test('2D transform composed from 4x4 preserves z=0 plane', () => {
        fc.assert(fc.property(
            fc.double({ min: -100, max: 100, noNaN: true }),
            fc.double({ min: -100, max: 100, noNaN: true }),
            fc.double({ min: -Math.PI, max: Math.PI, noNaN: true }),
            fc.double({ min: 0.1, max: 10, noNaN: true }),
            fc.double({ min: 0.1, max: 10, noNaN: true }),
            fc.double({ min: -1000, max: 1000, noNaN: true }),
            fc.double({ min: -1000, max: 1000, noNaN: true }),
            (tx, ty, angle, sx, sy, x, y) => {
                const m4 = Matrix4x4.translation(tx, ty, 0)
                    .multiply(Matrix4x4.rotationZ(angle))
                    .multiply(Matrix4x4.scale(sx, sy, 1));
                const p = new Vector(x, y, 0);
                const out4 = m4.transformPoint(p);
                return (
                    Math.abs(out4.z) < 1e-8
                );
            },
        ));
    });

    test('transformPoint2D matches transformPoint on z=0 points', () => {
        const m4 = Matrix4x4.translation(3, -2, 0)
            .multiply(Matrix4x4.rotationZ(0.5))
            .multiply(Matrix4x4.scale(2, 4, 1));
        const p2 = new Vector(1.25, -0.75);
        const via2D = m4.transformPoint2D(p2);
        const via3D = m4.transformPoint(new Vector(p2.x, p2.y, 0));
        expect(via2D.x).toBeCloseTo(via3D.x, 8);
        expect(via2D.y).toBeCloseTo(via3D.y, 8);
        expect(via3D.z).toBeCloseTo(0, 8);
    });
});

