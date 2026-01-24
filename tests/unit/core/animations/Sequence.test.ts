import { describe, it, expect } from 'bun:test';
import * as fc from 'fast-check';
import { Sequence, linear, Animation, Mobject } from '../../../../src';
import type { EasingFunction } from '../../../../src';
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

describe('Sequence Animation Container', () => {
    describe('Constructor', () => {
        it('should accept empty array', () => {
            const seq = new Sequence([]);
            expect(seq.getDuration()).toBe(0);
        });

        it('should accept single animation', () => {
            const anim = new TrackingAnimation(2);
            const seq = new Sequence([anim]);
            expect(seq.getDuration()).toBe(2);
        });

        it('should calculate total duration as sum of children', () => {
            const a = new TrackingAnimation(1);
            const b = new TrackingAnimation(2);
            const c = new TrackingAnimation(3);
            const seq = new Sequence([a, b, c]);
            expect(seq.getDuration()).toBe(6);
        });

        it('should return children via getChildren()', () => {
            const a = new TrackingAnimation(1);
            const b = new TrackingAnimation(2);
            const seq = new Sequence([a, b]);
            expect(seq.getChildren()).toEqual([a, b]);
        });
    });

    describe('Sequential Execution', () => {
        it('should update first child at progress 0', () => {
            const a = new TrackingAnimation(1);
            const b = new TrackingAnimation(1);
            const seq = new Sequence([a, b]);
            seq.ease(linear);
            seq.update(0);
            expect(a.calls.length).toBeGreaterThan(0);
            expect(a.calls[0]).toBe(0);
        });

        it('should complete first child before starting second', () => {
            const a = new TrackingAnimation(1);
            const b = new TrackingAnimation(1);
            const seq = new Sequence([a, b]);
            seq.ease(linear);

            // At 50% of total duration (2s), first animation should be done
            seq.update(0.5);
            const lastCallA = a.calls[a.calls.length - 1];
            expect(lastCallA).toBe(1); // First should be complete
        });

        it('should update second child in second half', () => {
            const a = new TrackingAnimation(1);
            const b = new TrackingAnimation(1);
            const seq = new Sequence([a, b]);
            seq.ease(linear);

            // At 75% of total duration, second animation should be at 50%
            seq.update(0.75);
            const lastCallB = b.calls[b.calls.length - 1];
            expect(lastCallB).toBeCloseTo(0.5, 5);
        });

        it('should complete all animations at progress 1', () => {
            const a = new TrackingAnimation(1);
            const b = new TrackingAnimation(1);
            const c = new TrackingAnimation(1);
            const seq = new Sequence([a, b, c]);
            seq.ease(linear);
            seq.update(1);

            expect(a.calls[a.calls.length - 1]).toBe(1);
            expect(b.calls[b.calls.length - 1]).toBe(1);
            expect(c.calls[c.calls.length - 1]).toBe(1);
        });

        it('should handle unequal durations correctly', () => {
            const a = new TrackingAnimation(1); // 0-1
            const b = new TrackingAnimation(3); // 1-4
            const seq = new Sequence([a, b]); // total = 4
            seq.ease(linear);

            // At t=2 (50%), first done, second at (2-1)/3 = 0.333
            seq.update(0.5);
            expect(a.calls[a.calls.length - 1]).toBe(1);
            expect(b.calls[b.calls.length - 1]).toBeCloseTo(1 / 3, 5);
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty sequence gracefully', () => {
            const seq = new Sequence([]);
            seq.ease(linear);
            expect(() => seq.update(0.5)).not.toThrow();
        });

        it('should handle single animation sequence', () => {
            const a = new TrackingAnimation(2);
            const seq = new Sequence([a]);
            seq.ease(linear);
            seq.update(0.5);
            expect(a.calls[a.calls.length - 1]).toBeCloseTo(0.5, 5);
        });
    });

    describe('Property-based Tests', () => {
        it('should have total duration equal to sum of child durations', () => {
            fc.assert(
                fc.property(
                    fc.array(
                        fc.double({ min: 0.1, max: 10, noNaN: true, noDefaultInfinity: true }),
                        { minLength: 0, maxLength: 10 }
                    ),
                    (durations) => {
                        const animations = durations.map((d) => new TrackingAnimation(d));
                        const seq = new Sequence(animations);
                        const expectedSum = durations.reduce((a, b) => a + b, 0);
                        return Math.abs(seq.getDuration() - expectedSum) < 0.0001;
                    }
                )
            );
        });
    });
});
