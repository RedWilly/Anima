/**
 * Unit tests for Line, Arrow, and Polygon shapes.
 */

import { describe, expect, it } from 'bun:test';
import { Line, line, Arrow, arrow, Polygon, polygon, Scene } from '../src';

describe('Shapes', () => {
    describe('Line', () => {
        it('should create with default values', () => {
            const l = new Line();
            expect(l.getFrom()).toEqual({ x: -50, y: 0 });
            expect(l.getTo()).toEqual({ x: 50, y: 0 });
        });

        it('should create with custom endpoints', () => {
            const l = new Line({ from: { x: 10, y: 20 }, to: { x: 100, y: 200 } });
            expect(l.getFrom()).toEqual({ x: 10, y: 20 });
            expect(l.getTo()).toEqual({ x: 100, y: 200 });
        });

        it('should have unique ids', () => {
            const l1 = new Line();
            const l2 = new Line();
            expect(l1.id).not.toBe(l2.id);
        });

        it('should allow fluent setters', () => {
            const l = new Line()
                .setFrom(0, 0)
                .setTo(200, 100)
                .stroke('#ff0000')
                .strokeWidth(5);
            
            expect(l.getFrom()).toEqual({ x: 0, y: 0 });
            expect(l.getTo()).toEqual({ x: 200, y: 100 });
        });

        it('should calculate length correctly', () => {
            const l = new Line({ from: { x: 0, y: 0 }, to: { x: 3, y: 4 } });
            expect(l.getLength()).toBeCloseTo(5);
        });

        it('should calculate angle correctly', () => {
            const l = new Line({ from: { x: 0, y: 0 }, to: { x: 1, y: 0 } });
            expect(l.getAngle()).toBeCloseTo(0);

            const l2 = new Line({ from: { x: 0, y: 0 }, to: { x: 0, y: 1 } });
            expect(l2.getAngle()).toBeCloseTo(Math.PI / 2);
        });

        it('should work with factory function', () => {
            const l = line({ from: { x: 0, y: 0 }, to: { x: 50, y: 50 } });
            expect(l).toBeInstanceOf(Line);
            expect(l.getTo()).toEqual({ x: 50, y: 50 });
        });
    });

    describe('Arrow', () => {
        it('should create with default values', () => {
            const a = new Arrow();
            const config = a.getHeadConfig();
            expect(config.size).toBe(10);
            expect(config.style).toBe('filled');
            expect(config.heads).toBe('end');
        });

        it('should create with custom options', () => {
            const a = new Arrow({
                from: { x: 0, y: 0 },
                to: { x: 100, y: 100 },
                headSize: 15,
                headStyle: 'outline',
                heads: 'both',
            });
            
            const config = a.getHeadConfig();
            expect(config.size).toBe(15);
            expect(config.style).toBe('outline');
            expect(config.heads).toBe('both');
        });

        it('should throw on invalid headSize in constructor', () => {
            expect(() => new Arrow({ headSize: 0 })).toThrow();
            expect(() => new Arrow({ headSize: -5 })).toThrow();
        });

        it('should throw on invalid headSize in setter', () => {
            const a = new Arrow();
            expect(() => a.setHeadSize(0)).toThrow();
            expect(() => a.setHeadSize(-5)).toThrow();
        });

        it('should allow fluent setters', () => {
            const a = new Arrow()
                .setFrom(0, 0)
                .setTo(200, 100)
                .setHeadSize(20)
                .setHeads('both')
                .setHeadStyle('outline');
            
            const config = a.getHeadConfig();
            expect(config.size).toBe(20);
            expect(config.heads).toBe('both');
            expect(config.style).toBe('outline');
        });

        it('should work with factory function', () => {
            const a = arrow({ headSize: 12 });
            expect(a).toBeInstanceOf(Arrow);
            expect(a.getHeadConfig().size).toBe(12);
        });

        it('should inherit from Line', () => {
            const a = new Arrow({ from: { x: 0, y: 0 }, to: { x: 3, y: 4 } });
            expect(a.getLength()).toBeCloseTo(5);
            expect(a.getAngle()).toBeCloseTo(Math.atan2(4, 3));
        });
    });

    describe('Polygon', () => {
        it('should create with default triangle', () => {
            const p = new Polygon();
            expect(p.getVertexCount()).toBe(3);
        });

        it('should create with custom points', () => {
            const points = [
                { x: 0, y: 0 },
                { x: 100, y: 0 },
                { x: 100, y: 100 },
                { x: 0, y: 100 },
            ];
            const p = new Polygon({ points });
            expect(p.getVertexCount()).toBe(4);
            expect(p.getPoints()).toEqual(points);
        });

        it('should throw on less than 3 points in constructor', () => {
            expect(() => new Polygon({ points: [] })).toThrow();
            expect(() => new Polygon({ points: [{ x: 0, y: 0 }] })).toThrow();
            expect(() => new Polygon({ points: [{ x: 0, y: 0 }, { x: 1, y: 1 }] })).toThrow();
        });

        it('should throw on less than 3 points in setter', () => {
            const p = new Polygon();
            expect(() => p.setPoints([])).toThrow();
            expect(() => p.setPoints([{ x: 0, y: 0 }, { x: 1, y: 1 }])).toThrow();
        });

        it('should calculate centroid correctly', () => {
            // Equilateral triangle centered at origin
            const p = new Polygon({
                points: [
                    { x: 0, y: 0 },
                    { x: 30, y: 0 },
                    { x: 15, y: 30 },
                ],
            });
            const centroid = p.getCentroid();
            expect(centroid.x).toBeCloseTo(15);
            expect(centroid.y).toBeCloseTo(10);
        });

        it('should work with factory function', () => {
            const p = polygon({
                points: [
                    { x: 0, y: 0 },
                    { x: 50, y: 0 },
                    { x: 25, y: 50 },
                ],
            });
            expect(p).toBeInstanceOf(Polygon);
            expect(p.getVertexCount()).toBe(3);
        });

        it('should copy points to prevent mutation', () => {
            const points = [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 0 }];
            const p = new Polygon({ points });
            
            // Mutate original array
            points[0].x = 999;
            
            // Polygon should not be affected
            expect(p.getPoints()[0].x).toBe(0);
        });
    });

    describe('Integration with Scene', () => {
        it('should add Line to scene and animate', () => {
            const s = new Scene();
            const l = s.add(new Line());
            
            l.moveTo(100, 100, { duration: 1, ease: 'linear' });
            
            s.timeline.seek(0.5);
            expect(l.position.x).toBeCloseTo(50);
            expect(l.position.y).toBeCloseTo(50);
        });

        it('should add Arrow to scene and animate', () => {
            const s = new Scene();
            const a = s.add(new Arrow());
            
            a.scaleTo(2, 2, { duration: 1, ease: 'linear' });
            
            s.timeline.seek(0.5);
            expect(a.scale.x).toBeCloseTo(1.5);
        });

        it('should add Polygon to scene and animate', () => {
            const s = new Scene();
            const p = s.add(new Polygon());
            
            p.rotateTo(Math.PI, { duration: 1, ease: 'linear' });
            
            s.timeline.seek(0.5);
            expect(p.rotation).toBeCloseTo(Math.PI / 2);
        });
    });
});

