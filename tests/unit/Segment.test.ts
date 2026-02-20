import { describe, it, expect, beforeEach } from 'bun:test';
import { Scene } from '../../src/core/scene/Scene';
import { Circle } from '../../src/mobjects/geometry/Circle';
import { Rectangle } from '../../src/mobjects/geometry/Rectangle';
import { FadeIn } from '../../src/core/animations/fade/FadeIn';
import { MoveTo } from '../../src/core/animations/transform/MoveTo';
import { FadeOut } from '../../src/core/animations/fade/FadeOut';

describe('Scene Segment Emission', () => {
    let scene: Scene;

    beforeEach(() => {
        scene = new Scene({ width: 1920, height: 1080, frameRate: 60 });
    });

    it('play() emits a segment', () => {
        const circle = new Circle(1);
        scene.play(new FadeIn(circle));
        const segments = scene.getSegments();
        expect(segments.length).toBe(1);
        expect(segments[0]!.index).toBe(0);
        expect(segments[0]!.startTime).toBe(0);
        expect(segments[0]!.endTime).toBe(1);
        expect(segments[0]!.animations.length).toBe(1);
    });

    it('wait() emits a static segment', () => {
        const circle = new Circle(1);
        scene.play(new FadeIn(circle));
        scene.wait(0.5);
        const segments = scene.getSegments();
        expect(segments.length).toBe(2);
        expect(segments[1]!.startTime).toBe(1);
        expect(segments[1]!.endTime).toBe(1.5);
        expect(segments[1]!.animations.length).toBe(0);
    });

    it('multiple play() calls emit sequential segments', () => {
        const circle = new Circle(1);
        const rect = new Rectangle(2, 1);

        scene.play(new FadeIn(circle));
        scene.play(new FadeIn(rect));

        const segments = scene.getSegments();
        expect(segments.length).toBe(2);
        expect(segments[0]!.endTime).toBe(segments[1]!.startTime);
    });

    it('segment hashes include camera state', () => {
        const circle = new Circle(1);
        const sceneA = new Scene({ width: 1920, height: 1080 });
        const sceneB = new Scene({ width: 1280, height: 720 });

        sceneA.play(new FadeIn(circle));
        // Need a fresh circle for scene B since same mobject
        const circle2 = new Circle(1);
        sceneB.play(new FadeIn(circle2));

        // Different camera dimensions → different hash
        expect(sceneA.getSegments()[0]!.hash).not.toBe(sceneB.getSegments()[0]!.hash);
    });

    it('segment hashes include mobject state', () => {
        const circleA = new Circle(1);
        const circleB = new Circle(2); // Different radius

        const sceneA = new Scene({ width: 1920, height: 1080 });
        const sceneB = new Scene({ width: 1920, height: 1080 });

        sceneA.play(new FadeIn(circleA));
        sceneB.play(new FadeIn(circleB));

        expect(sceneA.getSegments()[0]!.hash).not.toBe(sceneB.getSegments()[0]!.hash);
    });

    it('identical scenes produce identical segment hashes', () => {
        const sceneA = new Scene({ width: 1920, height: 1080 });
        const sceneB = new Scene({ width: 1920, height: 1080 });

        const circleA = new Circle(1);
        const circleB = new Circle(1);

        sceneA.play(new FadeIn(circleA));
        sceneB.play(new FadeIn(circleB));

        expect(sceneA.getSegments()[0]!.hash).toBe(sceneB.getSegments()[0]!.hash);
    });

    it('changing animation duration changes segment hash', () => {
        const sceneA = new Scene({ width: 1920, height: 1080 });
        const sceneB = new Scene({ width: 1920, height: 1080 });

        const circleA = new Circle(1);
        const circleB = new Circle(1);

        sceneA.play(new FadeIn(circleA).duration(1));
        sceneB.play(new FadeIn(circleB).duration(2));

        expect(sceneA.getSegments()[0]!.hash).not.toBe(sceneB.getSegments()[0]!.hash);
    });

    it('segment indices are sequential', () => {
        const circle = new Circle(1);
        scene.play(new FadeIn(circle));
        scene.wait(0.5);
        scene.play(new MoveTo(circle, 5, 0));
        scene.play(new FadeOut(circle));

        const segments = scene.getSegments();
        for (let i = 0; i < segments.length; i++) {
            expect(segments[i]!.index).toBe(i);
        }
    });

    it('segment timing is continuous', () => {
        const circle = new Circle(1);
        scene.play(new FadeIn(circle));
        scene.wait(0.5);
        scene.play(new MoveTo(circle, 5, 0).duration(2));

        const segments = scene.getSegments();
        for (let i = 1; i < segments.length; i++) {
            expect(segments[i]!.startTime).toBe(segments[i - 1]!.endTime);
        }
    });
});
