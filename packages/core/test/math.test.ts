/**
 * Unit tests for math utilities.
 */

import { describe, expect, it } from 'bun:test';
import { lerp, clamp, Vector2 } from '../src/math';

describe('Math Utilities', () => {
    describe('lerp', () => {
        it('should interpolate between two values', () => {
            expect(lerp(0, 100, 0)).toBe(0);
            expect(lerp(0, 100, 1)).toBe(100);
            expect(lerp(0, 100, 0.5)).toBe(50);
            expect(lerp(10, 20, 0.25)).toBe(12.5);
        });

        it('should handle negative values', () => {
            expect(lerp(-100, 100, 0.5)).toBe(0);
        });
    });

    describe('clamp', () => {
        it('should clamp values to range', () => {
            expect(clamp(5, 0, 10)).toBe(5);
            expect(clamp(-5, 0, 10)).toBe(0);
            expect(clamp(15, 0, 10)).toBe(10);
        });
    });

    describe('Vector2', () => {
        it('should create vectors', () => {
            const v = Vector2.create(3, 4);
            expect(v.x).toBe(3);
            expect(v.y).toBe(4);
        });

        it('should add vectors', () => {
            const a = { x: 1, y: 2 };
            const b = { x: 3, y: 4 };
            const result = Vector2.add(a, b);
            expect(result.x).toBe(4);
            expect(result.y).toBe(6);
        });

        it('should subtract vectors', () => {
            const a = { x: 5, y: 10 };
            const b = { x: 2, y: 3 };
            const result = Vector2.subtract(a, b);
            expect(result.x).toBe(3);
            expect(result.y).toBe(7);
        });

        it('should scale vectors', () => {
            const v = { x: 2, y: 3 };
            const result = Vector2.scale(v, 2);
            expect(result.x).toBe(4);
            expect(result.y).toBe(6);
        });

        it('should calculate magnitude', () => {
            const v = { x: 3, y: 4 };
            expect(Vector2.magnitude(v)).toBe(5);
        });

        it('should normalize vectors', () => {
            const v = { x: 3, y: 4 };
            const result = Vector2.normalize(v);
            expect(result.x).toBeCloseTo(0.6, 5);
            expect(result.y).toBeCloseTo(0.8, 5);
        });

        it('should handle zero vector normalization', () => {
            const v = { x: 0, y: 0 };
            const result = Vector2.normalize(v);
            expect(result.x).toBe(0);
            expect(result.y).toBe(0);
        });

        it('should interpolate between points', () => {
            const a = { x: 0, y: 0 };
            const b = { x: 10, y: 20 };
            const result = Vector2.lerp(a, b, 0.5);
            expect(result.x).toBe(5);
            expect(result.y).toBe(10);
        });

        it('should calculate distance', () => {
            const a = { x: 0, y: 0 };
            const b = { x: 3, y: 4 };
            expect(Vector2.distance(a, b)).toBe(5);
        });
    });
});
