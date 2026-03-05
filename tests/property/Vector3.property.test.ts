import { describe, test } from 'bun:test';
import * as fc from 'fast-check';
import { Vector2 } from '../../src/core/math/Vector2/Vector2';
import { Vector3 } from '../../src/core/math/Vector3/Vector3';

const arbVector3 = fc.tuple(
    fc.double({ min: -1000, max: 1000, noNaN: true }),
    fc.double({ min: -1000, max: 1000, noNaN: true }),
    fc.double({ min: -1000, max: 1000, noNaN: true }),
).map(([x, y, z]) => new Vector3(x, y, z));

describe('Vector3 Property Tests', () => {
    test('add is commutative', () => {
        fc.assert(fc.property(arbVector3, arbVector3, (a, b) => {
            return a.add(b).equals(b.add(a));
        }));
    });

    test('multiply by 1 is identity', () => {
        fc.assert(fc.property(arbVector3, (v) => {
            return v.multiply(1).equals(v);
        }));
    });

    test('multiply by 0 yields zero vector', () => {
        fc.assert(fc.property(arbVector3, (v) => {
            return v.multiply(0).equals(Vector3.ZERO);
        }));
    });

    test('normalize of non-zero vectors has unit length', () => {
        const arbNonZero = arbVector3.filter((v) => v.length() > 1e-8);
        fc.assert(fc.property(arbNonZero, (v) => {
            return Math.abs(v.normalize().length() - 1) < 1e-6;
        }));
    });

    test('lerp boundary conditions hold', () => {
        fc.assert(fc.property(arbVector3, arbVector3, (a, b) => {
            return a.lerp(b, 0).equals(a) && a.lerp(b, 1).equals(b);
        }));
    });

    test('Vector2 conversion round-trip preserves x/y', () => {
        fc.assert(fc.property(
            fc.double({ min: -1000, max: 1000, noNaN: true }),
            fc.double({ min: -1000, max: 1000, noNaN: true }),
            fc.double({ min: -1000, max: 1000, noNaN: true }),
            (x, y, z) => {
                const v2 = new Vector2(x, y);
                const v3 = Vector3.fromVector2(v2, z);
                const back = v3.toVector2();
                return (
                    Math.abs(back.x - x) < 1e-9 &&
                    Math.abs(back.y - y) < 1e-9 &&
                    Math.abs(v3.z - z) < 1e-9
                );
            },
        ));
    });
});

