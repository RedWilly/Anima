import { describe, test, expect } from 'bun:test';
import { FrameRenderer } from '../../../../src/core/renderer/FrameRenderer';
import { Scene } from '../../../../src/core/scene';
import { Circle } from '../../../../src/mobjects/geometry';
import { FadeIn } from '../../../../src/core/animations';

describe('FrameRenderer', () => {
    describe('constructor', () => {
        test('creates renderer with scene and dimensions', () => {
            const scene = new Scene({ width: 800, height: 600 });
            const renderer = new FrameRenderer(scene, 800, 600);

            expect(renderer).toBeDefined();
        });

        test('stores correct dimensions', () => {
            const scene = new Scene({ width: 1920, height: 1080 });
            const renderer = new FrameRenderer(scene, 1920, 1080);

            const dims = renderer.getDimensions();
            expect(dims.width).toBe(1920);
            expect(dims.height).toBe(1080);
        });
    });

    describe('renderFrame', () => {
        test('returns a canvas', () => {
            const scene = new Scene({ width: 100, height: 100 });
            const renderer = new FrameRenderer(scene, 100, 100);

            const canvas = renderer.renderFrame(0);

            expect(canvas).toBeDefined();
            expect(canvas.width).toBe(100);
            expect(canvas.height).toBe(100);
        });

        test('renders at specified time', () => {
            const scene = new Scene({ width: 100, height: 100 });
            const circle = new Circle(1);
            scene.add(circle);
            scene.play(new FadeIn(circle));

            const renderer = new FrameRenderer(scene, 100, 100);

            // At time 0, circle should be fully transparent
            const canvas0 = renderer.renderFrame(0);
            expect(canvas0).toBeDefined();

            // At time 1, circle should be fully visible
            const canvas1 = renderer.renderFrame(1);
            expect(canvas1).toBeDefined();
        });

        test('renders empty scene', () => {
            const scene = new Scene({ width: 100, height: 100 });
            const renderer = new FrameRenderer(scene, 100, 100);

            const canvas = renderer.renderFrame(0);

            expect(canvas).toBeDefined();
        });

        test('renders scene with multiple mobjects', () => {
            const scene = new Scene({ width: 200, height: 200 });
            const c1 = new Circle(0.5);
            const c2 = new Circle(0.5);
            c1.pos(-1, 0).show();
            c2.pos(1, 0).show();

            scene.add(c1, c2);

            const renderer = new FrameRenderer(scene, 200, 200);
            const canvas = renderer.renderFrame(0);

            expect(canvas).toBeDefined();
        });
    });

    describe('getDimensions', () => {
        test('returns configured dimensions', () => {
            const scene = new Scene({ width: 1280, height: 720 });
            const renderer = new FrameRenderer(scene, 640, 360);

            const dims = renderer.getDimensions();

            expect(dims.width).toBe(640);
            expect(dims.height).toBe(360);
        });
    });

    describe('coordinate transformation', () => {
        test('handles various aspect ratios', () => {
            // 16:9
            const scene1 = new Scene({ width: 1920, height: 1080 });
            const renderer1 = new FrameRenderer(scene1, 1920, 1080);
            expect(renderer1.renderFrame(0)).toBeDefined();

            // 1:1
            const scene2 = new Scene({ width: 1080, height: 1080 });
            const renderer2 = new FrameRenderer(scene2, 1080, 1080);
            expect(renderer2.renderFrame(0)).toBeDefined();

            // 9:16 (portrait)
            const scene3 = new Scene({ width: 1080, height: 1920 });
            const renderer3 = new FrameRenderer(scene3, 1080, 1920);
            expect(renderer3.renderFrame(0)).toBeDefined();
        });
    });
});
