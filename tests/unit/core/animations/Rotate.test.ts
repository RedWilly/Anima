import { describe, it, expect } from 'bun:test';
import { Rotate } from '../../../../src/core/animations';
import { Mobject } from '../../../../src/mobjects/Mobject';

describe('Rotate Animation', () => {
    describe('PRD Requirements', () => {
        it('should keep rotation at 0 when interpolate(0)', () => {
            const mobject = new Mobject(); // rotation starts at 0
            const angle = Math.PI / 2; // 90 degrees
            const anim = new Rotate(mobject, angle);

            anim.interpolate(0);
            expect(mobject.rotation).toBeCloseTo(0, 5);
        });

        it('should set rotation to 45 degrees when interpolate(0.5)', () => {
            const mobject = new Mobject(); // rotation starts at 0
            const angle = Math.PI / 2; // 90 degrees
            const anim = new Rotate(mobject, angle);

            anim.interpolate(0.5);
            expect(mobject.rotation).toBeCloseTo(Math.PI / 4, 5); // 45 degrees
        });

        it('should set rotation to 90 degrees when interpolate(1)', () => {
            const mobject = new Mobject(); // rotation starts at 0
            const angle = Math.PI / 2; // 90 degrees
            const anim = new Rotate(mobject, angle);

            anim.interpolate(1);
            expect(mobject.rotation).toBeCloseTo(Math.PI / 2, 5);
        });
    });

    describe('Edge Cases', () => {
        it('should work when starting from non-zero rotation', () => {
            const mobject = new Mobject();
            mobject.setRotation(Math.PI / 4); // Start at 45 degrees
            const anim = new Rotate(mobject, Math.PI / 4); // Rotate by 45 degrees

            anim.interpolate(0);
            expect(mobject.rotation).toBeCloseTo(Math.PI / 4, 5);

            anim.interpolate(1);
            expect(mobject.rotation).toBeCloseTo(Math.PI / 2, 5); // 90 degrees
        });

        it('should handle negative rotation', () => {
            const mobject = new Mobject();
            const anim = new Rotate(mobject, -Math.PI / 2); // -90 degrees

            anim.interpolate(1);
            expect(mobject.rotation).toBeCloseTo(-Math.PI / 2, 5);
        });

        it('should return target mobject', () => {
            const mobject = new Mobject();
            const anim = new Rotate(mobject, Math.PI);
            expect(anim.getTarget()).toBe(mobject);
        });

        it('should inherit Animation defaults', () => {
            const mobject = new Mobject();
            const anim = new Rotate(mobject, Math.PI);
            expect(anim.getDuration()).toBe(1);
            expect(anim.getDelay()).toBe(0);
        });

        it('should support fluent chaining', () => {
            const mobject = new Mobject();
            const anim = new Rotate(mobject, Math.PI).duration(2).delay(0.5);
            expect(anim.getDuration()).toBe(2);
            expect(anim.getDelay()).toBe(0.5);
        });
    });
});
