import { describe, test, expect } from 'bun:test';
import { Arc } from '../../../../src/mobjects/geometry/Arc';
import { Circle } from '../../../../src/mobjects/geometry/Circle';

describe('Arc', () => {
    test('creates correct arc path', () => {
        const arc = new Arc(2, 0, Math.PI);
        expect(arc.paths.length).toBe(1);
        const path = arc.paths[0]!;
        const start = path.getPointAt(0);
        const end = path.getPointAt(1);
        
        expect(start.x).toBeCloseTo(2);
        expect(start.y).toBeCloseTo(0);
        expect(end.x).toBeCloseTo(-2);
        expect(end.y).toBeCloseTo(0);
        
        const mid = path.getPointAt(0.5);
        expect(mid.x).toBeCloseTo(0);
        expect(mid.y).toBeCloseTo(2);
    });
});

describe('Circle', () => {
    test('creates circular path', () => {
        const circle = new Circle(2);
        expect(circle.paths.length).toBe(1);
        const path = circle.paths[0]!;
        
        expect(path.getPointAt(0).x).toBeCloseTo(2);
        expect(path.getPointAt(0).y).toBeCloseTo(0);
        
        expect(path.getPointAt(0.5).x).toBeCloseTo(-2);
        expect(path.getPointAt(0.5).y).toBeCloseTo(0);
        
        expect(path.getPointAt(1).x).toBeCloseTo(2);
        expect(path.getPointAt(1).y).toBeCloseTo(0);
        
        const cmds = path.getCommands();
        expect(cmds[cmds.length - 1]!.type).toBe('Close');
    });

    test('radius affects size', () => {
        const c1 = new Circle(1);
        const c2 = new Circle(2);
        expect(c1.paths[0]!.getPointAt(0).x).toBeCloseTo(1);
        expect(c2.paths[0]!.getPointAt(0).x).toBeCloseTo(2);
    });
});
