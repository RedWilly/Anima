import { describe, expect, test } from 'bun:test';
import { Circle } from '../../../src/mobjects/geometry/Circle';
import { Rectangle } from '../../../src/mobjects/geometry/Rectangle';
import { Sequence } from '../../../src/core/animations/composition';

describe('VMobject Fluent API', () => {
    describe('VMobject-specific fluent methods', () => {
        test('write() returns same instance', () => {
            const c = new Circle();
            const result = c.write();
            expect(result).toBe(c);
        });

        test('unwrite() returns same instance', () => {
            const c = new Circle();
            const result = c.unwrite();
            expect(result).toBe(c);
        });

        test('draw() returns same instance', () => {
            const c = new Circle();
            const result = c.draw();
            expect(result).toBe(c);
        });

        // test('create() returns same instance', () => {
        //     const c = new Circle();
        //     const result = c.create();
        //     expect(result).toBe(c);
        // });
    });

    describe('VMobject inline duration', () => {
        test('write(2) sets duration to 2 seconds', () => {
            const c = new Circle();
            c.write(2);
            expect(c.getQueuedDuration()).toBe(2);
        });

        test('unwrite(1.5) sets duration to 1.5 seconds', () => {
            const c = new Circle();
            c.unwrite(1.5);
            expect(c.getQueuedDuration()).toBe(1.5);
        });

        test('draw(3) sets duration to 3 seconds', () => {
            const c = new Circle();
            c.draw(3);
            expect(c.getQueuedDuration()).toBe(3);
        });

        // test('create(0.5) sets duration to 0.5 seconds', () => {
        //     const c = new Circle();
        //     c.create(0.5);
        //     expect(c.getQueuedDuration()).toBe(0.5);
        // });
    });

    describe('chaining Mobject and VMobject methods', () => {
        test('can chain fadeIn with write', () => {
            const c = new Circle();
            const result = c.fadeIn(1).write(2);
            expect(result).toBe(c);
            expect(c.getQueuedDuration()).toBe(3);
        });

        // test('can chain multiple VMobject methods', () => {
        //     const c = new Circle();
        //     c.create(1).unwrite(0.5);
        //     expect(c.getQueuedDuration()).toBe(1.5);
        // });

        test('complex chain produces correct sequence', () => {
            const r = new Rectangle();
            r.fadeIn(0.5).write(2).moveTo(50, 50, 1).fadeOut(0.5);
            const anim = r.toAnimation();
            expect(anim).toBeInstanceOf(Sequence);
            expect(anim.getDuration()).toBe(4); // 0.5 + 2 + 1 + 0.5
        });
    });

    describe('different VMobject primitives work', () => {
        test('Circle has fluent API', () => {
            const c = new Circle();
            c.fadeIn(1).write(1);
            expect(c.getQueuedDuration()).toBe(2);
        });

        test('Rectangle has fluent API', () => {
            const r = new Rectangle();
            r.fadeIn(1).draw(1);
            expect(r.getQueuedDuration()).toBe(2);
        });
    });

    describe('toAnimation()', () => {
        test('single VMobject animation returns Animation', () => {
            const c = new Circle();
            c.write(2);
            const anim = c.toAnimation();
            expect(anim.getDuration()).toBe(2);
        });

        test('toAnimation() clears queue', () => {
            const c = new Circle();
            c.write(1);
            c.toAnimation();
            expect(c.hasQueuedAnimations()).toBe(false);
        });
    });
});
