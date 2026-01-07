import { describe, test, expect } from 'bun:test';
import * as fc from 'fast-check';
import { Matrix3x3 } from '../../src/core/math/matrix/Matrix3x3';
import { Vector2 } from '../../src/core/math/Vector2/Vector2';

/** Arbitrary for generating Matrix3x3 with reasonable finite values */
const arbMatrix3x3 = fc.array(
    fc.double({ min: -100, max: 100, noNaN: true }),
    { minLength: 9, maxLength: 9 }
).map(values => new Matrix3x3(values));

/** Arbitrary for invertible matrices (use scale + translation) */
const arbInvertibleMatrix = fc.tuple(
    fc.double({ min: 0.1, max: 10, noNaN: true }),
    fc.double({ min: 0.1, max: 10, noNaN: true }),
    fc.double({ min: -100, max: 100, noNaN: true }),
    fc.double({ min: -100, max: 100, noNaN: true })
).map(([sx, sy, tx, ty]) => {
    const scale = Matrix3x3.scale(sx, sy);
    const trans = Matrix3x3.translation(tx, ty);
    return scale.multiply(trans);
});

/** Arbitrary for angles in radians */
const arbAngle = fc.double({ min: -Math.PI * 2, max: Math.PI * 2, noNaN: true });

/** Arbitrary for Vector2 */
const arbVector2 = fc.tuple(
    fc.double({ min: -1000, max: 1000, noNaN: true }),
    fc.double({ min: -1000, max: 1000, noNaN: true })
).map(([x, y]) => new Vector2(x, y));

/** Helper to compare matrices with tolerance */
function matricesEqual(a: Matrix3x3, b: Matrix3x3, eps = 1e-6): boolean {
    for (let i = 0; i < 9; i++) {
        if (Math.abs(a.values[i]! - b.values[i]!) > eps) return false;
    }
    return true;
}

describe('Matrix3x3 Property Tests', () => {
    test('identity * M == M', () => {
        fc.assert(fc.property(arbMatrix3x3, (m) => {
            const result = Matrix3x3.identity().multiply(m);
            return matricesEqual(result, m);
        }));
    });

    test('M * identity == M', () => {
        fc.assert(fc.property(arbMatrix3x3, (m) => {
            const result = m.multiply(Matrix3x3.identity());
            return matricesEqual(result, m);
        }));
    });

    test('M * inverse(M) == identity for invertible M', () => {
        fc.assert(fc.property(arbInvertibleMatrix, (m) => {
            const inv = m.inverse();
            const result = m.multiply(inv);
            return matricesEqual(result, Matrix3x3.identity(), 1e-4);
        }));
    });

    test('translation(0, 0) == identity', () => {
        const t = Matrix3x3.translation(0, 0);
        expect(matricesEqual(t, Matrix3x3.identity())).toBe(true);
    });

    test('rotation(0) == identity', () => {
        const r = Matrix3x3.rotation(0);
        expect(matricesEqual(r, Matrix3x3.identity())).toBe(true);
    });

    test('scale(1, 1) == identity', () => {
        const s = Matrix3x3.scale(1, 1);
        expect(matricesEqual(s, Matrix3x3.identity())).toBe(true);
    });

    test('transformPoint preserves origin for identity matrix', () => {
        const origin = new Vector2(0, 0);
        const result = Matrix3x3.identity().transformPoint(origin);
        expect(result.x).toBeCloseTo(0);
        expect(result.y).toBeCloseTo(0);
    });

    test('translation transforms points correctly', () => {
        fc.assert(fc.property(
            fc.double({ min: -1000, max: 1000, noNaN: true }),
            fc.double({ min: -1000, max: 1000, noNaN: true }),
            arbVector2,
            (tx, ty, p) => {
                const t = Matrix3x3.translation(tx, ty);
                const result = t.transformPoint(p);
                return Math.abs(result.x - (p.x + tx)) < 1e-3 &&
                    Math.abs(result.y - (p.y + ty)) < 1e-3;
            }
        ));
    });

    test('scale transforms points correctly', () => {
        fc.assert(fc.property(
            fc.double({ min: 0.1, max: 10, noNaN: true }),
            fc.double({ min: 0.1, max: 10, noNaN: true }),
            arbVector2,
            (sx, sy, p) => {
                const s = Matrix3x3.scale(sx, sy);
                const result = s.transformPoint(p);
                return Math.abs(result.x - (p.x * sx)) < 1e-3 &&
                    Math.abs(result.y - (p.y * sy)) < 1e-3;
            }
        ));
    });

    test('rotation preserves distance from origin', () => {
        const arbSmallVector = fc.tuple(
            fc.double({ min: -100, max: 100, noNaN: true }),
            fc.double({ min: -100, max: 100, noNaN: true })
        ).map(([x, y]) => new Vector2(x, y));

        fc.assert(fc.property(arbAngle, arbSmallVector, (angle, p) => {
            const r = Matrix3x3.rotation(angle);
            const result = r.transformPoint(p);
            const originalLen = p.length();
            const resultLen = result.length();
            // Use relative tolerance for larger values
            const tolerance = Math.max(1e-3, originalLen * 1e-5);
            return Math.abs(originalLen - resultLen) < tolerance;
        }));
    });
});
