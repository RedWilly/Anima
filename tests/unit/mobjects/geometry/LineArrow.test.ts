import { describe, test, expect } from 'bun:test';
import { Line } from '../../../../src/core/mobjects/geometry/Line';
import { Arrow } from '../../../../src/core/mobjects/geometry/Arrow';
import { Vector } from '../../../../src/core/math/vector/Vector';

describe('Line', () => {
    test('creates straight line', () => {
        const line = new Line(1, 1, 3, 4);
        const path = line.paths[0]!;

        expect(path.getPointAt(0).equals(new Vector(1, 1))).toBe(true);
        expect(path.getPointAt(1).equals(new Vector(3, 4))).toBe(true);
    });
});

describe('Arrow', () => {
    test('has line and tip', () => {
        const arrow = new Arrow(0, 0, 1, 0);
        expect(arrow.paths.length).toBe(2);

        // Line
        expect(arrow.paths[0]!.getPointAt(0).equals(Vector.ZERO)).toBe(true);
        expect(arrow.paths[0]!.getPointAt(1).equals(Vector.RIGHT)).toBe(true);

        // Tip
        expect(arrow.paths[1]!.getPointAt(0).equals(Vector.RIGHT)).toBe(true);
    });
});

