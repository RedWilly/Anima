import { describe, it, expect } from 'bun:test';
import { MoveTo } from '../../../../src/core/animations';
import { Mobject } from '../../../../src/mobjects/Mobject';
import { Vector2 } from '../../../../src/core/math/Vector2/Vector2';

describe('MoveTo Animation', () => {
    describe('PRD Requirements', () => {
        it('should keep position at (0, 0) when interpolate(0)', () => {
            const mobject = new Mobject(); // position starts at (0, 0)
            const anim = new MoveTo(mobject, 100, 50);

            anim.interpolate(0);
            expect(mobject.position.x).toBe(0);
            expect(mobject.position.y).toBe(0);
        });

        it('should set position to (50, 25) when interpolate(0.5)', () => {
            const mobject = new Mobject(); // position starts at (0, 0)
            const anim = new MoveTo(mobject, 100, 50);

            anim.interpolate(0.5);
            expect(mobject.position.x).toBeCloseTo(50, 5);
            expect(mobject.position.y).toBeCloseTo(25, 5);
        });

        it('should set position to (100, 50) when interpolate(1)', () => {
            const mobject = new Mobject(); // position starts at (0, 0)
            const anim = new MoveTo(mobject, 100, 50);

            anim.interpolate(1);
            expect(mobject.position.x).toBe(100);
            expect(mobject.position.y).toBe(50);
        });
    });

    describe('Constructor Overloads', () => {
        it('should accept Vector2 as destination', () => {
            const mobject = new Mobject();
            const destination = new Vector2(200, 100);
            const anim = new MoveTo(mobject, destination);

            anim.interpolate(1);
            expect(mobject.position.x).toBe(200);
            expect(mobject.position.y).toBe(100);
        });

        it('should accept x, y coordinates as destination', () => {
            const mobject = new Mobject();
            const anim = new MoveTo(mobject, 150, 75);

            anim.interpolate(1);
            expect(mobject.position.x).toBe(150);
            expect(mobject.position.y).toBe(75);
        });
    });

    describe('Edge Cases', () => {
        it('should work when starting from non-zero position', () => {
            const mobject = new Mobject();
            mobject.pos(50, 50);
            const anim = new MoveTo(mobject, 150, 100);

            anim.interpolate(0);
            expect(mobject.position.x).toBe(50);
            expect(mobject.position.y).toBe(50);

            anim.interpolate(0.5);
            expect(mobject.position.x).toBeCloseTo(100, 5);
            expect(mobject.position.y).toBeCloseTo(75, 5);

            anim.interpolate(1);
            expect(mobject.position.x).toBe(150);
            expect(mobject.position.y).toBe(100);
        });

        it('should handle negative coordinates', () => {
            const mobject = new Mobject();
            mobject.pos(100, 100);
            const anim = new MoveTo(mobject, -50, -25);

            anim.interpolate(1);
            expect(mobject.position.x).toBe(-50);
            expect(mobject.position.y).toBe(-25);
        });

        it('should handle moving to same position', () => {
            const mobject = new Mobject();
            mobject.pos(100, 50);
            const anim = new MoveTo(mobject, 100, 50);

            anim.interpolate(0.5);
            expect(mobject.position.x).toBe(100);
            expect(mobject.position.y).toBe(50);
        });

        it('should return target mobject', () => {
            const mobject = new Mobject();
            const anim = new MoveTo(mobject, 100, 50);
            expect(anim.getTarget()).toBe(mobject);
        });

        it('should inherit Animation defaults', () => {
            const mobject = new Mobject();
            const anim = new MoveTo(mobject, 100, 50);
            expect(anim.getDuration()).toBe(1);
            expect(anim.getDelay()).toBe(0);
        });

        it('should support fluent chaining', () => {
            const mobject = new Mobject();
            const anim = new MoveTo(mobject, 100, 50).duration(2).delay(0.5);
            expect(anim.getDuration()).toBe(2);
            expect(anim.getDelay()).toBe(0.5);
        });
    });
});
