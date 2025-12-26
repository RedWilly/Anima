/**
 * Tests for getMorphPoints on all shape entities.
 * Validates that each entity returns valid point arrays for morphing.
 */

import { describe, test, expect } from 'bun:test';
import {
    circle,
    rectangle,
    polygon,
    line,
    arc,
    bezier,
    path,
    text,
} from '../src';

describe('getMorphPoints', () => {
    describe('Circle', () => {
        test('should return correct number of points', () => {
            const c = circle({ radius: 50 });
            const points = c.getMorphPoints(16);
            expect(points.length).toBe(16);
        });

        test('should return points on circumference', () => {
            const c = circle({ radius: 50 });
            const points = c.getMorphPoints(4);
            // First point should be at (50, 0) - right side
            expect(points[0].x).toBeCloseTo(50, 1);
            expect(points[0].y).toBeCloseTo(0, 1);
            // Second point should be at (0, 50) - bottom
            expect(points[1].x).toBeCloseTo(0, 1);
            expect(points[1].y).toBeCloseTo(50, 1);
        });

        test('should use default 32 segments', () => {
            const c = circle({ radius: 50 });
            const points = c.getMorphPoints();
            expect(points.length).toBe(32);
        });
    });

    describe('Rectangle', () => {
        test('should return 4 corner points', () => {
            const r = rectangle({ width: 100, height: 60 });
            const points = r.getMorphPoints();
            expect(points.length).toBe(4);
        });

        test('should return correct corner positions', () => {
            const r = rectangle({ width: 100, height: 60 });
            const points = r.getMorphPoints();
            // Corners centered at origin
            expect(points).toContainEqual({ x: -50, y: -30 }); // top-left
            expect(points).toContainEqual({ x: 50, y: -30 });  // top-right
            expect(points).toContainEqual({ x: 50, y: 30 });   // bottom-right
            expect(points).toContainEqual({ x: -50, y: 30 });  // bottom-left
        });
    });

    describe('Line', () => {
        test('should return 2 points (from and to)', () => {
            const l = line({ from: { x: 0, y: 0 }, to: { x: 100, y: 50 } });
            const points = l.getMorphPoints();
            expect(points.length).toBe(2);
        });

        test('should return correct from/to positions', () => {
            const l = line({ from: { x: 10, y: 20 }, to: { x: 100, y: 50 } });
            const points = l.getMorphPoints();
            expect(points[0]).toEqual({ x: 10, y: 20 });
            expect(points[1]).toEqual({ x: 100, y: 50 });
        });
    });

    describe('Arc', () => {
        test('should return correct number of points', () => {
            const a = arc({ radius: 50, startAngle: 0, endAngle: Math.PI });
            const points = a.getMorphPoints(16);
            expect(points.length).toBe(17); // segments + 1
        });

        test('should sample points along arc', () => {
            const a = arc({ radius: 50, startAngle: 0, endAngle: Math.PI / 2 });
            const points = a.getMorphPoints(2);
            // Start point
            expect(points[0].x).toBeCloseTo(50, 1);
            expect(points[0].y).toBeCloseTo(0, 1);
            // End point
            expect(points[2].x).toBeCloseTo(0, 1);
            expect(points[2].y).toBeCloseTo(50, 1);
        });
    });

    describe('Bezier', () => {
        test('should return correct number of points', () => {
            const b = bezier({
                start: { x: 0, y: 0 },
                control1: { x: 50, y: -50 },
                end: { x: 100, y: 0 },
            });
            const points = b.getMorphPoints(16);
            expect(points.length).toBe(17); // segments + 1
        });

        test('should start and end at correct positions', () => {
            const b = bezier({
                start: { x: 0, y: 0 },
                control1: { x: 50, y: -50 },
                end: { x: 100, y: 0 },
            });
            const points = b.getMorphPoints(8);
            expect(points[0].x).toBeCloseTo(0, 1);
            expect(points[0].y).toBeCloseTo(0, 1);
            expect(points[8].x).toBeCloseTo(100, 1);
            expect(points[8].y).toBeCloseTo(0, 1);
        });
    });

    describe('Path', () => {
        test('should return correct number of points', () => {
            const p = path().moveTo(0, 0).lineTo(100, 0).lineTo(100, 100);
            const points = p.getMorphPoints(32);
            expect(points.length).toBe(33); // segments + 1
        });

        test('should sample along entire path', () => {
            const p = path().moveTo(0, 0).lineTo(100, 0);
            const points = p.getMorphPoints(2);
            expect(points[0].x).toBeCloseTo(0, 1);
            expect(points[2].x).toBeCloseTo(100, 1);
        });
    });

    describe('Polygon', () => {
        test('should return same points as getPoints', () => {
            const trianglePoints = [
                { x: 0, y: -50 },
                { x: 43, y: 25 },
                { x: -43, y: 25 },
            ];
            const p = polygon({ points: trianglePoints });
            const morphPoints = p.getMorphPoints();
            const originalPoints = p.getPoints();
            expect(morphPoints).toEqual(originalPoints);
        });
    });

    describe('TextCharacter', () => {
        test('should return array of points', () => {
            const t = text({ content: 'A', fontSize: 48 });
            const char = t.charAt(0);
            const points = char.getMorphPoints();
            expect(Array.isArray(points)).toBe(true);
        });

        test('should return non-empty array for letter', () => {
            const t = text({ content: 'A', fontSize: 48 });
            const char = t.charAt(0);
            const points = char.getMorphPoints();
            expect(points.length).toBeGreaterThan(0);
        });

        test('should return points with x and y properties', () => {
            const t = text({ content: 'A', fontSize: 48 });
            const char = t.charAt(0);
            const points = char.getMorphPoints();
            if (points.length > 0) {
                expect(typeof points[0].x).toBe('number');
                expect(typeof points[0].y).toBe('number');
            }
        });
    });

    describe('Text', () => {
        test('should return array of points', () => {
            const t = text({ content: 'Hi', fontSize: 48 });
            const points = t.getMorphPoints();
            expect(Array.isArray(points)).toBe(true);
        });

        test('should combine points from all characters', () => {
            const single = text({ content: 'A', fontSize: 48 });
            const double = text({ content: 'AB', fontSize: 48 });
            const singlePoints = single.getMorphPoints();
            const doublePoints = double.getMorphPoints();
            // More characters = more points
            expect(doublePoints.length).toBeGreaterThan(singlePoints.length);
        });
    });
});
