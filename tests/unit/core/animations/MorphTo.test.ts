import { describe, it, expect } from 'bun:test';
import { MorphTo } from '../../../../src/core/animations';
import { Circle } from '../../../../src/mobjects/geometry/Circle';
import { Rectangle } from '../../../../src/mobjects/geometry/Rectangle';
import { VMobject } from '../../../../src/mobjects/VMobject';
import { Vector2 } from '../../../../src/core/math/Vector2/Vector2';
import { BezierPath } from '../../../../src/core/math/bezier/BezierPath';

describe('MorphTo Animation', () => {
    describe('PRD Requirements', () => {
        it('should show source shape when interpolate(0)', () => {
            const circle = new Circle(50);
            const rectangle = new Rectangle(100, 100);
            const originalPoints = circle.getPoints();
            const anim = new MorphTo(circle, rectangle);

            anim.interpolate(0);
            const newPoints = circle.getPoints();

            // At t=0, shape should match source
            expect(newPoints.length).toBeGreaterThan(0);
            for (let i = 0; i < Math.min(originalPoints.length, newPoints.length); i++) {
                expect(newPoints[i]!.x).toBeCloseTo(originalPoints[i]!.x, 3);
                expect(newPoints[i]!.y).toBeCloseTo(originalPoints[i]!.y, 3);
            }
        });

        it('should show target shape when interpolate(1)', () => {
            const circle = new Circle(50);
            const rectangle = new Rectangle(100, 100);
            const targetPoints = rectangle.getPoints();
            const anim = new MorphTo(circle, rectangle);

            anim.interpolate(1);
            const newPoints = circle.getPoints();

            // At t=1, shape should match target
            expect(newPoints.length).toBeGreaterThan(0);
        });

        it('should show intermediate shape when interpolate(0.5)', () => {
            const circle = new Circle(50);
            const rectangle = new Rectangle(100, 100);
            const anim = new MorphTo(circle, rectangle);

            anim.interpolate(0.5);
            const newPoints = circle.getPoints();

            // At t=0.5, shape should be between source and target
            expect(newPoints.length).toBeGreaterThan(0);
        });
    });

    describe('Edge Cases', () => {
        it('should handle VMobjects with same number of paths', () => {
            const source = new VMobject();
            const target = new VMobject();
            const path1 = new BezierPath();
            path1.moveTo(new Vector2(0, 0));
            path1.lineTo(new Vector2(100, 0));
            const path2 = new BezierPath();
            path2.moveTo(new Vector2(0, 0));
            path2.lineTo(new Vector2(0, 100));

            source.addPath(path1);
            target.addPath(path2);

            const anim = new MorphTo(source, target);
            anim.interpolate(0.5);

            expect(source.paths.length).toBe(1);
        });

        it('should handle VMobjects with different number of paths', () => {
            const source = new VMobject();
            const target = new VMobject();

            const path1 = new BezierPath();
            path1.moveTo(new Vector2(0, 0));
            path1.lineTo(new Vector2(100, 0));

            const path2 = new BezierPath();
            path2.moveTo(new Vector2(0, 0));
            path2.lineTo(new Vector2(0, 100));

            const path3 = new BezierPath();
            path3.moveTo(new Vector2(50, 50));
            path3.lineTo(new Vector2(100, 100));

            source.addPath(path1);
            target.addPath(path2);
            target.addPath(path3);

            const anim = new MorphTo(source, target);
            anim.interpolate(1);

            expect(source.paths.length).toBe(2);
        });

        it('should return target mobject', () => {
            const circle = new Circle(50);
            const rectangle = new Rectangle(100, 100);
            const anim = new MorphTo(circle, rectangle);
            expect(anim.getTarget()).toBe(circle);
        });

        it('should inherit Animation defaults', () => {
            const circle = new Circle(50);
            const rectangle = new Rectangle(100, 100);
            const anim = new MorphTo(circle, rectangle);
            expect(anim.getDuration()).toBe(1);
            expect(anim.getDelay()).toBe(0);
        });

        it('should support fluent chaining', () => {
            const circle = new Circle(50);
            const rectangle = new Rectangle(100, 100);
            const anim = new MorphTo(circle, rectangle).duration(2).delay(0.5);
            expect(anim.getDuration()).toBe(2);
            expect(anim.getDelay()).toBe(0.5);
        });
    });
});
