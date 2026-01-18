import { describe, expect, test } from 'bun:test';
import fc from 'fast-check';
import { Circle } from '../../../src/mobjects/geometry/Circle';
import { Rectangle } from '../../../src/mobjects/geometry/Rectangle';
import {
    FadeIn,
    FadeOut,
    MoveTo,
    Rotate,
    Scale,
    Scene,
    Timeline,
    linear,
} from '../../../src/core/animations';

/**
 * PRD Items #61-63: Hybrid API Consistency Tests
 *
 * These tests verify that FluentAPI and ProAPI produce consistent,
 * interchangeable results, and can be mixed within the same Scene.
 */
describe('Hybrid API Consistency', () => {
    describe('PRD #61: FluentAPI and ProAPI produce consistent results', () => {
        test('FadeIn: FluentAPI and ProAPI produce same final state', () => {
            const fluentCircle = new Circle();
            const proCircle = new Circle();

            // FluentAPI approach
            fluentCircle.fadeIn(1);
            const fluentAnim = fluentCircle.toAnimation();

            // ProAPI approach
            const proAnim = new FadeIn(proCircle).duration(1);

            // Run both animations to completion
            fluentAnim.update(1);
            proAnim.update(1);

            expect(fluentCircle.opacity).toBe(1);
            expect(proCircle.opacity).toBe(1);
            expect(fluentCircle.opacity).toBe(proCircle.opacity);
        });

        test('FadeOut: FluentAPI and ProAPI produce same final state', () => {
            const fluentCircle = new Circle().show();
            const proCircle = new Circle().show();

            // FluentAPI approach
            fluentCircle.fadeOut(1);
            const fluentAnim = fluentCircle.toAnimation();

            // ProAPI approach
            const proAnim = new FadeOut(proCircle).duration(1);

            // Run both animations to completion
            fluentAnim.update(1);
            proAnim.update(1);

            expect(fluentCircle.opacity).toBe(0);
            expect(proCircle.opacity).toBe(0);
        });

        test('MoveTo: FluentAPI and ProAPI produce same final position', () => {
            const fluentCircle = new Circle();
            const proCircle = new Circle();

            // FluentAPI approach
            fluentCircle.moveTo(100, 50, 1);
            const fluentAnim = fluentCircle.toAnimation();

            // ProAPI approach
            const proAnim = new MoveTo(proCircle, 100, 50).duration(1);

            // Run both animations to completion
            fluentAnim.update(1);
            proAnim.update(1);

            expect(fluentCircle.position.x).toBeCloseTo(100);
            expect(fluentCircle.position.y).toBeCloseTo(50);
            expect(proCircle.position.x).toBeCloseTo(100);
            expect(proCircle.position.y).toBeCloseTo(50);
        });

        test('Rotate: FluentAPI and ProAPI produce same final rotation', () => {
            const fluentCircle = new Circle();
            const proCircle = new Circle();

            const angle = Math.PI / 2;

            // FluentAPI approach
            fluentCircle.rotate(angle, 1);
            const fluentAnim = fluentCircle.toAnimation();

            // ProAPI approach
            const proAnim = new Rotate(proCircle, angle).duration(1);

            // Run both animations to completion
            fluentAnim.update(1);
            proAnim.update(1);

            expect(fluentCircle.rotation).toBeCloseTo(angle);
            expect(proCircle.rotation).toBeCloseTo(angle);
        });

        test('Scale: FluentAPI and ProAPI produce same final scale', () => {
            const fluentCircle = new Circle();
            const proCircle = new Circle();

            // FluentAPI approach
            fluentCircle.scaleTo(2, 1);
            const fluentAnim = fluentCircle.toAnimation();

            // ProAPI approach
            const proAnim = new Scale(proCircle, 2).duration(1);

            // Run both animations to completion
            fluentAnim.update(1);
            proAnim.update(1);

            expect(fluentCircle.scale.x).toBeCloseTo(2);
            expect(fluentCircle.scale.y).toBeCloseTo(2);
            expect(proCircle.scale.x).toBeCloseTo(2);
            expect(proCircle.scale.y).toBeCloseTo(2);
        });

        test('intermediate states match at same progress', () => {
            const fluentCircle = new Circle().pos(0, 0);
            const proCircle = new Circle().pos(0, 0);

            // FluentAPI approach
            fluentCircle.moveTo(100, 0, 1);
            const fluentAnim = fluentCircle.toAnimation();
            // Set linear easing for predictable comparisons
            fluentAnim.ease(linear);

            // ProAPI approach
            const proAnim = new MoveTo(proCircle, 100, 0).duration(1).ease(linear);

            // Check intermediate states
            fluentAnim.update(0.5);
            proAnim.update(0.5);

            expect(fluentCircle.position.x).toBeCloseTo(50);
            expect(proCircle.position.x).toBeCloseTo(50);
        });

        test('easing is equivalent between APIs', () => {
            const fluentCircle = new Circle();
            const proCircle = new Circle();

            // FluentAPI with easing
            fluentCircle.fadeIn(1).ease(linear);
            const fluentAnim = fluentCircle.toAnimation();

            // ProAPI with easing
            const proAnim = new FadeIn(proCircle).duration(1).ease(linear);

            // Both should use linear easing
            expect(fluentAnim.getEasing()).toBe(linear);
            expect(proAnim.getEasing()).toBe(linear);
        });
    });

    describe('PRD #62: FluentAPI chain can be embedded in ProAPI Timeline', () => {
        test('toAnimation() returns Animation compatible with Timeline', () => {
            const circle = new Circle();
            circle.fadeIn(1).moveTo(100, 50, 2);

            const anim = circle.toAnimation();
            const timeline = new Timeline();

            // Should not throw
            timeline.schedule(anim, 0);

            expect(timeline.getScheduled().length).toBe(1);
        });

        test('FluentAPI animation scheduled at specific time', () => {
            const circle = new Circle();
            circle.fadeIn(1);

            const anim = circle.toAnimation();
            const timeline = new Timeline();

            // Schedule at time 5
            timeline.schedule(anim, 5);

            // Before animation starts
            timeline.seek(4);
            expect(circle.opacity).toBe(0);

            // At midpoint of animation
            timeline.seek(5.5);
            expect(circle.opacity).toBeCloseTo(0.5, 1);

            // After animation ends
            timeline.seek(6);
            expect(circle.opacity).toBe(1);
        });

        test('multiple FluentAPI chains on Timeline', () => {
            const circle = new Circle();
            const rect = new Rectangle();

            circle.fadeIn(1);
            rect.fadeIn(2);

            const circleAnim = circle.toAnimation();
            const rectAnim = rect.toAnimation();

            const timeline = new Timeline();
            timeline.schedule(circleAnim, 0);
            timeline.schedule(rectAnim, 1);

            expect(timeline.getScheduled().length).toBe(2);
            expect(timeline.getTotalDuration()).toBe(3); // rect starts at 1, duration 2
        });

        test('FluentAPI with delay on Timeline', () => {
            const circle = new Circle();
            circle.fadeIn(1);

            const anim = circle.toAnimation();
            anim.delay(0.5);

            const timeline = new Timeline();
            timeline.schedule(anim, 0);

            // Delay means effective start at 0.5
            timeline.seek(0.25);
            expect(circle.opacity).toBe(0);

            timeline.seek(1);
            expect(circle.opacity).toBeCloseTo(0.5, 1);

            timeline.seek(1.5);
            expect(circle.opacity).toBe(1);
        });
    });

    describe('PRD #63: Mixing APIs in same Scene works', () => {
        test('Scene accepts both FluentAPI and ProAPI animations', () => {
            const scene = new Scene();
            const circle = new Circle();
            const rect = new Rectangle();

            scene.add(circle, rect);

            // FluentAPI
            circle.fadeIn(1);
            const fluentAnim = circle.toAnimation();

            // ProAPI
            const proAnim = new FadeIn(rect).duration(1);

            // Both should work with play()
            scene.play(fluentAnim, proAnim);

            expect(scene.getTotalDuration()).toBe(1);
        });

        test('mixed API animations in sequence via Timeline', () => {
            const scene = new Scene();
            const circle = new Circle();
            const rect = new Rectangle();

            // Only add rect (needed for MoveTo which is transformative)
            // circle will be auto-registered by FadeIn
            scene.add(rect);

            // First: FluentAPI animation
            circle.fadeIn(1);
            const fluentAnim = circle.toAnimation();

            // Second: ProAPI animation
            const proAnim = new MoveTo(rect, 100, 0).duration(2);

            // Schedule in sequence
            const timeline = scene.getTimeline();
            timeline.scheduleSequence([fluentAnim, proAnim], 0);

            expect(timeline.getTotalDuration()).toBe(3);

            // Verify FluentAPI runs first
            timeline.seek(0.5);
            expect(circle.opacity).toBeCloseTo(0.5, 1);

            // Verify ProAPI runs second
            timeline.seek(2);
            expect(rect.position.x).toBeCloseTo(50, 1);
        });

        test('parallel mixed API animations', () => {
            const scene = new Scene();
            const circle = new Circle();
            const rect = new Rectangle();

            // Both use FadeIn which is introductory - no need for add()
            // FadeIn will auto-register them with the scene

            // FluentAPI - use linear easing for predictable values
            circle.fadeIn(2).ease(linear);
            const fluentAnim = circle.toAnimation();

            // ProAPI - use linear easing for predictable values
            const proAnim = new FadeIn(rect).duration(1).ease(linear);

            // Run in parallel
            scene.play(fluentAnim, proAnim);

            // Both should start at time 0
            const timeline = scene.getTimeline();

            timeline.seek(0.5);
            expect(circle.opacity).toBeCloseTo(0.25, 1);
            expect(rect.opacity).toBeCloseTo(0.5, 1);

            timeline.seek(1);
            expect(rect.opacity).toBe(1);
            expect(circle.opacity).toBeCloseTo(0.5, 1);

            timeline.seek(2);
            expect(circle.opacity).toBe(1);
        });

        test('all operations work in both API styles', () => {
            const scene = new Scene();

            // Fade via both APIs
            const fadeFluentObj = new Circle();
            fadeFluentObj.fadeIn(1);
            const fadeFluent = fadeFluentObj.toAnimation();
            const fadeProObj = new Circle();
            const fadePro = new FadeIn(fadeProObj).duration(1);

            // Move via both APIs
            const moveFluentObj = new Circle();
            moveFluentObj.moveTo(100, 50, 1);
            const moveFluent = moveFluentObj.toAnimation();
            const moveProObj = new Circle();
            const movePro = new MoveTo(moveProObj, 100, 50).duration(1);

            // Rotate via both APIs
            const rotateFluentObj = new Circle();
            rotateFluentObj.rotate(Math.PI, 1);
            const rotateFluent = rotateFluentObj.toAnimation();
            const rotateProObj = new Circle();
            const rotatePro = new Rotate(rotateProObj, Math.PI).duration(1);

            // Scale via both APIs
            const scaleFluentObj = new Circle();
            scaleFluentObj.scaleTo(2, 1);
            const scaleFluent = scaleFluentObj.toAnimation();
            const scaleProObj = new Circle();
            const scalePro = new Scale(scaleProObj, 2).duration(1);

            scene.add(
                fadeFluentObj, fadeProObj,
                moveFluentObj, moveProObj,
                rotateFluentObj, rotateProObj,
                scaleFluentObj, scaleProObj
            );

            // Play all animations
            scene.play(
                fadeFluent, fadePro,
                moveFluent, movePro,
                rotateFluent, rotatePro,
                scaleFluent, scalePro
            );

            // Seek to end
            scene.getTimeline().seek(1);

            // Verify all reached correct final state
            expect(fadeFluentObj.opacity).toBe(1);
            expect(fadeProObj.opacity).toBe(1);
            expect(moveFluentObj.position.x).toBeCloseTo(100);
            expect(moveProObj.position.x).toBeCloseTo(100);
            expect(rotateFluentObj.rotation).toBeCloseTo(Math.PI);
            expect(rotateProObj.rotation).toBeCloseTo(Math.PI);
            expect(scaleFluentObj.scale.x).toBeCloseTo(2);
            expect(scaleProObj.scale.x).toBeCloseTo(2);
        });
    });

    describe('property-based tests for API equivalence', () => {
        test('arbitrary position: FluentAPI == ProAPI', () => {
            fc.assert(
                fc.property(fc.float(), fc.float(), (x, y) => {
                    if (!isFinite(x) || !isFinite(y)) return true;

                    const fluentCircle = new Circle();
                    const proCircle = new Circle();

                    fluentCircle.moveTo(x, y, 1);
                    const fluentAnim = fluentCircle.toAnimation();
                    fluentAnim.ease(linear);

                    const proAnim = new MoveTo(proCircle, x, y).duration(1).ease(linear);

                    fluentAnim.update(1);
                    proAnim.update(1);

                    return (
                        Math.abs(fluentCircle.position.x - proCircle.position.x) < 0.001 &&
                        Math.abs(fluentCircle.position.y - proCircle.position.y) < 0.001
                    );
                }),
                { numRuns: 50 }
            );
        });

        test('arbitrary rotation: FluentAPI == ProAPI', () => {
            fc.assert(
                fc.property(fc.float({ min: Math.fround(-10), max: Math.fround(10) }), (angle) => {
                    if (!isFinite(angle)) return true;

                    const fluentCircle = new Circle();
                    const proCircle = new Circle();

                    fluentCircle.rotate(angle, 1);
                    const fluentAnim = fluentCircle.toAnimation();
                    fluentAnim.ease(linear);

                    const proAnim = new Rotate(proCircle, angle).duration(1).ease(linear);

                    fluentAnim.update(1);
                    proAnim.update(1);

                    return Math.abs(fluentCircle.rotation - proCircle.rotation) < 0.001;
                }),
                { numRuns: 50 }
            );
        });

        test('arbitrary scale: FluentAPI == ProAPI', () => {
            fc.assert(
                fc.property(fc.float({ min: Math.fround(0.1), max: Math.fround(10) }), (factor) => {
                    if (!isFinite(factor) || factor <= 0) return true;

                    const fluentCircle = new Circle();
                    const proCircle = new Circle();

                    fluentCircle.scaleTo(factor, 1);
                    const fluentAnim = fluentCircle.toAnimation();
                    fluentAnim.ease(linear);

                    const proAnim = new Scale(proCircle, factor).duration(1).ease(linear);

                    fluentAnim.update(1);
                    proAnim.update(1);

                    return (
                        Math.abs(fluentCircle.scale.x - proCircle.scale.x) < 0.001 &&
                        Math.abs(fluentCircle.scale.y - proCircle.scale.y) < 0.001
                    );
                }),
                { numRuns: 50 }
            );
        });

        test('arbitrary duration: FluentAPI == ProAPI', () => {
            fc.assert(
                fc.property(fc.float({ min: Math.fround(0.1), max: Math.fround(10) }), (duration) => {
                    if (!isFinite(duration) || duration <= 0) return true;

                    const fluentCircle = new Circle();
                    const proCircle = new Circle();

                    fluentCircle.fadeIn(duration);
                    const fluentAnim = fluentCircle.toAnimation();

                    const proAnim = new FadeIn(proCircle).duration(duration);

                    return (
                        Math.abs(fluentAnim.getDuration() - proAnim.getDuration()) < 0.001
                    );
                }),
                { numRuns: 50 }
            );
        });
    });
});
