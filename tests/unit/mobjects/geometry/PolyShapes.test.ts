import { describe, test, expect } from 'bun:test';
import { Rectangle } from '../../../../src/mobjects/geometry/Rectangle';
import { Polygon } from '../../../../src/mobjects/geometry/Polygon';
import { Point } from '../../../../src/mobjects/geometry/Point';
import { Vector2 } from '../../../../src/core/math/Vector2/Vector2';

describe('Polygon', () => {
    test('connects vertices', () => {
        const vertices = [
            new Vector2(0, 0),
            new Vector2(1, 0),
            new Vector2(0, 1)
        ];
        const poly = new Polygon(vertices);
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

describe('Point', () => {
    test('creates small circle at position', () => {
        const pt = new Point(new Vector2(10, 20));
        
        expect(pt.position.x).toBeCloseTo(10);
        expect(pt.position.y).toBeCloseTo(20);
        
        expect(pt.paths.length).toBe(1);
    });
});
