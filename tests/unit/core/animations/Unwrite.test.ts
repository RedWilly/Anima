import { describe, it, expect } from 'bun:test';
import { Unwrite } from '../../../../src/core/animations';
import { Circle } from '../../../../src/mobjects/geometry/Circle';
import { Rectangle } from '../../../../src/mobjects/geometry/Rectangle';
import { VMobject } from '../../../../src/mobjects/VMobject';
import { Vector2 } from '../../../../src/core/math/Vector2/Vector2';
import { BezierPath } from '../../../../src/core/math/bezier/BezierPath';
import { Color } from '../../../../src/core/math/color/Color';

describe('Unwrite Animation', () => {
    describe('PRD Requirements', () => {
        it('should show full stroke when interpolate(0)', () => {
            const circle = new Circle(50);
            const originalLength = circle.paths[0]?.getLength() ?? 0;
            const anim = new Unwrite(circle);

            anim.interpolate(0);

            expect(circle.paths.length).toBeGreaterThan(0);
            const finalLength = circle.paths[0]?.getLength() ?? 0;
            expect(finalLength).toBeCloseTo(originalLength, 1);
        });

        it('should show half the stroke when interpolate(0.5)', () => {
            const circle = new Circle(50);
            const originalLength = circle.paths[0]?.getLength() ?? 0;
            const anim = new Unwrite(circle);

            anim.interpolate(0.5);

            expect(circle.paths.length).toBeGreaterThan(0);
            const partialLength = circle.paths[0]?.getLength() ?? 0;
            expect(partialLength).toBeLessThan(originalLength);
            expect(partialLength).toBeGreaterThan(0);
        });

        it('should show nothing when interpolate(1)', () => {
            const circle = new Circle(50);
            const anim = new Unwrite(circle);

            anim.interpolate(1);

            expect(circle.paths.length).toBe(0);
            expect(circle.opacity).toBe(0);
        });

        it('should simulate natural erasing motion (reverse of write)', () => {
            const circle = new Circle(50);
            const originalLength = circle.paths[0]?.getLength() ?? 0;
            const anim = new Unwrite(circle);

            // At 25% unwrite, should have 75% of stroke
            anim.interpolate(0.25);

            const length = circle.paths[0]?.getLength() ?? 0;
            const expectedLength = originalLength * 0.75;
            expect(length).toBeCloseTo(expectedLength, 0);
        });
    });

    describe('Edge Cases', () => {
        it('should handle simple line path', () => {
            const vmob = new VMobject();
            const path = new BezierPath();
            path.moveTo(new Vector2(0, 0));
            path.lineTo(new Vector2(100, 0));
            vmob.addPath(path);

            const anim = new Unwrite(vmob);
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

            const anim = new Unwrite(vmob);
            anim.interpolate(0.5);

            expect(vmob.paths.length).toBe(2);
        });

        it('should handle Rectangle shape', () => {
            const rect = new Rectangle(100, 50);
            const anim = new Unwrite(rect);

            anim.interpolate(0.5);

            expect(rect.paths.length).toBeGreaterThan(0);
        });

        it('should inherit Animation defaults', () => {
            const circle = new Circle(50);
            const anim = new Unwrite(circle);
            expect(anim.getDuration()).toBe(1);
            expect(anim.getDelay()).toBe(0);
        });

        it('should support fluent chaining', () => {
            const circle = new Circle(50);
            const anim = new Unwrite(circle).duration(2).delay(0.5);
            expect(anim.getDuration()).toBe(2);
            expect(anim.getDelay()).toBe(0.5);
        });

        it('should return correct target', () => {
            const circle = new Circle(50);
            const anim = new Unwrite(circle);
            expect(anim.getTarget()).toBe(circle);
        });
    });

    describe('Stroke/Fill Combinations', () => {
        it('should handle stroke only (no fill)', () => {
            const circle = new Circle(50);
            circle.stroke(Color.RED, 3);
            circle.fillOpacity = 0;
            const anim = new Unwrite(circle);

            anim.interpolate(0.5);

            expect(circle.paths.length).toBeGreaterThan(0);
            expect(circle.strokeWidth).toBe(3);
        });

        it('should preserve fill during unwrite', () => {
            const rect = new Rectangle(100, 50);
            rect.stroke(Color.GREEN, 2);
            rect.fill(Color.YELLOW, 0.8);
            const anim = new Unwrite(rect);

            anim.interpolate(0.5);

            // Unwrite preserves fill (like Manim)
            expect(rect.fillOpacity).toBe(0.8);
        });

        it('should preserve stroke properties during animation', () => {
            const circle = new Circle(50);
            circle.stroke(Color.BLUE, 5);
            const anim = new Unwrite(circle);

            anim.interpolate(0);
            expect(circle.strokeWidth).toBe(5);

            anim.interpolate(0.5);
            expect(circle.strokeWidth).toBe(5);
        });

        it('should work with both stroke and fill set', () => {
            const rect = new Rectangle(80, 60);
            rect.stroke(Color.RED, 4);
            rect.fill(Color.GREEN, 1);
            const anim = new Unwrite(rect);

            anim.interpolate(0);
            expect(rect.paths.length).toBeGreaterThan(0);
            expect(rect.fillOpacity).toBe(1);

            anim.interpolate(0.5);
            expect(rect.fillOpacity).toBe(1);

            anim.interpolate(1);
            expect(rect.paths.length).toBe(0);
        });
    });
});
