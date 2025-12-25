/**
 * Unit tests for parallel animation functionality.
 */

import { describe, expect, it } from 'bun:test';
import { Scene } from '../src/scene/scene';
import { Circle } from '../src/entities/circle';
import { Rectangle } from '../src/entities/rectangle';

describe('Parallel Animations', () => {
    describe('Timeline parallel mode', () => {
        it('should start in sequential mode', () => {
            const s = new Scene();
            expect(s.timeline.scheduleMode).toBe('sequential');
            expect(s.timeline.isParallelMode).toBe(false);
        });

        it('should switch to parallel mode when beginParallel is called', () => {
            const s = new Scene();
            s.timeline.beginParallel();
            expect(s.timeline.scheduleMode).toBe('parallel');
            expect(s.timeline.isParallelMode).toBe(true);
        });

        it('should return to sequential mode when endParallel is called', () => {
            const s = new Scene();
            s.timeline.beginParallel();
            s.timeline.endParallel();
            expect(s.timeline.scheduleMode).toBe('sequential');
            expect(s.timeline.isParallelMode).toBe(false);
        });

        it('should throw when endParallel called without beginParallel', () => {
            const s = new Scene();
            expect(() => s.timeline.endParallel()).toThrow();
        });

        it('should support nested parallel groups', () => {
            const s = new Scene();
            s.timeline.beginParallel();
            expect(s.timeline.scheduleMode).toBe('parallel');
            s.timeline.beginParallel();
            expect(s.timeline.scheduleMode).toBe('parallel');
            s.timeline.endParallel();
            expect(s.timeline.scheduleMode).toBe('parallel');
            s.timeline.endParallel();
            expect(s.timeline.scheduleMode).toBe('sequential');
        });
    });

    describe('Parallel action timing', () => {
        it('should schedule parallel actions at the same start time', () => {
            const s = new Scene();
            const c = s.add(new Circle());
            const r = s.add(new Rectangle());

            // Sequential first: move circle
            c.moveTo(100, 100, { duration: 0.5 });
            // Now at t=0.5

            // Parallel: both should start at t=0.5
            s.parallel(
                () => c.moveTo(200, 200, { duration: 1 }),
                () => r.moveTo(50, 50, { duration: 0.5 })
            );

            // After parallel block, timeline should be at t=0.5 + max(1, 0.5) = 1.5
            expect(s.duration).toBe(1.5);
        });

        it('should calculate parallel duration as max of children', () => {
            const s = new Scene();
            const c = s.add(new Circle());

            s.parallel(
                () => c.moveTo(100, 100, { duration: 0.3 }),
                () => c.scaleTo(2, 2, { duration: 0.7 }),
                () => c.fadeOut({ duration: 0.5 })
            );

            // Max duration is 0.7
            expect(s.duration).toBe(0.7);
        });

        it('should handle empty parallel block', () => {
            const s = new Scene();
            const c = s.add(new Circle());

            c.moveTo(100, 100, { duration: 0.5 });
            s.parallel(); // Empty parallel
            c.moveTo(200, 200, { duration: 0.5 });

            // Duration should be 0.5 + 0 + 0.5 = 1.0
            expect(s.duration).toBe(1.0);
        });

        it('should handle single action in parallel block', () => {
            const s = new Scene();
            const c = s.add(new Circle());

            s.parallel(
                () => c.moveTo(100, 100, { duration: 0.5 })
            );

            expect(s.duration).toBe(0.5);
        });
    });

    describe('Entity.parallel()', () => {
        it('should animate multiple properties simultaneously', () => {
            const s = new Scene();
            const c = s.add(new Circle());

            c.parallel(
                e => e.moveTo(100, 100, { duration: 1 }),
                e => e.scaleTo(2, 2, { duration: 1 }),
                e => e.rotateTo(Math.PI, { duration: 1 })
            );

            // All start at t=0, all duration 1, so total is 1
            expect(s.duration).toBe(1);
        });

        it('should continue chaining after parallel block', () => {
            const s = new Scene();
            const c = s.add(new Circle());

            const result = c
                .moveTo(50, 50, { duration: 0.5 })
                .parallel(
                    e => e.scaleTo(2, 2, { duration: 0.5 }),
                    e => e.fadeOut({ duration: 0.5 })
                )
                .moveTo(100, 100, { duration: 0.5 });

            expect(result).toBe(c);
            // 0.5 + 0.5 + 0.5 = 1.5
            expect(s.duration).toBe(1.5);
        });

        it('should throw if entity not bound to timeline', () => {
            const c = new Circle();
            expect(() => c.parallel(e => e.moveTo(100, 100))).toThrow();
        });
    });

    describe('Scene.parallel()', () => {
        it('should animate multiple entities simultaneously', () => {
            const s = new Scene();
            const c1 = s.add(new Circle());
            const c2 = s.add(new Circle());

            s.parallel(
                () => c1.moveTo(100, 100, { duration: 1 }),
                () => c2.moveTo(200, 200, { duration: 0.5 })
            );

            // Max duration is 1
            expect(s.duration).toBe(1);
        });

        it('should return scene for chaining', () => {
            const s = new Scene();
            const c = s.add(new Circle());

            const result = s.parallel(
                () => c.moveTo(100, 100, { duration: 0.5 })
            );

            expect(result).toBe(s);
        });
    });

    describe('Parallel animation interpolation', () => {
        it('should interpolate parallel actions at the same time', () => {
            const s = new Scene();
            const c = s.add(new Circle());

            // Parallel: move and scale simultaneously (linear easing for predictable values)
            c.parallel(
                e => e.moveTo(100, 0, { duration: 1, ease: 'linear' }),
                e => e.scaleTo(2, 2, { duration: 1, ease: 'linear' })
            );

            // At t=0, position should be (0,0), scale should be (1,1)
            s.timeline.seek(0);
            expect(c.position.x).toBeCloseTo(0);
            expect(c.scale.x).toBeCloseTo(1);

            // At t=0.5 (50%), position should be (50,0), scale should be (1.5,1.5)
            s.timeline.seek(0.5);
            expect(c.position.x).toBeCloseTo(50);
            expect(c.scale.x).toBeCloseTo(1.5);

            // At t=1 (100%), position should be (100,0), scale should be (2,2)
            s.timeline.seek(1);
            expect(c.position.x).toBeCloseTo(100);
            expect(c.scale.x).toBeCloseTo(2);
        });

        it('should handle sequential after parallel correctly', () => {
            const s = new Scene();
            const c = s.add(new Circle());

            // Sequential move (linear easing for predictable values)
            c.moveTo(50, 0, { duration: 0.5, ease: 'linear' });

            // Parallel scale + fade
            c.parallel(
                e => e.scaleTo(2, 2, { duration: 0.5, ease: 'linear' }),
                e => e.fadeOut({ duration: 0.5, ease: 'linear' })
            );

            // Sequential move again
            c.moveTo(100, 0, { duration: 0.5, ease: 'linear' });

            // Total duration: 0.5 + 0.5 + 0.5 = 1.5
            expect(s.duration).toBe(1.5);

            // At t=0.25 (middle of first move), position should be 25
            s.timeline.seek(0.25);
            expect(c.position.x).toBeCloseTo(25);

            // At t=0.75 (middle of parallel block), scale should be 1.5, opacity 0.5
            s.timeline.seek(0.75);
            expect(c.scale.x).toBeCloseTo(1.5);
            expect(c.opacity).toBeCloseTo(0.5);

            // At t=1.25 (middle of last move), position should be 50
            // Note: startValue is captured at schedule time (when entity is at 0,0)
            // The last moveTo goes from 0 to 100, so at 50% progress = 50
            s.timeline.seek(1.25);
            expect(c.position.x).toBeCloseTo(50);
        });
    });
});

