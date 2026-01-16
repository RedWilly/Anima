import { describe, it, expect } from 'bun:test';
import { Draw } from '../../../../src/core/animations';
import { Circle } from '../../../../src/mobjects/geometry/Circle';
import { Rectangle } from '../../../../src/mobjects/geometry/Rectangle';
import { VMobject } from '../../../../src/mobjects/VMobject';
import { Color } from '../../../../src/core/math/color/Color';

describe('Draw Animation', () => {
    describe('PRD Requirements', () => {
        it('should draw border progressively in first half', () => {
            const rect = new Rectangle(100, 50);
            rect.fill(Color.RED, 0.8);
            const originalLength = rect.paths[0]?.getLength() ?? 0;
            const anim = new Draw(rect);

            // At 25% progress (first half of animation)
            anim.interpolate(0.25);

            // Should have partial path
            expect(rect.paths.length).toBeGreaterThan(0);
            const partialLength = rect.paths[0]?.getLength() ?? 0;
            expect(partialLength).toBeLessThan(originalLength);

            // Fill should be disabled during stroke phase
            expect(rect.fillOpacity).toBe(0);
        });

        it('should fill shape in second half', () => {
            const rect = new Rectangle(100, 50);
            rect.fill(Color.RED, 0.8);
            const originalLength = rect.paths[0]?.getLength() ?? 0;
            const anim = new Draw(rect);

            // At 75% progress (second half of animation)
            anim.interpolate(0.75);

            // Should have full paths
            expect(rect.paths.length).toBeGreaterThan(0);
            const finalLength = rect.paths[0]?.getLength() ?? 0;
            expect(finalLength).toBeCloseTo(originalLength, 1);

            // Fill opacity should be partially visible
            expect(rect.fillOpacity).toBeGreaterThan(0);
            expect(rect.fillOpacity).toBeLessThan(0.8);
        });

        it('should show full shape with fill when interpolate(1)', () => {
            const rect = new Rectangle(100, 50);
            rect.fill(Color.RED, 0.8);
            const originalLength = rect.paths[0]?.getLength() ?? 0;
            const anim = new Draw(rect);

            anim.interpolate(1);

            expect(rect.paths.length).toBeGreaterThan(0);
            const finalLength = rect.paths[0]?.getLength() ?? 0;
            expect(finalLength).toBeCloseTo(originalLength, 1);
            expect(rect.fillOpacity).toBeCloseTo(0.8, 3);
        });
    });

    describe('Edge Cases', () => {
        it('should show nothing when interpolate(0)', () => {
            const circle = new Circle(50);
            circle.fill(Color.BLUE, 1);
            const anim = new Draw(circle);

            anim.interpolate(0);

            expect(circle.paths.length).toBe(0);
            expect(circle.opacity).toBe(0);
        });

        it('should handle VMobject without fill', () => {
            const circle = new Circle(50);
            // No fill set, fillOpacity is 0
            const anim = new Draw(circle);

            anim.interpolate(0.75);

            expect(circle.fillOpacity).toBe(0);
        });

        it('should handle transition at exactly 50%', () => {
            const rect = new Rectangle(100, 50);
            rect.fill(Color.GREEN, 1);
            const originalLength = rect.paths[0]?.getLength() ?? 0;
            const anim = new Draw(rect);

            anim.interpolate(0.5);

            // Should have full stroke
            const length = rect.paths[0]?.getLength() ?? 0;
            expect(length).toBeCloseTo(originalLength, 1);

            // Fill should be starting (0% of original)
            expect(rect.fillOpacity).toBe(0);
        });

        it('should inherit Animation defaults', () => {
            const circle = new Circle(50);
            const anim = new Draw(circle);
            expect(anim.getDuration()).toBe(1);
            expect(anim.getDelay()).toBe(0);
        });

        it('should support fluent chaining', () => {
            const circle = new Circle(50);
            const anim = new Draw(circle).duration(2).delay(0.5);
            expect(anim.getDuration()).toBe(2);
            expect(anim.getDelay()).toBe(0.5);
        });
    });

    describe('Stroke/Fill Combinations', () => {
        it('should handle stroke only (no fill)', () => {
            const circle = new Circle(50);
            circle.stroke(Color.RED, 3);
            circle.fillOpacity = 0;
            const anim = new Draw(circle);

            anim.interpolate(0.25);
            expect(circle.paths.length).toBeGreaterThan(0);
            expect(circle.fillOpacity).toBe(0);

            anim.interpolate(0.75);
            expect(circle.fillOpacity).toBe(0);

            anim.interpolate(1);
            expect(circle.fillOpacity).toBe(0);
        });

        it('should handle fill only (no stroke in visual sense)', () => {
            const rect = new Rectangle(100, 50);
            rect.strokeWidth = 0;
            rect.fill(Color.BLUE, 1);
            const anim = new Draw(rect);

            anim.interpolate(0.5);
            expect(rect.fillOpacity).toBe(0);

            anim.interpolate(1);
            expect(rect.fillOpacity).toBe(1);
        });

        it('should handle both stroke and fill', () => {
            const rect = new Rectangle(100, 50);
            rect.stroke(Color.GREEN, 2);
            rect.fill(Color.YELLOW, 0.8);
            const anim = new Draw(rect);

            // First half - stroke only
            anim.interpolate(0.25);
            expect(rect.fillOpacity).toBe(0);
            expect(rect.strokeWidth).toBe(2);

            // Second half - fill fades in
            anim.interpolate(0.75);
            expect(rect.fillOpacity).toBeGreaterThan(0);
            expect(rect.fillOpacity).toBeLessThan(0.8);
            expect(rect.strokeWidth).toBe(2);

            // Complete
            anim.interpolate(1);
            expect(rect.fillOpacity).toBeCloseTo(0.8, 3);
        });

        it('should preserve stroke properties throughout animation', () => {
            const circle = new Circle(50);
            circle.stroke(Color.BLUE, 5);
            circle.fill(Color.RED, 0.5);
            const anim = new Draw(circle);

            anim.interpolate(0.1);
            expect(circle.strokeWidth).toBe(5);

            anim.interpolate(0.5);
            expect(circle.strokeWidth).toBe(5);

            anim.interpolate(0.9);
            expect(circle.strokeWidth).toBe(5);

            anim.interpolate(1);
            expect(circle.strokeWidth).toBe(5);
        });

        it('should correctly calculate fill opacity at various points', () => {
            const rect = new Rectangle(100, 50);
            rect.fill(Color.GREEN, 1);
            const anim = new Draw(rect);

            anim.interpolate(0.5);
            expect(rect.fillOpacity).toBe(0);

            anim.interpolate(0.75);
            expect(rect.fillOpacity).toBeCloseTo(0.5, 2);

            anim.interpolate(1);
            expect(rect.fillOpacity).toBeCloseTo(1, 2);
        });
    });
});
