import type { Scene } from '../scene';
import type { RenderConfig, ResolvedRenderConfig } from './types';
import { FrameRenderer } from './FrameRenderer';
import { ProgressReporter } from './ProgressReporter';
import { writePng, renderSpriteSequence, renderVideo } from './formats';
import { mkdir } from 'fs/promises';
import { dirname } from 'path';

/**
 * Main renderer for producing output from Scenes.
 * Supports multiple output formats and provides progress callbacks.
 */
export class Renderer {
    /**
     * Renders a scene to the specified output.
     *
     * @param scene The scene to render
     * @param outputPath Output file or directory path (depends on format)
     * @param config Optional render configuration
     */
    async render(
        scene: Scene,
        outputPath: string,
        config: RenderConfig = {}
    ): Promise<void> {
        const resolved = this.resolveConfig(scene, config);
        const totalDuration = scene.getTotalDuration();

        // Handle preview quality (half resolution)
        const width = resolved.quality === 'preview'
            ? Math.floor(resolved.width / 2)
            : resolved.width;
        const height = resolved.quality === 'preview'
            ? Math.floor(resolved.height / 2)
            : resolved.height;

        const frameRenderer = new FrameRenderer(scene, width, height);
        const totalFrames = Math.max(1, Math.floor(totalDuration * resolved.frameRate) + 1);
        const progressReporter = new ProgressReporter(totalFrames, resolved.onProgress);

        switch (resolved.format) {
            case 'sprite':
                await this.ensureDirectory(outputPath);
                await renderSpriteSequence(
                    frameRenderer,
                    outputPath,
                    resolved.frameRate,
                    totalDuration,
                    progressReporter
                );
                break;

            case 'png':
                await this.ensureDirectory(dirname(outputPath));
                await this.renderSingleFrame(frameRenderer, outputPath, totalDuration, progressReporter);
                break;

            case 'mp4':
            case 'webp':
            case 'gif':
                await this.ensureDirectory(dirname(outputPath));
                await renderVideo(
                    frameRenderer,
                    outputPath,
                    resolved.format,
                    resolved.frameRate,
                    totalDuration,
                    progressReporter
                );
                break;
        }
    }

    /**
     * Renders only the last frame of a scene as a PNG.
     *
     * @param scene The scene to render
     * @param outputPath Output PNG file path
     * @param config Optional render configuration
     */
    async renderLastFrame(
        scene: Scene,
        outputPath: string,
        config: RenderConfig = {}
    ): Promise<void> {
        const resolved = this.resolveConfig(scene, config);
        const totalDuration = scene.getTotalDuration();

        const width = resolved.quality === 'preview'
            ? Math.floor(resolved.width / 2)
            : resolved.width;
        const height = resolved.quality === 'preview'
            ? Math.floor(resolved.height / 2)
            : resolved.height;

        const frameRenderer = new FrameRenderer(scene, width, height);
        const progressReporter = new ProgressReporter(1, resolved.onProgress);

        await this.ensureDirectory(dirname(outputPath));

        const canvas = frameRenderer.renderFrame(totalDuration);
        await writePng(canvas, outputPath);

        progressReporter.complete();
    }

    /**
     * Resolves partial config with scene defaults.
     */
    private resolveConfig(scene: Scene, config: RenderConfig): ResolvedRenderConfig {
        return {
            width: config.width ?? scene.getWidth(),
            height: config.height ?? scene.getHeight(),
            frameRate: config.frameRate ?? scene.getFrameRate(),
            format: config.format ?? 'sprite',
            quality: config.quality ?? 'production',
            onProgress: config.onProgress,
        };
    }

    /**
     * Ensures the directory exists.
     */
    private async ensureDirectory(dirPath: string): Promise<void> {
        if (!dirPath) return;
        await mkdir(dirPath, { recursive: true });
    }

    /**
     * Renders a single frame (the last frame of the animation).
     */
    private async renderSingleFrame(
        frameRenderer: FrameRenderer,
        outputPath: string,
        totalDuration: number,
        progressReporter: ProgressReporter
    ): Promise<void> {
        const canvas = frameRenderer.renderFrame(totalDuration);
        await writePng(canvas, outputPath);
        progressReporter.complete();
    }
}
