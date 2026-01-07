import { describe, test, expect } from 'bun:test';
import * as fc from 'fast-check';
import { BezierPath } from '../../src/core/math/bezier/BezierPath';
import { Vector2 } from '../../src/core/math/Vector2/Vector2';

/** Arbitrary for Vector2 */
const arbVector2 = fc.tuple(
    fc.double({ min: -100, max: 100, noNaN: true }),
    fc.double({ min: -100, max: 100, noNaN: true })
).map(([x, y]) => new Vector2(x, y));

/** Create a simple line path from start to end */
function createLinePath(start: Vector2, end: Vector2): BezierPath {
    const path = new BezierPath();
    path.moveTo(start);
    path.lineTo(end);
    return path;
}

/** Create a simple triangle path */
function createTrianglePath(p1: Vector2, p2: Vector2, p3: Vector2): BezierPath {
    const path = new BezierPath();
    path.moveTo(p1);
    path.lineTo(p2);
    path.lineTo(p3);
    path.closePath();
    return path;
}

describe('BezierPath Property Tests', () => {
    test('getPointAt(0) == start point for line paths', () => {
        fc.assert(fc.property(arbVector2, arbVector2, (start, end) => {
            const path = createLinePath(start, end);
            const result = path.getPointAt(0);
            return Math.abs(result.x - start.x) < 1e-6 &&
                Math.abs(result.y - start.y) < 1e-6;
        }));
    });

    test('getPointAt(1) == end point for line paths', () => {
        fc.assert(fc.property(arbVector2, arbVector2, (start, end) => {
            const path = createLinePath(start, end);
            const result = path.getPointAt(1);
            return Math.abs(result.x - end.x) < 1e-6 &&
                Math.abs(result.y - end.y) < 1e-6;
        }));
    });

    test('getLength() >= 0 for any path', () => {
        fc.assert(fc.property(arbVector2, arbVector2, (start, end) => {
            const path = createLinePath(start, end);
            return path.getLength() >= 0;
        }));
    });

    test('line path length equals distance between points', () => {
        fc.assert(fc.property(arbVector2, arbVector2, (start, end) => {
            const path = createLinePath(start, end);
            const expectedLength = start.subtract(end).length();
            return Math.abs(path.getLength() - expectedLength) < 1e-6;
        }));
    });

    test('matchPoints produces equal point counts', () => {
        fc.assert(fc.property(
            arbVector2, arbVector2, arbVector2, arbVector2,
            (s1, e1, s2, e2) => {
                const p1 = createLinePath(s1, e1);
                const p2 = new BezierPath();
                p2.moveTo(s2);
                p2.lineTo(new Vector2((s2.x + e2.x) / 2, (s2.y + e2.y) / 2));
                p2.lineTo(e2);

                const [m1, m2] = BezierPath.matchPoints(p1, p2);
                return m1.getPointCount() === m2.getPointCount();
            }
        ));
    });

    test('interpolate(p, p, t) preserves endpoints for any t', () => {
        fc.assert(fc.property(
            arbVector2, arbVector2,
            fc.double({ min: 0, max: 1, noNaN: true }),
            (start, end, t) => {
                const path = createLinePath(start, end);
                const result = BezierPath.interpolate(path, path, t);
                const startPt = result.getPointAt(0);
                const endPt = result.getPointAt(1);
                return Math.abs(startPt.x - start.x) < 1e-6 &&
                    Math.abs(startPt.y - start.y) < 1e-6 &&
                    Math.abs(endPt.x - end.x) < 1e-6 &&
                    Math.abs(endPt.y - end.y) < 1e-6;
            }
        ));
    });

    test('clone produces independent copy', () => {
        fc.assert(fc.property(arbVector2, arbVector2, (start, end) => {
            const original = createLinePath(start, end);
            const cloned = original.clone();
            original.lineTo(new Vector2(999, 999));
            return cloned.getPointCount() === 2 &&
                original.getPointCount() === 3;
        }));
    });

    test('getPoints returns requested number of points', () => {
        fc.assert(fc.property(
            arbVector2, arbVector2,
            fc.integer({ min: 1, max: 50 }),
            (start, end, count) => {
                const path = createLinePath(start, end);
                const points = path.getPoints(count);
                return points.length === count;
            }
        ));
    });

    test('toCubic preserves endpoints', () => {
        fc.assert(fc.property(arbVector2, arbVector2, (start, end) => {
            const path = createLinePath(start, end);
            const cubic = path.toCubic();
            const cubicStart = cubic.getPointAt(0);
            const cubicEnd = cubic.getPointAt(1);
            return Math.abs(cubicStart.x - start.x) < 1e-6 &&
                Math.abs(cubicStart.y - start.y) < 1e-6 &&
                Math.abs(cubicEnd.x - end.x) < 1e-6 &&
                Math.abs(cubicEnd.y - end.y) < 1e-6;
        }));
    });
});
