import { describe, it, expect } from 'bun:test';
import * as fc from 'fast-check';
import { Parallel, linear } from '../../../../src/core/animations';
import { Animation } from '../../../../src/core/animations/Animation';
import { Mobject } from '../../../../src/mobjects/Mobject';
import type { EasingFunction } from '../../../../src/core/animations/easing';
import type { AnimationLifecycle } from '../../../../src/core/animations/types';

/**
 * Test animation that tracks interpolate calls with progress values.
 */
class TrackingAnimation extends Animation<Mobject> {
    calls: number[] = [];
    readonly lifecycle: AnimationLifecycle = 'introductory';

    constructor(duration = 1, easing: EasingFunction = linear) {
        super(new Mobject());
        this.durationSeconds = duration;
        this.easingFn = easing;
    }

    interpolate(progress: number): void {
        this.calls.push(progress);
    }
}

describe('Parallel Animation Container', () => {
    describe('Constructor', () => {
        it('should accept empty array', () => {
            const par = new Parallel([]);
            expect(par.getDuration()).toBe(0);
        });

        it('should accept single animation', () => {
            const anim = new TrackingAnimation(2);
            const par = new Parallel([anim]);
            expect(par.getDuration()).toBe(2);
        });

        it('should calculate total duration as max of children', () => {
            const a = new TrackingAnimation(1);
            const b = new TrackingAnimation(3);
            const c = new TrackingAnimation(2);
            const par = new Parallel([a, b, c]);
            expect(par.getDuration()).toBe(3);
        });

        it('should return children via getChildren()', () => {
            const a = new TrackingAnimation(1);
            const b = new TrackingAnimation(2);
            const par = new Parallel([a, b]);
            expect(par.getChildren()).toEqual([a, b]);
        });
    });

    describe('Parallel Execution', () => {
        it('should start all animations at progress 0', () => {
            const a = new TrackingAnimation(1);
            const b = new TrackingAnimation(2);
            const par = new Parallel([a, b]);
            par.ease(linear);
            par.update(0);

            expect(a.calls[0]).toBe(0);
            expect(b.calls[0]).toBe(0);
        });

        it('should run all animations concurrently', () => {
            const a = new TrackingAnimation(2);
            const b = new TrackingAnimation(2);
            const par = new Parallel([a, b]);
            par.ease(linear);
            par.update(0.5);

            // Both should be at 50%
            expect(a.calls[a.calls.length - 1]).toBeCloseTo(0.5, 5);
            expect(b.calls[b.calls.length - 1]).toBeCloseTo(0.5, 5);
        });

        it('should complete shorter animation before longer one', () => {
            const a = new TrackingAnimation(1); // finishes at 1s
            const b = new TrackingAnimation(2); // finishes at 2s
            const par = new Parallel([a, b]); // duration = 2
            par.ease(linear);

            // At 75% (1.5s), a should be complete, b at 75%
            par.update(0.75);
            expect(a.calls[a.calls.length - 1]).toBe(1);
            expect(b.calls[b.calls.length - 1]).toBeCloseTo(0.75, 5);
        });

        it('should complete all animations at progress 1', () => {
            const a = new TrackingAnimation(1);
            const b = new TrackingAnimation(2);
            const c = new TrackingAnimation(3);
            const par = new Parallel([a, b, c]);
            par.ease(linear);
            par.update(1);

            expect(a.calls[a.calls.length - 1]).toBe(1);
            expect(b.calls[b.calls.length - 1]).toBe(1);
            expect(c.calls[c.calls.length - 1]).toBe(1);
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty parallel gracefully', () => {
            const par = new Parallel([]);
            par.ease(linear);
            expect(() => par.update(0.5)).not.toThrow();
        });

        it('should handle single animation parallel', () => {
            const a = new TrackingAnimation(2);
            const par = new Parallel([a]);
            par.ease(linear);
            par.update(0.5);
            expect(a.calls[a.calls.length - 1]).toBeCloseTo(0.5, 5);
        });

        it('should handle all same duration', () => {
            const a = new TrackingAnimation(1);
            const b = new TrackingAnimation(1);
            const c = new TrackingAnimation(1);
            const par = new Parallel([a, b, c]);
            par.ease(linear);
            par.update(0.5);

            expect(a.calls[a.calls.length - 1]).toBeCloseTo(0.5, 5);
            expect(b.calls[b.calls.length - 1]).toBeCloseTo(0.5, 5);
            expect(c.calls[c.calls.length - 1]).toBeCloseTo(0.5, 5);
        });
    });

    describe('Property-based Tests', () => {
        it('should have total duration equal to max of child durations', () => {
            fc.assert(
                fc.property(
                    fc.array(
                        fc.double({ min: 0.1, max: 10, noNaN: true, noDefaultInfinity: true }),
                        { minLength: 1, maxLength: 10 }
                    ),
                    (durations) => {
                        const animations = durations.map((d) => new TrackingAnimation(d));
                        const par = new Parallel(animations);
                        const expectedMax = Math.max(...durations);
                        return Math.abs(par.getDuration() - expectedMax) < 0.0001;
                    }
                )
            );
        });

        it('should complete all animations at progress 1', () => {
            fc.assert(
                fc.property(
                    fc.array(
                        fc.double({ min: 0.1, max: 10, noNaN: true, noDefaultInfinity: true }),
                        { minLength: 1, maxLength: 5 }
                    ),
                    (durations) => {
                        const animations = durations.map((d) => new TrackingAnimation(d));
                        const par = new Parallel(animations);
                        par.ease(linear);
                        par.update(1);

                        return animations.every((a) => {
                            const lastCall = a.calls[a.calls.length - 1];
                            return lastCall !== undefined && Math.abs(lastCall - 1) < 0.0001;
                        });
                    }
                )
            );
        });
    });
});
