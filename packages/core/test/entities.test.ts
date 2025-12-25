/**
 * Unit tests for entities.
 */

import { describe, expect, it } from 'bun:test';
import { Circle } from '../src/entities/circle';
import { Rectangle } from '../src/entities/rectangle';

describe('Entities', () => {
    describe('Circle', () => {
        it('should create with default values', () => {
            const c = new Circle();
            expect(c.getRadius()).toBe(50);
            expect(c.position.x).toBe(0);
            expect(c.position.y).toBe(0);
            expect(c.opacity).toBe(1);
        });

        it('should create with custom radius', () => {
            const c = new Circle({ radius: 100 });
            expect(c.getRadius()).toBe(100);
        });

        it('should have unique ids', () => {
            const c1 = new Circle();
            const c2 = new Circle();
            expect(c1.id).not.toBe(c2.id);
        });

        it('should throw on invalid radius', () => {
            const c = new Circle();
            expect(() => c.setRadius(-10)).toThrow();
            expect(() => c.setRadius(0)).toThrow();
        });

        it('should allow fluent style methods', () => {
            const c = new Circle();
            const result = c.fill('#ff0000').stroke('#000000').strokeWidth(5);
            expect(result).toBe(c);
        });
    });

    describe('Rectangle', () => {
        it('should create with default values', () => {
            const r = new Rectangle();
            const size = r.getSize();
            expect(size.width).toBe(100);
            expect(size.height).toBe(100);
        });

        it('should create with custom dimensions', () => {
            const r = new Rectangle({ width: 200, height: 150 });
            const size = r.getSize();
            expect(size.width).toBe(200);
            expect(size.height).toBe(150);
        });

        it('should throw on invalid dimensions', () => {
            const r = new Rectangle();
            expect(() => r.setSize(-10, 50)).toThrow();
            expect(() => r.setSize(50, 0)).toThrow();
        });

        it('should support corner radius', () => {
            const r = new Rectangle({ cornerRadius: 10 });
            // Just verifies it doesn't throw
            expect(r).toBeDefined();
        });
    });
});
