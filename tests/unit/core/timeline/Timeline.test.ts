import { describe, it, expect } from 'bun:test';
import * as fc from 'fast-check';
import { Timeline } from '../../../../src/core/timeline';
import { Animation } from '../../../../src/core/animations/Animation';
import { linear } from '../../../../src/core/animations/easing';
import { Mobject } from '../../../../src/mobjects/Mobject';
import type { AnimationLifecycle } from '../../../../src/core/animations/types';

/**
 * Test animation that tracks update calls with progress values.
 */
class TrackingAnimation extends Animation<Mobject> {
    calls: number[] = [];
    lastProgress = -1;
    readonly lifecycle: AnimationLifecycle = 'introductory';

    constructor(duration = 1) {
        super(new Mobject());
        this.durationSeconds = duration;
        this.easingFn = linear;
    }

    interpolate(progress: number): void {
        this.calls.push(progress);
        this.lastProgress = progress;
    }

    reset(): void {
        this.calls = [];
        this.lastProgress = -1;
    }
}

describe('Timeline', () => {
    describe('Constructor', () => {
        it('should create empty timeline', () => {
            const timeline = new Timeline();
            expect(timeline.getTotalDuration()).toBe(0);
            expect(timeline.getCurrentTime()).toBe(0);
        });

        it('should accept config with loop option', () => {
            const timeline = new Timeline({ loop: true });
            expect(timeline.isLooping()).toBe(true);
        });

        it('should default loop to false', () => {
            const timeline = new Timeline();
            expect(timeline.isLooping()).toBe(false);
        });
    });

    describe('schedule()', () => {
        it('should schedule animation at time 0 by default', () => {
            const timeline = new Timeline();
            const anim = new TrackingAnimation(1);
            timeline.schedule(anim);

            expect(timeline.getScheduled().length).toBe(1);
            expect(timeline.getScheduled()[0]?.startTime).toBe(0);
        });

        it('should schedule animation at specific time', () => {
            const timeline = new Timeline();
            const anim = new TrackingAnimation(1);
            timeline.schedule(anim, 2);

            expect(timeline.getScheduled()[0]?.startTime).toBe(2);
        });

        it('should throw for negative start time', () => {
            const timeline = new Timeline();
            const anim = new TrackingAnimation(1);
            expect(() => timeline.schedule(anim, -1)).toThrow();
        });

        it('should return this for chaining', () => {
            const timeline = new Timeline();
            const anim = new TrackingAnimation(1);
            const result = timeline.schedule(anim, 0);
            expect(result).toBe(timeline);
        });
    });

    describe('scheduleSequence()', () => {
        it('should schedule animations in order', () => {
            const timeline = new Timeline();
            const a = new TrackingAnimation(1);
            const b = new TrackingAnimation(2);
            const c = new TrackingAnimation(3);
            timeline.scheduleSequence([a, b, c]);

            const scheduled = timeline.getScheduled();
            expect(scheduled[0]?.startTime).toBe(0);
            expect(scheduled[1]?.startTime).toBe(1);
            expect(scheduled[2]?.startTime).toBe(3);
        });

        it('should start at specified startTime', () => {
            const timeline = new Timeline();
            const a = new TrackingAnimation(1);
            const b = new TrackingAnimation(1);
            timeline.scheduleSequence([a, b], 5);

            const scheduled = timeline.getScheduled();
            expect(scheduled[0]?.startTime).toBe(5);
            expect(scheduled[1]?.startTime).toBe(6);
        });

        it('should handle empty array', () => {
            const timeline = new Timeline();
            timeline.scheduleSequence([]);
            expect(timeline.getScheduled().length).toBe(0);
        });
    });

    describe('scheduleParallel()', () => {
        it('should schedule all animations at same time', () => {
            const timeline = new Timeline();
            const a = new TrackingAnimation(1);
            const b = new TrackingAnimation(2);
            const c = new TrackingAnimation(3);
            timeline.scheduleParallel([a, b, c]);

            const scheduled = timeline.getScheduled();
            expect(scheduled[0]?.startTime).toBe(0);
            expect(scheduled[1]?.startTime).toBe(0);
            expect(scheduled[2]?.startTime).toBe(0);
        });

        it('should start at specified startTime', () => {
            const timeline = new Timeline();
            const a = new TrackingAnimation(1);
            const b = new TrackingAnimation(2);
            timeline.scheduleParallel([a, b], 3);

            const scheduled = timeline.getScheduled();
            expect(scheduled[0]?.startTime).toBe(3);
            expect(scheduled[1]?.startTime).toBe(3);
        });
    });

    describe('getTotalDuration()', () => {
        it('should return 0 for empty timeline', () => {
            const timeline = new Timeline();
            expect(timeline.getTotalDuration()).toBe(0);
        });

        it('should return correct duration for single animation', () => {
            const timeline = new Timeline();
            const anim = new TrackingAnimation(3);
            timeline.schedule(anim, 0);
            expect(timeline.getTotalDuration()).toBe(3);
        });

        it('should return end time of last animation', () => {
            const timeline = new Timeline();
            const a = new TrackingAnimation(1);
            const b = new TrackingAnimation(2);
            timeline.schedule(a, 0); // ends at 1
            timeline.schedule(b, 3); // ends at 5
            expect(timeline.getTotalDuration()).toBe(5);
        });

        it('should account for animation delay', () => {
            const timeline = new Timeline();
            const anim = new TrackingAnimation(2);
            anim.delay(1); // effective start at 1, ends at 3
            timeline.schedule(anim, 0);
            expect(timeline.getTotalDuration()).toBe(3);
        });
    });

    describe('seek()', () => {
        it('should update animations to state at time 0', () => {
            const timeline = new Timeline();
            const a = new TrackingAnimation(2);
            timeline.schedule(a, 0);

            timeline.seek(0);
            expect(a.lastProgress).toBe(0);
            expect(timeline.getCurrentTime()).toBe(0);
        });

        it('should update animations to state at end', () => {
            const timeline = new Timeline();
            const a = new TrackingAnimation(2);
            timeline.schedule(a, 0);

            timeline.seek(2);
            expect(a.lastProgress).toBe(1);
        });

        it('should update animations to state at midpoint', () => {
            const timeline = new Timeline();
            const a = new TrackingAnimation(2);
            timeline.schedule(a, 0);

            timeline.seek(1);
            expect(a.lastProgress).toBeCloseTo(0.5, 5);
        });

        it('should not start animation before its scheduled time', () => {
            const timeline = new Timeline();
            const a = new TrackingAnimation(1);
            timeline.schedule(a, 2);

            timeline.seek(1);
            expect(a.lastProgress).toBe(0);
        });

        it('should handle negative time by clamping to 0', () => {
            const timeline = new Timeline();
            const a = new TrackingAnimation(2);
            timeline.schedule(a, 0);

            timeline.seek(-5);
            expect(timeline.getCurrentTime()).toBe(0);
        });

        it('should handle animation delays', () => {
            const timeline = new Timeline();
            const anim = new TrackingAnimation(2);
            anim.delay(1); // effective start at 1
            timeline.schedule(anim, 0);

            timeline.seek(0); // before delay
            expect(anim.lastProgress).toBe(0);

            timeline.seek(1); // at delay (animation starts)
            expect(anim.lastProgress).toBe(0);

            timeline.seek(2); // midpoint
            expect(anim.lastProgress).toBeCloseTo(0.5, 5);

            timeline.seek(3); // end
            expect(anim.lastProgress).toBe(1);
        });

        it('should handle overlapping animations', () => {
            const timeline = new Timeline();
            const a = new TrackingAnimation(2);
            const b = new TrackingAnimation(2);
            timeline.schedule(a, 0);
            timeline.schedule(b, 1);

            // At t=1.5, a is at 0.75, b is at 0.25
            timeline.seek(1.5);
            expect(a.lastProgress).toBeCloseTo(0.75, 5);
            expect(b.lastProgress).toBeCloseTo(0.25, 5);
        });
    });

    describe('clear()', () => {
        it('should remove all scheduled animations', () => {
            const timeline = new Timeline();
            const a = new TrackingAnimation(1);
            timeline.schedule(a, 0);
            timeline.seek(1);

            timeline.clear();
            expect(timeline.getScheduled().length).toBe(0);
            expect(timeline.getCurrentTime()).toBe(0);
        });
    });

    describe('Property-based Tests', () => {
        it('total duration equals max end time of all animations', () => {
            fc.assert(
                fc.property(
                    fc.array(
                        fc.record({
                            duration: fc.double({
                                min: 0.1,
                                max: 10,
                                noNaN: true,
                                noDefaultInfinity: true,
                            }),
                            startTime: fc.double({
                                min: 0,
                                max: 10,
                                noNaN: true,
                                noDefaultInfinity: true,
                            }),
                        }),
                        { minLength: 0, maxLength: 10 }
                    ),
                    (items) => {
                        const timeline = new Timeline();
                        for (const item of items) {
                            const anim = new TrackingAnimation(item.duration);
                            timeline.schedule(anim, item.startTime);
                        }

                        const expectedMax =
                            items.length === 0
                                ? 0
                                : Math.max(
                                    ...items.map(
                                        (i) => i.startTime + i.duration
                                    )
                                );

                        return (
                            Math.abs(timeline.getTotalDuration() - expectedMax) <
                            0.0001
                        );
                    }
                )
            );
        });

        it('seek to 0 sets all animations to progress 0', () => {
            fc.assert(
                fc.property(
                    fc.array(
                        fc.double({
                            min: 0.1,
                            max: 5,
                            noNaN: true,
                            noDefaultInfinity: true,
                        }),
                        { minLength: 1, maxLength: 5 }
                    ),
                    (durations) => {
                        const timeline = new Timeline();
                        const animations = durations.map(
                            (d) => new TrackingAnimation(d)
                        );
                        for (const anim of animations) {
                            timeline.schedule(anim, 0);
                        }

                        timeline.seek(0);

                        return animations.every((a) => a.lastProgress === 0);
                    }
                )
            );
        });

        it('seek to totalDuration sets all animations to progress 1', () => {
            fc.assert(
                fc.property(
                    fc.array(
                        fc.double({
                            min: 0.1,
                            max: 5,
                            noNaN: true,
                            noDefaultInfinity: true,
                        }),
                        { minLength: 1, maxLength: 5 }
                    ),
                    (durations) => {
                        const timeline = new Timeline();
                        const animations = durations.map(
                            (d) => new TrackingAnimation(d)
                        );
                        for (const anim of animations) {
                            timeline.schedule(anim, 0);
                        }

                        timeline.seek(timeline.getTotalDuration());

                        return animations.every((a) => a.lastProgress === 1);
                    }
                )
            );
        });
    });
});
