/**
 * Unit tests for Bezier, Arc, and Path entities.
 */

import { describe, expect, it } from 'bun:test';
import { Bezier, bezier, Arc, arc, Path, path } from '../src';

describe('Bezier', () => {
    describe('Creation', () => {
        it('should create quadratic bezier with default values', () => {
            const b = new Bezier();
            expect(b.isCubic()).toBe(false);
            expect(b.getStart()).toEqual({ x: -50, y: 0 });
            expect(b.getEnd()).toEqual({ x: 50, y: 0 });
        });

        it('should create cubic bezier when control2 provided', () => {
            const b = bezier({
                start: { x: 0, y: 0 },
                control1: { x: 25, y: -50 },
                control2: { x: 75, y: 50 },
                end: { x: 100, y: 0 },
            });
            expect(b.isCubic()).toBe(true);
        });
    });

    describe('Point interpolation', () => {
        it('should return start point at t=0', () => {
            const b = bezier({ start: { x: 0, y: 0 }, end: { x: 100, y: 0 } });
            const point = b.getPointAt(0);
            expect(point.x).toBeCloseTo(0);
            expect(point.y).toBeCloseTo(0);
        });

        it('should return end point at t=1', () => {
            const b = bezier({ start: { x: 0, y: 0 }, end: { x: 100, y: 0 } });
            const point = b.getPointAt(1);
            expect(point.x).toBeCloseTo(100);
            expect(point.y).toBeCloseTo(0);
        });

        it('should return midpoint at t=0.5 for linear curve', () => {
            const b = bezier({
                start: { x: 0, y: 0 },
                control1: { x: 50, y: 0 },
                end: { x: 100, y: 0 },
            });
            const point = b.getPointAt(0.5);
            expect(point.x).toBeCloseTo(50);
        });
    });

    describe('Tangent calculation', () => {
        it('should return normalized tangent vector', () => {
            const b = bezier({ start: { x: 0, y: 0 }, control1: { x: 50, y: 0 }, end: { x: 100, y: 0 } });
            const tangent = b.getTangentAt(0.5);
            const length = Math.sqrt(tangent.x ** 2 + tangent.y ** 2);
            expect(length).toBeCloseTo(1);
        });
    });
});

describe('Arc', () => {
    describe('Creation', () => {
        it('should create with default values', () => {
            const a = new Arc();
            expect(a.getCenter()).toEqual({ x: 0, y: 0 });
            expect(a.getRadiusX()).toBe(50);
            expect(a.getStartAngle()).toBe(0);
            expect(a.getEndAngle()).toBe(Math.PI);
        });

        it('should detect elliptical arc', () => {
            const a = arc({ radiusX: 100, radiusY: 50 });
            expect(a.isElliptical()).toBe(true);
        });

        it('should detect circular arc', () => {
            const a = arc({ radius: 50 });
            expect(a.isElliptical()).toBe(false);
        });
    });

    describe('Point interpolation', () => {
        it('should return start point of arc at t=0', () => {
            const a = arc({
                center: { x: 0, y: 0 },
                radius: 50,
                startAngle: 0,
                endAngle: Math.PI,
            });
            const point = a.getPointAt(0);
            expect(point.x).toBeCloseTo(50);
            expect(point.y).toBeCloseTo(0);
        });

        it('should return end point of arc at t=1', () => {
            const a = arc({
                center: { x: 0, y: 0 },
                radius: 50,
                startAngle: 0,
                endAngle: Math.PI,
            });
            const point = a.getPointAt(1);
            expect(point.x).toBeCloseTo(-50);
            expect(point.y).toBeCloseTo(0);
        });
    });
});

describe('Path', () => {
    describe('Creation', () => {
        it('should create empty path', () => {
            const p = new Path();
            expect(p.getCommands().length).toBe(0);
        });

        it('should support chainable commands', () => {
            const p = path()
                .moveTo(0, 0)
                .lineTo(100, 0)
                .lineTo(100, 100)
                .close();
            expect(p.getCommands().length).toBe(4);
        });
    });

    describe('Length calculation', () => {
        it('should calculate length of straight line', () => {
            const p = path().moveTo(0, 0).lineTo(100, 0);
            expect(p.getLength()).toBeCloseTo(100);
        });

        it('should calculate length of closed triangle', () => {
            const p = path()
                .moveTo(0, 0)
                .lineTo(100, 0)
                .lineTo(50, 50)
                .close();
            // Triangle: 100 + ~70 + ~70 ≈ 240
            expect(p.getLength()).toBeGreaterThan(200);
        });
    });

    describe('Point interpolation', () => {
        it('should return start at t=0', () => {
            const p = path().moveTo(0, 0).lineTo(100, 0);
            const point = p.getPointAt(0);
            expect(point.x).toBeCloseTo(0);
            expect(point.y).toBeCloseTo(0);
        });

        it('should return end at t=1', () => {
            const p = path().moveTo(0, 0).lineTo(100, 0);
            const point = p.getPointAt(1);
            expect(point.x).toBeCloseTo(100);
            expect(point.y).toBeCloseTo(0);
        });

        it('should interpolate midpoint', () => {
            const p = path().moveTo(0, 0).lineTo(100, 0);
            const point = p.getPointAt(0.5);
            expect(point.x).toBeCloseTo(50);
        });
    });

    describe('Clear', () => {
        it('should clear all commands', () => {
            const p = path().moveTo(0, 0).lineTo(100, 100).clear();
            expect(p.getCommands().length).toBe(0);
        });
    });
});
