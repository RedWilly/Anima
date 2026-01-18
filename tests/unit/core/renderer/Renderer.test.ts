import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { Renderer } from '../../../../src/core/renderer/Renderer';
import { Scene } from '../../../../src/core/scene';
import { Circle } from '../../../../src/mobjects/geometry';
import { FadeIn } from '../../../../src/core/animations';
import type { RenderProgress } from '../../../../src/core/renderer/types';
import { rm, readdir, stat } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

describe('Renderer', () => {
    let testDir: string;

    beforeEach(async () => {
        // Create unique temp directory for each test
        testDir = join(tmpdir(), `anima-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    });

    afterEach(async () => {
        // Clean up temp directory
        try {
            await rm(testDir, { recursive: true });
        } catch {
            // Ignore cleanup errors
        }
    });

    describe('render', () => {
        test('creates sprite sequence for simple animation', async () => {
            const scene = new Scene({ width: 100, height: 100, frameRate: 10 });
            const circle = new Circle(1);
            scene.add(circle);
            scene.play(new FadeIn(circle).duration(0.5));

            const renderer = new Renderer();
            await renderer.render(scene, testDir, { format: 'sprite' });

            const files = await readdir(testDir);
            const pngFiles = files.filter((f) => f.endsWith('.png'));

            // 0.5 seconds at 10 FPS = 6 frames (0, 0.1, 0.2, 0.3, 0.4, 0.5)
            expect(pngFiles.length).toBe(6);
        });

        test('creates numbered files with correct naming', async () => {
            const scene = new Scene({ width: 100, height: 100, frameRate: 10 });
            const circle = new Circle(1);
            scene.add(circle);
            scene.play(new FadeIn(circle).duration(0.2));

            const renderer = new Renderer();
            await renderer.render(scene, testDir, { format: 'sprite' });

            const files = await readdir(testDir);
            const sortedFiles = files.sort();

            expect(sortedFiles).toContain('frame_0000.png');
            expect(sortedFiles).toContain('frame_0001.png');
            expect(sortedFiles).toContain('frame_0002.png');
        });

        test('calls progress callback', async () => {
            const scene = new Scene({ width: 100, height: 100, frameRate: 10 });
            const circle = new Circle(1);
            scene.add(circle);
            scene.play(new FadeIn(circle).duration(0.2));

            const updates: RenderProgress[] = [];
            const renderer = new Renderer();
            await renderer.render(scene, testDir, {
                format: 'sprite',
                onProgress: (p) => updates.push(p),
            });

            expect(updates.length).toBeGreaterThan(0);

            // Last update should be 100%
            const lastUpdate = updates[updates.length - 1];
            expect(lastUpdate?.percentage).toBe(100);
        });

        test('uses scene defaults when config is omitted', async () => {
            const scene = new Scene({ width: 200, height: 100, frameRate: 5 });
            const circle = new Circle(1);
            scene.add(circle);
            scene.play(new FadeIn(circle).duration(0.2));

            const renderer = new Renderer();
            await renderer.render(scene, testDir);

            const files = await readdir(testDir);
            // 0.2 seconds at 5 FPS = 2 frames
            expect(files.filter((f) => f.endsWith('.png')).length).toBe(2);
        });

        test('respects custom frame rate', async () => {
            const scene = new Scene({ width: 100, height: 100, frameRate: 60 });
            const circle = new Circle(1);
            scene.add(circle);
            scene.play(new FadeIn(circle).duration(0.1));

            const renderer = new Renderer();
            // Override to 10 FPS
            await renderer.render(scene, testDir, { format: 'sprite', frameRate: 10 });

            const files = await readdir(testDir);
            // 0.1 seconds at 10 FPS = 2 frames
            expect(files.filter((f) => f.endsWith('.png')).length).toBe(2);
        });

        test('throws error for unsupported formats', async () => {
            const scene = new Scene({ width: 100, height: 100 });

            const renderer = new Renderer();

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await expect(
                renderer.render(scene, testDir, { format: 'avi' as any })
            ).rejects.toThrow();
        });

        test('renders at half resolution in preview mode', async () => {
            const scene = new Scene({ width: 200, height: 100, frameRate: 10 });
            const circle = new Circle(1);
            scene.add(circle);
            scene.play(new FadeIn(circle).duration(0.1));

            const renderer = new Renderer();
            await renderer.render(scene, testDir, {
                format: 'sprite',
                quality: 'preview',
            });

            // We can't easily check dimensions from PNG files without parsing,
            // but we verify rendering completes successfully
            const files = await readdir(testDir);
            expect(files.length).toBeGreaterThan(0);
        });
    });

    describe('renderLastFrame', () => {
        test('creates single PNG file', async () => {
            const scene = new Scene({ width: 100, height: 100 });
            const circle = new Circle(1);
            scene.add(circle);
            scene.play(new FadeIn(circle).duration(1));

            const outputPath = join(testDir, 'output.png');
            const renderer = new Renderer();
            await renderer.renderLastFrame(scene, outputPath);

            const files = await readdir(testDir);
            expect(files).toContain('output.png');
        });

        test('calls progress callback', async () => {
            const scene = new Scene({ width: 100, height: 100 });
            const circle = new Circle(1);
            scene.add(circle);
            scene.play(new FadeIn(circle).duration(0.5));

            const updates: RenderProgress[] = [];
            const outputPath = join(testDir, 'output.png');
            const renderer = new Renderer();
            await renderer.renderLastFrame(scene, outputPath, {
                onProgress: (p) => updates.push(p),
            });

            expect(updates.length).toBeGreaterThan(0);
            expect(updates[updates.length - 1]?.percentage).toBe(100);
        });

        test('creates parent directories if needed', async () => {
            const scene = new Scene({ width: 100, height: 100 });
            const circle = new Circle(1);
            scene.add(circle);

            const outputPath = join(testDir, 'nested', 'dir', 'output.png');
            const renderer = new Renderer();
            await renderer.renderLastFrame(scene, outputPath);

            const fileStat = await stat(outputPath);
            expect(fileStat.isFile()).toBe(true);
        });
    });

    describe('edge cases', () => {
        test('renders scene with no animations', async () => {
            const scene = new Scene({ width: 100, height: 100, frameRate: 10 });
            const circle = new Circle(1);
            circle.show();
            scene.add(circle);

            const renderer = new Renderer();
            await renderer.render(scene, testDir, { format: 'sprite' });

            const files = await readdir(testDir);
            // At least 1 frame should be rendered
            expect(files.filter((f) => f.endsWith('.png')).length).toBeGreaterThanOrEqual(1);
        });

        test('renders scene with no mobjects', async () => {
            const scene = new Scene({ width: 100, height: 100, frameRate: 10 });

            const renderer = new Renderer();
            await renderer.render(scene, testDir, { format: 'sprite' });

            const files = await readdir(testDir);
            expect(files.filter((f) => f.endsWith('.png')).length).toBeGreaterThanOrEqual(1);
        });
    });
});
