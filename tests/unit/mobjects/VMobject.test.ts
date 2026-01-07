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

    test('getPoints returns points from path', () => {
        const vmobject = new VMobject();
        const path = new BezierPath();
        const p1 = new Vector2(0, 0);
        const p2 = new Vector2(10, 10);
        const p3 = new Vector2(20, 0);

        path.moveTo(p1);
        path.quadraticTo(p2, p3);
        // QuadraticTo adds control point (p2) and end point (p3)
        // getPoints should return [p1, p2, p3]

        vmobject.addPath(path);
        
        const points = vmobject.getPoints();
        expect(points).toHaveLength(3);
        expect(points[0]).toEqual(p1);
        expect(points[1]).toEqual(p2);
        expect(points[2]).toEqual(p3);
    });

    test('setPoints updates path', () => {
        const vmobject = new VMobject();
        const newPoints = [
            new Vector2(0, 0),
            new Vector2(10, 0),
            new Vector2(10, 10)
        ];

        vmobject.setPoints(newPoints);
        
        // setPoints creates a polyline: Move(0,0), Line(10,0), Line(10,10)
        // getPoints should return [0,0, 10,0, 10,10]
        
        const points = vmobject.getPoints();
        expect(points).toHaveLength(3);
        expect(points[0]).toEqual(newPoints[0]);
        expect(points[1]).toEqual(newPoints[1]);
        expect(points[2]).toEqual(newPoints[2]);

        expect(vmobject.paths).toHaveLength(1);
    });

    test('setPoints with empty array clears paths', () => {
        const vmobject = new VMobject();
        vmobject.setPoints([]);
        expect(vmobject.paths).toHaveLength(0);
    });
});
