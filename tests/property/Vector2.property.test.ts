import { describe, test, expect } from 'bun:test';
import * as fc from 'fast-check';
import { Vector2 } from '../../src/core/math/Vector2/Vector2';

/** Arbitrary for generating Vector2 instances with finite values */
const arbVector2 = fc.tuple(
    fc.double({ min: -1e6, max: 1e6, noNaN: true }),
    fc.double({ min: -1e6, max: 1e6, noNaN: true })
).map(([x, y]) => new Vector2(x, y));

/** Arbitrary for non-zero vectors (for normalization tests) */
const arbNonZeroVector2 = arbVector2.filter(
    v => v.length() > 1e-10
);

/** Arbitrary for t values in [0, 1] */
const arbT = fc.double({ min: 0, max: 1, noNaN: true });

describe('Vector2 Property Tests', () => {
    test('add is commutative: a + b == b + a', () => {
        fc.assert(fc.property(arbVector2, arbVector2, (a, b) => {
            const ab = a.add(b);
            const ba = b.add(a);
            return Math.abs(ab.x - ba.x) < 1e-10 &&
                Math.abs(ab.y - ba.y) < 1e-10;
        }));
    });

    test('add is associative: (a + b) + c == a + (b + c)', () => {
        fc.assert(fc.property(arbVector2, arbVector2, arbVector2, (a, b, c) => {
            const left = a.add(b).add(c);
            const right = a.add(b.add(c));
            return Math.abs(left.x - right.x) < 1e-6 &&
                Math.abs(left.y - right.y) < 1e-6;
        }));
    });

    test('multiply by 1 is identity: v * 1 == v', () => {
        fc.assert(fc.property(arbVector2, (v) => {
            const result = v.multiply(1);
            return result.x === v.x && result.y === v.y;
        }));
    });

    test('multiply by 0 yields zero vector: v * 0 == ZERO', () => {
        fc.assert(fc.property(arbVector2, (v) => {
            const result = v.multiply(0);
            return result.x === 0 && result.y === 0;
        }));
    });

    test('normalize produces unit length for non-zero vectors', () => {
        fc.assert(fc.property(arbNonZeroVector2, (v) => {
            const normalized = v.normalize();
            return Math.abs(normalized.length() - 1) < 1e-10;
        }));
    });

    test('normalize of zero vector returns ZERO', () => {
        const zero = new Vector2(0, 0);
        const result = zero.normalize();
        expect(result).toEqual(Vector2.ZERO);
    });

    test('dot product is commutative: a.dot(b) == b.dot(a)', () => {
        fc.assert(fc.property(arbVector2, arbVector2, (a, b) => {
            return Math.abs(a.dot(b) - b.dot(a)) < 1e-10;
        }));
    });

    test('length is non-negative', () => {
        fc.assert(fc.property(arbVector2, (v) => {
            return v.length() >= 0;
        }));
    });

    test('lerp boundary: lerp(a, b, 0) == a', () => {
        fc.assert(fc.property(arbVector2, arbVector2, (a, b) => {
            const result = a.lerp(b, 0);
            return Math.abs(result.x - a.x) < 1e-10 &&
                Math.abs(result.y - a.y) < 1e-10;
        }));
    });

    test('lerp boundary: lerp(a, b, 1) == b', () => {
        fc.assert(fc.property(arbVector2, arbVector2, (a, b) => {
            const result = a.lerp(b, 1);
            return Math.abs(result.x - b.x) < 1e-10 &&
                Math.abs(result.y - b.y) < 1e-10;
        }));
    });

    test('lerp midpoint property: lerp(a, b, 0.5) is between a and b', () => {
        fc.assert(fc.property(arbVector2, arbVector2, (a, b) => {
            const mid = a.lerp(b, 0.5);
            const expectedX = (a.x + b.x) / 2;
            const expectedY = (a.y + b.y) / 2;
            return Math.abs(mid.x - expectedX) < 1e-10 &&
                Math.abs(mid.y - expectedY) < 1e-10;
        }));
    });

    test('subtract inverse of add: (a + b) - b == a', () => {
        fc.assert(fc.property(arbVector2, arbVector2, (a, b) => {
            const result = a.add(b).subtract(b);
            return Math.abs(result.x - a.x) < 1e-6 &&
                Math.abs(result.y - a.y) < 1e-6;
        }));
    });
});
