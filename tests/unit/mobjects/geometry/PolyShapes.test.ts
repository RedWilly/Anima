import { describe, test, expect } from 'bun:test';
import { Rectangle } from '../../../../src/mobjects/geometry/Rectangle';
import { Polygon } from '../../../../src/mobjects/geometry/Polygon';

describe('Polygon', () => {
    test('connects vertices', () => {
        const poly = new Polygon([0, 0], [1, 0], [0, 1]);
        const path = poly.paths[0]!;
        const cmds = path.getCommands();
        expect(cmds[cmds.length - 1]!.type).toBe('Close');
    });
});

describe('Rectangle', () => {
    test('creates rectangular path', () => {
        const rect = new Rectangle(4, 2);
        const path = rect.paths[0]!;

        // Top-Left (-2, -1)
        expect(path.getPointAt(0).x).toBeCloseTo(-2);
        expect(path.getPointAt(0).y).toBeCloseTo(-1);
    });

    test('dimensions affect size', () => {
        const rect = new Rectangle(10, 5);
        const path = rect.paths[0]!;
        // Top-Left (-5, -2.5)
        expect(path.getPointAt(0).x).toBeCloseTo(-5);
        expect(path.getPointAt(0).y).toBeCloseTo(-2.5);
    });
});
