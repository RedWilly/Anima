import { describe, it, expect } from 'bun:test';
import { Scale } from '../../../../src/core/animations';
import { Mobject } from '../../../../src/mobjects/Mobject';

describe('Scale Animation', () => {
    describe('PRD Requirements', () => {
        it('should keep scale at (1, 1) when interpolate(0)', () => {
            const mobject = new Mobject(); // scale starts at (1, 1)
            const anim = new Scale(mobject, 2);

            anim.interpolate(0);
            expect(mobject.scale.x).toBeCloseTo(1, 5);
            expect(mobject.scale.y).toBeCloseTo(1, 5);
        });

        it('should set scale to (1.5, 1.5) when interpolate(0.5)', () => {
            const mobject = new Mobject(); // scale starts at (1, 1)
            const anim = new Scale(mobject, 2);

            anim.interpolate(0.5);
            expect(mobject.scale.x).toBeCloseTo(1.5, 5);
            expect(mobject.scale.y).toBeCloseTo(1.5, 5);
        });

        it('should set scale to (2, 2) when interpolate(1)', () => {
            const mobject = new Mobject(); // scale starts at (1, 1)
            const anim = new Scale(mobject, 2);

            anim.interpolate(1);
            expect(mobject.scale.x).toBeCloseTo(2, 5);
            expect(mobject.scale.y).toBeCloseTo(2, 5);
        });
    });

    describe('Non-uniform Scaling', () => {
        it('should support non-uniform scale factors', () => {
            const mobject = new Mobject();
            const anim = new Scale(mobject, 2, 3);

            anim.interpolate(1);
            expect(mobject.scale.x).toBeCloseTo(2, 5);
            expect(mobject.scale.y).toBeCloseTo(3, 5);
        });

        it('should interpolate non-uniform scale correctly', () => {
            const mobject = new Mobject();
            const anim = new Scale(mobject, 3, 5);

            anim.interpolate(0.5);
            expect(mobject.scale.x).toBeCloseTo(2, 5); // 1 + (3-1)*0.5
            expect(mobject.scale.y).toBeCloseTo(3, 5); // 1 + (5-1)*0.5
        });
    });

    describe('Edge Cases', () => {
        it('should work when starting from non-unit scale', () => {
            const mobject = new Mobject();
            mobject.setScale(2, 2);
            const anim = new Scale(mobject, 4);

            anim.interpolate(0);
            expect(mobject.scale.x).toBeCloseTo(2, 5);
            expect(mobject.scale.y).toBeCloseTo(2, 5);

            anim.interpolate(1);
            expect(mobject.scale.x).toBeCloseTo(4, 5);
            expect(mobject.scale.y).toBeCloseTo(4, 5);
        });

        it('should handle scale down', () => {
            const mobject = new Mobject();
            mobject.setScale(2, 2);
            const anim = new Scale(mobject, 0.5);

            anim.interpolate(1);
            expect(mobject.scale.x).toBeCloseTo(0.5, 5);
            expect(mobject.scale.y).toBeCloseTo(0.5, 5);
        });

        it('should return target mobject', () => {
            const mobject = new Mobject();
            const anim = new Scale(mobject, 2);
            expect(anim.getTarget()).toBe(mobject);
        });

        it('should inherit Animation defaults', () => {
            const mobject = new Mobject();
            const anim = new Scale(mobject, 2);
            expect(anim.getDuration()).toBe(1);
            expect(anim.getDelay()).toBe(0);
        });

        it('should support fluent chaining', () => {
            const mobject = new Mobject();
            const anim = new Scale(mobject, 2).duration(2).delay(0.5);
            expect(anim.getDuration()).toBe(2);
            expect(anim.getDelay()).toBe(0.5);
        });
    });
});
