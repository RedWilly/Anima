import { describe, test, expect } from 'bun:test';
import { Line } from '../../../../src/mobjects/geometry/Line';
import { Arrow } from '../../../../src/mobjects/geometry/Arrow';
import { Vector2 } from '../../../../src/core/math/Vector2/Vector2';

describe('Line', () => {
    test('creates straight line', () => {
        const start = new Vector2(1, 1);
        const end = new Vector2(3, 4);
        const line = new Line(start, end);
        const path = line.paths[0]!;
        
        expect(path.getPointAt(0).equals(start)).toBe(true);
        expect(path.getPointAt(1).equals(end)).toBe(true);
    });
});

describe('Arrow', () => {
    test('has line and tip', () => {
        const arrow = new Arrow(Vector2.ZERO, Vector2.RIGHT);
        expect(arrow.paths.length).toBe(2);
        
        // Line
        expect(arrow.paths[0]!.getPointAt(0).equals(Vector2.ZERO)).toBe(true);
        expect(arrow.paths[0]!.getPointAt(1).equals(Vector2.RIGHT)).toBe(true);
        
        // Tip
        expect(arrow.paths[1]!.getPointAt(0).equals(Vector2.RIGHT)).toBe(true);
    });
});
