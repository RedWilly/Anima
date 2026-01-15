import { describe, test, expect } from 'bun:test';
import { VMobject } from '../../../src/mobjects/VMobject';
import { BezierPath } from '../../../src/core/math/bezier/BezierPath';
import { Color } from '../../../src/core/math/color/Color';
import { Vector2 } from '../../../src/core/math/Vector2/Vector2';

describe('VMobject', () => {
    test('initialization', () => {
        const vmobject = new VMobject();
        expect(vmobject).toBeInstanceOf(VMobject);
        expect(vmobject.paths).toEqual([]);
        expect(vmobject.strokeColor).toEqual(Color.WHITE);
        expect(vmobject.strokeWidth).toBe(2);
        expect(vmobject.fillColor).toEqual(Color.TRANSPARENT);
        expect(vmobject.fillOpacity).toBe(0);
    });

    test('addPath and paths access', () => {
        const vmobject = new VMobject();
        const path = new BezierPath();
        path.moveTo(new Vector2(0, 0));
        path.lineTo(new Vector2(1, 1));

        vmobject.addPath(path);
        expect(vmobject.paths).toHaveLength(1);
        expect(vmobject.paths[0]).toBe(path);
    });

    test('styling methods', () => {
        const vmobject = new VMobject();

        vmobject.stroke(Color.RED, 5);
        expect(vmobject.strokeColor).toEqual(Color.RED);
        expect(vmobject.strokeWidth).toBe(5);

        vmobject.fill(Color.BLUE, 0.5);
        expect(vmobject.fillColor).toEqual(Color.BLUE);
        expect(vmobject.fillOpacity).toBe(0.5);
    });

    test('getPoints returns PathCommand[] from path', () => {
        const vmobject = new VMobject();
        const path = new BezierPath();
        const p1 = new Vector2(0, 0);
        const p2 = new Vector2(10, 10);
        const p3 = new Vector2(20, 0);

        path.moveTo(p1);
        path.quadraticTo(p2, p3);

        vmobject.addPath(path);

        const points = vmobject.getPoints();
        // getPoints now returns PathCommand[]
        expect(points).toHaveLength(2); // Move + Quadratic
        expect(points[0]!.type).toBe('Move');
        expect(points[0]!.end).toEqual(p1);
        expect(points[1]!.type).toBe('Quadratic');
        expect(points[1]!.control1).toEqual(p2);
        expect(points[1]!.end).toEqual(p3);
    });

    test('setPoints/getPoints round-trip is lossless', () => {
        const vmobject = new VMobject();
        const path = new BezierPath();
        path.moveTo(new Vector2(0, 0));
        path.lineTo(new Vector2(10, 0));
        path.quadraticTo(new Vector2(15, 5), new Vector2(20, 10));
        path.cubicTo(new Vector2(25, 15), new Vector2(30, 15), new Vector2(35, 10));
        path.closePath();

        vmobject.addPath(path);
        const originalPoints = vmobject.getPoints();

        // Create new VMobject and restore from points
        const vmobject2 = new VMobject();
        vmobject2.setPoints(originalPoints);

        const restoredPoints = vmobject2.getPoints();

        // Should be identical
        expect(restoredPoints).toHaveLength(originalPoints.length);
        for (let i = 0; i < originalPoints.length; i++) {
            expect(restoredPoints[i]!.type).toBe(originalPoints[i]!.type);
            expect(restoredPoints[i]!.end.x).toBeCloseTo(originalPoints[i]!.end.x);
            expect(restoredPoints[i]!.end.y).toBeCloseTo(originalPoints[i]!.end.y);
        }
    });

    test('setPoints with empty array clears paths', () => {
        const vmobject = new VMobject();
        vmobject.setPoints([]);
        expect(vmobject.paths).toHaveLength(0);
    });
});
