import { describe, it, expect } from 'bun:test';
import { Create } from '../../../../src/core/animations';
import { Circle } from '../../../../src/mobjects/geometry/Circle';
import { Rectangle } from '../../../../src/mobjects/geometry/Rectangle';
import { VMobject } from '../../../../src/mobjects/VMobject';
import { Vector2 } from '../../../../src/core/math/Vector2/Vector2';
import { BezierPath } from '../../../../src/core/math/bezier/BezierPath';

describe('Create Animation', () => {
    describe('PRD Requirements', () => {
        it('should show nothing when interpolate(0)', () => {
            const circle = new Circle(50);
            const anim = new Create(circle);

            anim.interpolate(0);

            expect(circle.paths.length).toBe(0);
            expect(circle.opacity).toBe(0);
        });

        it('should show partial path when interpolate(0.5)', () => {
            const circle = new Circle(50);
            const originalLength = circle.paths[0]?.getLength() ?? 0;
            const anim = new Create(circle);

            anim.interpolate(0.5);

            expect(circle.paths.length).toBeGreaterThan(0);
            const partialLength = circle.paths[0]?.getLength() ?? 0;
            // Partial path should be shorter than original
            expect(partialLength).toBeLessThan(originalLength);
            expect(partialLength).toBeGreaterThan(0);
        });

        it('should show complete path when interpolate(1)', () => {
            const circle = new Circle(50);
            const originalLength = circle.paths[0]?.getLength() ?? 0;
            const anim = new Create(circle);

            anim.interpolate(1);

            expect(circle.paths.length).toBeGreaterThan(0);
            const finalLength = circle.paths[0]?.getLength() ?? 0;
            expect(finalLength).toBeCloseTo(originalLength, 1);
            expect(circle.opacity).toBe(1);
        });
    });

    describe('Edge Cases', () => {
        it('should handle VMobject with no paths', () => {
            const vmob = new VMobject();
            const anim = new Create(vmob);

            anim.interpolate(0.5);

            expect(vmob.paths.length).toBe(0);
        });

        it('should handle Rectangle shape', () => {
            const rect = new Rectangle(100, 50);
            const anim = new Create(rect);

            anim.interpolate(0.5);

            expect(rect.paths.length).toBeGreaterThan(0);
        });

        it('should handle multiple paths', () => {
            const vmob = new VMobject();
            const path1 = new BezierPath();
            path1.moveTo(new Vector2(0, 0));
            path1.lineTo(new Vector2(100, 0));
            const path2 = new BezierPath();
            path2.moveTo(new Vector2(0, 50));
            path2.lineTo(new Vector2(100, 50));

            vmob.addPath(path1);
            vmob.addPath(path2);

            const anim = new Create(vmob);
            anim.interpolate(0.5);

            expect(vmob.paths.length).toBe(2);
        });

        it('should inherit Animation defaults', () => {
            const circle = new Circle(50);
            const anim = new Create(circle);
            expect(anim.getDuration()).toBe(1);
            expect(anim.getDelay()).toBe(0);
        });

        it('should support fluent chaining', () => {
            const circle = new Circle(50);
            const anim = new Create(circle).duration(2).delay(0.5);
            expect(anim.getDuration()).toBe(2);
            expect(anim.getDelay()).toBe(0.5);
        });

        it('should return correct target', () => {
            const circle = new Circle(50);
            const anim = new Create(circle);
            expect(anim.getTarget()).toBe(circle);
        });
    });
});
