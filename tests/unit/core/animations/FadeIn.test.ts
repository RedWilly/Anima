import { describe, it, expect } from 'bun:test';
import { FadeIn } from '../../../../src/core/animations';
import { Mobject } from '../../../../src/mobjects/Mobject';

describe('FadeIn Animation', () => {
    describe('PRD Requirements', () => {
        it('should keep opacity at 0 when interpolate(0)', () => {
            const mobject = new Mobject(); // opacity starts at 0
            const anim = new FadeIn(mobject);

            anim.interpolate(0);
            expect(mobject.opacity).toBe(0);
        });

        it('should set opacity to 0.5 when interpolate(0.5)', () => {
            const mobject = new Mobject(); // opacity starts at 0
            const anim = new FadeIn(mobject);

            anim.interpolate(0.5);
            expect(mobject.opacity).toBeCloseTo(0.5, 5);
        });

        it('should set opacity to 1 when interpolate(1)', () => {
            const mobject = new Mobject(); // opacity starts at 0
            const anim = new FadeIn(mobject);

            anim.interpolate(1);
            expect(mobject.opacity).toBe(1);
        });
    });

    describe('Edge Cases', () => {
        it('should work when starting from partial opacity', () => {
            const mobject = new Mobject();
            mobject.setOpacity(0.5);
            const anim = new FadeIn(mobject);

            anim.interpolate(0);
            expect(mobject.opacity).toBe(0.5);

            anim.interpolate(0.5);
            expect(mobject.opacity).toBeCloseTo(0.75, 5);

            anim.interpolate(1);
            expect(mobject.opacity).toBe(1);
        });

        it('should return target mobject', () => {
            const mobject = new Mobject();
            const anim = new FadeIn(mobject);
            expect(anim.getTarget()).toBe(mobject);
        });

        it('should inherit Animation defaults', () => {
            const mobject = new Mobject();
            const anim = new FadeIn(mobject);
            expect(anim.getDuration()).toBe(1);
            expect(anim.getDelay()).toBe(0);
        });

        it('should support fluent chaining', () => {
            const mobject = new Mobject();
            const anim = new FadeIn(mobject).duration(2).delay(0.5);
            expect(anim.getDuration()).toBe(2);
            expect(anim.getDelay()).toBe(0.5);
        });
    });
});
