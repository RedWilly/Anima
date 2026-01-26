import { describe, it, expect } from 'bun:test';
import { Write } from '../../../../src/core/animations';
import { Circle } from '../../../../src/mobjects/geometry/Circle';
import { Rectangle } from '../../../../src/mobjects/geometry/Rectangle';
import { VMobject } from '../../../../src/mobjects/VMobject';
import { Color } from '../../../../src/core/math/color/Color';
import { Vector2 } from '../../../../src/core/math/Vector2/Vector2';
import { BezierPath } from '../../../../src/core/math/bezier/BezierPath';

describe('Write Animation', () => {
    describe('PRD Requirements', () => {
        it('should show nothing when interpolate(0)', () => {
            const circle = new Circle(50);
            const anim = new Write(circle);

            anim.interpolate(0);

            expect(circle.paths.length).toBe(0);
            expect(circle.opacity).toBe(0);
        });

        it('should show half the stroke when interpolate(0.5)', () => {
            const circle = new Circle(50);
            const originalLength = circle.paths[0]?.getLength() ?? 0;
            const anim = new Write(circle);

            anim.interpolate(0.5);

            expect(circle.paths.length).toBeGreaterThan(0);
            const partialLength = circle.paths[0]?.getLength() ?? 0;
            expect(partialLength).toBeLessThan(originalLength);
            expect(partialLength).toBeGreaterThan(0);
        });

        it('should show complete stroke when interpolate(1)', () => {
            const circle = new Circle(50);
            const originalLength = circle.paths[0]?.getLength() ?? 0;
            const anim = new Write(circle);

            anim.interpolate(1);

            expect(circle.paths.length).toBeGreaterThan(0);
            const finalLength = circle.paths[0]?.getLength() ?? 0;
            expect(finalLength).toBeCloseTo(originalLength, 1);
        });

        it('should preserve fill during animation', () => {
            const rect = new Rectangle(100, 50);
            rect.fill(Color.BLUE, 1);
            const anim = new Write(rect);

            anim.interpolate(0.5);

            // Write animation preserves fill (like Manim)
            expect(rect.getFillOpacity()).toBe(1);
        });
    });

    describe('Edge Cases', () => {
        it('should handle simple line path', () => {
            const vmob = new VMobject();
            const path = new BezierPath();
            path.moveTo(new Vector2(0, 0));
            path.lineTo(new Vector2(100, 0));
            vmob.addPath(path);

            const anim = new Write(vmob);
            anim.interpolate(0.5);

            expect(vmob.paths.length).toBe(1);
            const partialLength = vmob.paths[0]?.getLength() ?? 0;
            expect(partialLength).toBeCloseTo(50, 1);
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

            const anim = new Write(vmob);
            anim.interpolate(0.5);

            expect(vmob.paths.length).toBe(2);
        });

        it('should inherit Animation defaults', () => {
            const circle = new Circle(50);
            const anim = new Write(circle);
            expect(anim.getDuration()).toBe(1);
            expect(anim.getDelay()).toBe(0);
        });

        it('should support fluent chaining', () => {
            const circle = new Circle(50);
            const anim = new Write(circle).duration(2).delay(0.5);
            expect(anim.getDuration()).toBe(2);
            expect(anim.getDelay()).toBe(0.5);
        });

        it('should return correct target', () => {
            const circle = new Circle(50);
            const anim = new Write(circle);
            expect(anim.getTarget()).toBe(circle);
        });
    });

    describe('Stroke/Fill Combinations', () => {
        it('should handle stroke only (no fill) - typical use case', () => {
           const circle = new Circle(50);
           circle.stroke(Color.RED, 3);
           // circle.fill(circle.getFillColor(), 0); /not needed
           const anim = new Write(circle);

           anim.interpolate(1);

           expect(circle.paths.length).toBeGreaterThan(0);
           expect(circle.getStrokeWidth()).toBe(3);
           expect(circle.getFillOpacity()).toBe(0);
        });

        it('should preserve fill during animation', () => {
            const rect = new Rectangle(100, 50);
            rect.stroke(Color.GREEN, 2);
            rect.fill(Color.YELLOW, 0.8);
            const anim = new Write(rect);

            anim.interpolate(0.5);

            // Write preserves fill (like Manim)
            expect(rect.getFillOpacity()).toBe(0.8);
            expect(rect.paths.length).toBeGreaterThan(0);

            anim.interpolate(1);
            expect(rect.getFillOpacity()).toBe(0.8);
        });

        it('should preserve stroke color and width during animation', () => {
            const circle = new Circle(50);
            circle.stroke(Color.BLUE, 5);
            const anim = new Write(circle);

            anim.interpolate(0.3);
            expect(circle.getStrokeWidth()).toBe(5);

            anim.interpolate(0.7);
            expect(circle.getStrokeWidth()).toBe(5);

            anim.interpolate(1);
            expect(circle.getStrokeWidth()).toBe(5);
        });

        it('should work with zero stroke width and preserve fill', () => {
            const circle = new Circle(50);
            circle.stroke(circle.getStrokeColor(), 0);
            circle.fill(Color.RED, 1);
            const anim = new Write(circle);

            anim.interpolate(0.5);

            expect(circle.paths.length).toBeGreaterThan(0);
            expect(circle.getFillOpacity()).toBe(1);
        });
    });
});
