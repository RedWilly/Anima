import { describe, expect, test } from 'bun:test';
import { Circle } from '../../../src/mobjects/geometry/Circle';
import { Sequence } from '../../../src/core/animations/composition';
import { linear } from '../../../src/core/animations/easing';

describe('Mobject Fluent API', () => {
    describe('fluent method chaining', () => {
        test('fadeIn() returns same instance', () => {
            const c = new Circle();
            const result = c.fadeIn();
            expect(result).toBe(c);
        });

        test('fadeOut() returns same instance', () => {
            const c = new Circle();
            const result = c.fadeOut();
            expect(result).toBe(c);
        });

        test('moveTo() returns same instance', () => {
            const c = new Circle();
            const result = c.moveTo(100, 50);
            expect(result).toBe(c);
        });

        test('rotate() returns same instance', () => {
            const c = new Circle();
            const result = c.rotate(Math.PI / 2);
            expect(result).toBe(c);
        });

        test('scaleTo() returns same instance', () => {
            const c = new Circle();
            const result = c.scaleTo(2);
            expect(result).toBe(c);
        });

        test('chain multiple methods', () => {
            const c = new Circle();
            const result = c.fadeIn().moveTo(100, 0).rotate(Math.PI / 2);
            expect(result).toBe(c);
        });
    });

    describe('inline duration parameter', () => {
        test('fadeIn(2) sets duration to 2 seconds', () => {
            const c = new Circle();
            c.fadeIn(2);
            expect(c.getQueuedDuration()).toBe(2);
        });

        test('moveTo(x, y, 1.5) sets duration to 1.5 seconds', () => {
            const c = new Circle();
            c.moveTo(100, 50, 1.5);
            expect(c.getQueuedDuration()).toBe(1.5);
        });

        test('rotate(angle, 0.5) sets duration to 0.5 seconds', () => {
            const c = new Circle();
            c.rotate(Math.PI, 0.5);
            expect(c.getQueuedDuration()).toBe(0.5);
        });

        test('scaleTo(factor, 3) sets duration to 3 seconds', () => {
            const c = new Circle();
            c.scaleTo(2, 3);
            expect(c.getQueuedDuration()).toBe(3);
        });
    });

    describe('default duration', () => {
        test('fadeIn() without duration defaults to 1 second', () => {
            const c = new Circle();
            c.fadeIn();
            expect(c.getQueuedDuration()).toBe(1);
        });

        test('moveTo() without duration defaults to 1 second', () => {
            const c = new Circle();
            c.moveTo(50, 50);
            expect(c.getQueuedDuration()).toBe(1);
        });
    });

    describe('duration() modifier', () => {
        test('duration(2) overrides previous duration', () => {
            const c = new Circle();
            c.fadeIn().duration(2);
            expect(c.getQueuedDuration()).toBe(2);
        });

        test('inline and modifier are equivalent', () => {
            const c1 = new Circle();
            c1.fadeIn(2);

            const c2 = new Circle();
            c2.fadeIn().duration(2);

            expect(c1.getQueuedDuration()).toBe(c2.getQueuedDuration());
        });
    });

    describe('ease() modifier', () => {
        test('ease() can be chained', () => {
            const c = new Circle();
            const result = c.fadeIn().ease(linear);
            expect(result).toBe(c);
        });
    });

    describe('toAnimation()', () => {
        test('single animation returns Animation', () => {
            const c = new Circle();
            c.fadeIn(2);
            const anim = c.toAnimation();
            expect(anim.getDuration()).toBe(2);
        });

        test('multiple animations return Sequence', () => {
            const c = new Circle();
            c.fadeIn(1).moveTo(100, 0, 2).rotate(Math.PI, 0.5);
            const anim = c.toAnimation();
            expect(anim).toBeInstanceOf(Sequence);
            expect(anim.getDuration()).toBe(3.5); // 1 + 2 + 0.5
        });

        test('toAnimation() clears the queue', () => {
            const c = new Circle();
            c.fadeIn(1);
            c.toAnimation();
            expect(c.hasQueuedAnimations()).toBe(false);
        });
    });

    describe('hasQueuedAnimations()', () => {
        test('returns false when queue is empty', () => {
            const c = new Circle();
            expect(c.hasQueuedAnimations()).toBe(false);
        });

        test('returns true after queueing animation', () => {
            const c = new Circle();
            c.fadeIn();
            expect(c.hasQueuedAnimations()).toBe(true);
        });
    });

    describe('chained animations execute sequentially', () => {
        test('total duration is sum of individual durations', () => {
            const c = new Circle();
            c.fadeIn(1).moveTo(100, 0, 2).rotate(Math.PI, 1);
            expect(c.getQueuedDuration()).toBe(4);
        });
    });

    describe('parallel() with method calls', () => {
        test('parallel() returns same instance', () => {
            const c = new Circle();
            const result = c.parallel(c.moveTo(100, 50), c.rotate(Math.PI));
            expect(result).toBe(c);
        });

        test('parallel animations have duration of longest animation', () => {
            const c = new Circle();
            c.parallel(
                c.moveTo(100, 50, 2),
                c.rotate(Math.PI, 1),
                c.scaleTo(2, 3)
            );
            // Parallel duration = max of children = 3
            expect(c.getQueuedDuration()).toBe(3);
        });

        test('sequential then parallel then sequential', () => {
            const c = new Circle();
            c.fadeIn(1)
                .parallel(c.moveTo(100, 50, 2), c.rotate(Math.PI, 2))
                .fadeOut(1);
            // 1 + 2 (parallel takes max) + 1 = 4
            expect(c.getQueuedDuration()).toBe(4);
        });

        test('toAnimation() includes parallel animations in sequence', () => {
            const { Parallel } = require('../../../src/core/animations/composition');
            const c = new Circle();
            c.fadeIn(1).parallel(c.moveTo(100, 50, 2), c.rotate(Math.PI, 2));
            const anim = c.toAnimation();
            expect(anim).toBeInstanceOf(Sequence);
            expect(anim.getDuration()).toBe(3); // 1 + 2
        });

        test('empty parallel() is a no-op', async () => {
            const c = new Circle();
            c.fadeIn(1).parallel();
            expect(c.getQueuedDuration()).toBe(1);
        });
    });
});
