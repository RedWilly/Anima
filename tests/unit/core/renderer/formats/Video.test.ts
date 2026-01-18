import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { Renderer } from '../../../../../src/core/renderer/Renderer';
import { Scene } from '../../../../../src/core/scene';
import { Circle } from '../../../../../src/mobjects/geometry';
import { FadeIn } from '../../../../../src/core/animations';
import { rm, readdir, exists } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

describe('Video Export', () => {
    let testDir: string;

    beforeEach(async () => {
        testDir = join(tmpdir(), `anima-video-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    });

    afterEach(async () => {
        try {
            await rm(testDir, { recursive: true });
        } catch {
            // Ignore
        }
    });

    test('exports MP4 video', async () => {
        const scene = new Scene({ width: 100, height: 100, frameRate: 10 });
        const circle = new Circle(1);
        scene.add(circle);
        scene.play(new FadeIn(circle).duration(0.2));

        const outputPath = join(testDir, 'output.mp4');
        const renderer = new Renderer();
        await renderer.render(scene, outputPath, { format: 'mp4' });

        expect(await exists(outputPath)).toBe(true);
    }, 10000); // 10s timeout for FFmpeg

    test('exports WebP animation', async () => {
        const scene = new Scene({ width: 100, height: 100, frameRate: 10 });
        const circle = new Circle(1);
        scene.add(circle);
        scene.play(new FadeIn(circle).duration(0.2));

        const outputPath = join(testDir, 'output.webp');
        const renderer = new Renderer();
        await renderer.render(scene, outputPath, { format: 'webp' });

        expect(await exists(outputPath)).toBe(true);
    }, 10000);

    test('exports GIF animation', async () => {
        const scene = new Scene({ width: 100, height: 100, frameRate: 10 });
        const circle = new Circle(1);
        scene.add(circle);
        scene.play(new FadeIn(circle).duration(0.2));

        const outputPath = join(testDir, 'output.gif');
        const renderer = new Renderer();
        await renderer.render(scene, outputPath, { format: 'gif' });

        expect(await exists(outputPath)).toBe(true);
    }, 10000);
});
