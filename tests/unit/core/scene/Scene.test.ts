import { describe, it, expect } from 'bun:test';
import * as fc from 'fast-check';
import { Scene } from '../../../../src/core/scene';
import { Animation } from '../../../../src/core/animations/Animation';
import type { AnimationLifecycle } from '../../../../src/core/animations/types';
import { linear } from '../../../../src/core/animations/easing';
import { Mobject } from '../../../../src/mobjects/Mobject';
import { Color } from '../../../../src/core/math/color/Color';

/**
 * Test animation that tracks update calls.
 * Uses 'introductory' lifecycle so it auto-registers targets with the scene.
 */
class TrackingAnimation extends Animation<Mobject> {
    lastProgress = -1;
    readonly lifecycle: AnimationLifecycle = 'introductory';

    constructor(duration = 1) {
        super(new Mobject());
        this.durationSeconds = duration;
        this.easingFn = linear;
    }

    interpolate(progress: number): void {
        this.lastProgress = progress;
    }
}

describe('Scene', () => {
    describe('Constructor and Configuration', () => {
        it('should create scene with default config', () => {
            const scene = new Scene();
            expect(scene.getWidth()).toBe(1920);
            expect(scene.getHeight()).toBe(1080);
            expect(scene.getFrameRate()).toBe(60);
        });

        it('should create scene with custom dimensions', () => {
            const scene = new Scene({ width: 1280, height: 720 });
            expect(scene.getWidth()).toBe(1280);
            expect(scene.getHeight()).toBe(720);
        });

        it('should create scene with custom background color', () => {
            const scene = new Scene({ backgroundColor: Color.WHITE });
            expect(scene.getBackgroundColor()).toEqual(Color.WHITE);
        });

        it('should create scene with custom frame rate', () => {
            const scene = new Scene({ frameRate: 30 });
            expect(scene.getFrameRate()).toBe(30);
        });

        it('should default background color to BLACK', () => {
            const scene = new Scene();
            expect(scene.getBackgroundColor()).toEqual(Color.BLACK);
        });
    });

    describe('Mobject Management', () => {
        it('should add mobjects to scene', () => {
            const scene = new Scene();
            const m1 = new Mobject();
            const m2 = new Mobject();

            scene.add(m1, m2);

            expect(scene.getMobjects()).toContain(m1);
            expect(scene.getMobjects()).toContain(m2);
            expect(scene.getMobjects().length).toBe(2);
        });

        it('should remove mobjects from scene', () => {
            const scene = new Scene();
            const m1 = new Mobject();
            const m2 = new Mobject();

            scene.add(m1, m2);
            scene.remove(m1);

            expect(scene.getMobjects()).not.toContain(m1);
            expect(scene.getMobjects()).toContain(m2);
            expect(scene.getMobjects().length).toBe(1);
        });

        it('should return this from add() for chaining', () => {
            const scene = new Scene();
            const result = scene.add(new Mobject());
            expect(result).toBe(scene);
        });

        it('should return this from remove() for chaining', () => {
            const scene = new Scene();
            const m = new Mobject();
            scene.add(m);
            const result = scene.remove(m);
            expect(result).toBe(scene);
        });

        it('should not add duplicate mobjects', () => {
            const scene = new Scene();
            const m = new Mobject();

            scene.add(m);
            scene.add(m);

            expect(scene.getMobjects().length).toBe(1);
        });

        it('mobjects added to scene are immediately visible (opacity = 1)', () => {
            const scene = new Scene();
            const m = new Mobject();

            scene.add(m);

            expect(m.opacity).toBe(1);
        });
    });

    describe('Animation Scheduling - play()', () => {
        it('should schedule animations on timeline', () => {
            const scene = new Scene();
            const anim = new TrackingAnimation(1);

            scene.play(anim);

            expect(scene.getTimeline().getScheduled().length).toBe(1);
        });

        it('should advance playhead after play()', () => {
            const scene = new Scene();
            const anim = new TrackingAnimation(2);

            scene.play(anim);

            expect(scene.getCurrentTime()).toBe(2);
        });

        it('should schedule multiple animations in parallel', () => {
            const scene = new Scene();
            const a = new TrackingAnimation(1);
            const b = new TrackingAnimation(2);

            scene.play(a, b);

            const scheduled = scene.getTimeline().getScheduled();
            expect(scheduled[0]?.startTime).toBe(0);
            expect(scheduled[1]?.startTime).toBe(0);
        });

        it('should advance playhead by longest animation', () => {
            const scene = new Scene();
            const a = new TrackingAnimation(1);
            const b = new TrackingAnimation(3);

            scene.play(a, b);

            expect(scene.getCurrentTime()).toBe(3);
        });

        it('should return this from play() for chaining', () => {
            const scene = new Scene();
            const result = scene.play(new TrackingAnimation(1));
            expect(result).toBe(scene);
        });

        it('should handle empty play() call', () => {
            const scene = new Scene();
            scene.play();
            expect(scene.getCurrentTime()).toBe(0);
        });
    });

    describe('Animation Scheduling - wait()', () => {
        it('should add delay to playhead', () => {
            const scene = new Scene();

            scene.wait(2);

            expect(scene.getCurrentTime()).toBe(2);
        });

        it('should stack with play()', () => {
            const scene = new Scene();
            const anim = new TrackingAnimation(1);

            scene.play(anim);
            scene.wait(2);

            expect(scene.getCurrentTime()).toBe(3);
        });

        it('should return this from wait() for chaining', () => {
            const scene = new Scene();
            const result = scene.wait(1);
            expect(result).toBe(scene);
        });

        it('should throw for negative wait duration', () => {
            const scene = new Scene();
            expect(() => scene.wait(-1)).toThrow();
        });

        it('sequential play() calls schedule at correct times', () => {
            const scene = new Scene();
            const a = new TrackingAnimation(1);
            const b = new TrackingAnimation(1);

            scene.play(a);
            scene.wait(0.5);
            scene.play(b);

            const scheduled = scene.getTimeline().getScheduled();
            expect(scheduled[0]?.startTime).toBe(0);
            expect(scheduled[1]?.startTime).toBe(1.5);
        });
    });

    describe('ProAPI Access', () => {
        it('should return timeline via getTimeline()', () => {
            const scene = new Scene();
            const timeline = scene.getTimeline();
            expect(timeline).toBeDefined();
        });

        it('should return same timeline instance', () => {
            const scene = new Scene();
            const t1 = scene.getTimeline();
            const t2 = scene.getTimeline();
            expect(t1).toBe(t2);
        });
    });

    describe('Duration', () => {
        it('getTotalDuration() returns 0 for empty scene', () => {
            const scene = new Scene();
            expect(scene.getTotalDuration()).toBe(0);
        });

        it('getTotalDuration() returns correct value after play()', () => {
            const scene = new Scene();
            scene.play(new TrackingAnimation(3));
            expect(scene.getTotalDuration()).toBe(3);
        });
    });

    describe('Property-based Tests', () => {
        it('getCurrentTime advances correctly for arbitrary animations', () => {
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
                        const scene = new Scene();
                        let expectedTime = 0;

                        for (const d of durations) {
                            scene.play(new TrackingAnimation(d));
                            expectedTime += d;
                        }

                        return Math.abs(scene.getCurrentTime() - expectedTime) < 0.0001;
                    }
                )
            );
        });

        it('wait() correctly adds to playhead time', () => {
            fc.assert(
                fc.property(
                    fc.array(
                        fc.double({
                            min: 0,
                            max: 5,
                            noNaN: true,
                            noDefaultInfinity: true,
                        }),
                        { minLength: 1, maxLength: 5 }
                    ),
                    (waits) => {
                        const scene = new Scene();
                        let expectedTime = 0;

                        for (const w of waits) {
                            scene.wait(w);
                            expectedTime += w;
                        }

                        return Math.abs(scene.getCurrentTime() - expectedTime) < 0.0001;
                    }
                )
            );
        });
    });
});
