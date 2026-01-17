import { describe, expect, test } from 'bun:test';
import fc from 'fast-check';
import { Circle } from '../../src/mobjects/geometry/Circle';
import { Rectangle } from '../../src/mobjects/geometry/Rectangle';
import { Sequence } from '../../src/core/animations/composition';

// Use fc.double for duration values since they don't require 32-bit precision
const positiveDuration = fc.double({ min: 0.01, max: 100, noNaN: true });
const smallDuration = fc.double({ min: 0.01, max: 10, noNaN: true });
const tinyDuration = fc.double({ min: 0.1, max: 5, noNaN: true });

describe('Mobject Fluent API property tests', () => {
    test('any positive duration produces valid animation', () => {
        fc.assert(
            fc.property(positiveDuration, (duration) => {
                const c = new Circle();
                c.fadeIn(duration);
                const anim = c.toAnimation();
                return anim.getDuration() === duration;
            })
        );
    });

    test('chained methods produce sequence with summed duration', () => {
        fc.assert(
            fc.property(smallDuration, smallDuration, smallDuration, (d1, d2, d3) => {
                const c = new Circle();
                c.fadeIn(d1).moveTo(0, 0, d2).rotate(0, d3);
                const anim = c.toAnimation();
                const expectedDuration = d1 + d2 + d3;
                return Math.abs(anim.getDuration() - expectedDuration) < 0.0001;
            })
        );
    });

    test('every fluent method returns the same instance', () => {
        fc.assert(
            fc.property(fc.integer({ min: 1, max: 5 }), (methodIndex) => {
                const c = new Circle();
                let result: Circle;
                switch (methodIndex) {
                    case 1:
                        result = c.fadeIn();
                        break;
                    case 2:
                        result = c.fadeOut();
                        break;
                    case 3:
                        result = c.moveTo(0, 0);
                        break;
                    case 4:
                        result = c.rotate(0);
                        break;
                    default:
                        result = c.scaleTo(1);
                        break;
                }
                return result === c;
            })
        );
    });

    test('queued duration matches getQueuedDuration', () => {
        fc.assert(
            fc.property(
                fc.array(tinyDuration, { minLength: 1, maxLength: 5 }),
                (durations) => {
                    const c = new Circle();
                    for (const d of durations) {
                        c.fadeIn(d);
                    }
                    const expectedTotal = durations.reduce((sum, d) => sum + d, 0);
                    return Math.abs(c.getQueuedDuration() - expectedTotal) < 0.0001;
                }
            )
        );
    });
});

describe('VMobject Fluent API property tests', () => {
    test('VMobject animation durations are preserved', () => {
        fc.assert(
            fc.property(smallDuration, (duration) => {
                const c = new Circle();
                c.write(duration);
                return c.getQueuedDuration() === duration;
            })
        );
    });

    test('mixed chain produces correct total duration', () => {
        fc.assert(
            fc.property(smallDuration, smallDuration, (d1, d2) => {
                const r = new Rectangle();
                r.fadeIn(d1).write(d2);
                const expectedDuration = d1 + d2;
                return Math.abs(r.getQueuedDuration() - expectedDuration) < 0.0001;
            })
        );
    });
});
