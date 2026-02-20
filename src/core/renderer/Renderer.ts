import type { Scene } from '../scene';
import type { RenderConfig, ResolvedRenderConfig } from './types';
import { FrameRenderer } from './FrameRenderer';
import { ProgressReporter } from './ProgressReporter';
import { writePng, renderSpriteSequence, renderVideo, concatSegments } from './formats';
import { SegmentCache } from '../cache/SegmentCache';
import type { Segment } from '../cache/Segment';
import { mkdir } from 'fs/promises';
import { dirname, join } from 'path';

/**
 * Main renderer for producing output from Scenes.
 * Supports multiple output formats, progress callbacks, and
 * segment-level caching for incremental re-renders.
 */
export class Renderer {
    /**
     * Renders a scene to the specified output.
     *
     * For video formats (mp4/webp/gif) with caching enabled, renders
     * each segment independently and concatenates the results.
     * Segments whose hash matches a cached file are skipped entirely.
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

        const segments = scene.getSegments();
        const isVideoFormat = resolved.format === 'mp4'
            || resolved.format === 'webp'
            || resolved.format === 'gif';
        const useCache = resolved.cache && isVideoFormat && segments.length > 0;

        if (useCache) {
            await this.renderSegmented(
                scene, frameRenderer, outputPath, resolved, segments, progressReporter,
            );
            return;
        }

        // Fallback: monolithic rendering (non-video formats or no segments)
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

            default:
                throw new Error(`Unsupported render format: ${resolved.format}`);
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
        const format = config.format ?? 'sprite';
        const isVideoFormat = format === 'mp4' || format === 'webp' || format === 'gif';

        return {
            width: config.width ?? scene.getWidth(),
            height: config.height ?? scene.getHeight(),
            frameRate: config.frameRate ?? scene.getFrameRate(),
            format,
            quality: config.quality ?? 'production',
            onProgress: config.onProgress,
            cache: config.cache ?? isVideoFormat,
            cacheDir: config.cacheDir,
        };
    }

    /**
     * Ensures the directory exists.
     */
    private async ensureDirectory(dirPath: string): Promise<void> {
        if (!dirPath || dirPath === '.') return;
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

    /**
     * Cache-aware segmented rendering.
     *
     * For each segment:
     * 1. Check if a cached partial file exists (hash match)
     * 2. If miss, render that segment's frame range to a partial .mp4
     * 3. After all segments, concat partial files into final output
     * 4. Prune orphaned cache entries
     */
    private async renderSegmented(
        scene: Scene,
        frameRenderer: FrameRenderer,
        outputPath: string,
        config: ResolvedRenderConfig,
        segments: readonly Segment[],
        progressReporter: ProgressReporter,
    ): Promise<void> {
        const cacheDir = config.cacheDir ?? join(dirname(outputPath), '.anima-cache');
        const cache = new SegmentCache(cacheDir);
        await cache.init();
        await this.ensureDirectory(dirname(outputPath));

        const segmentPaths: string[] = [];
        let framesRendered = 0;

        for (const segment of segments) {
            const segmentPath = cache.getPath(segment.hash);

            if (cache.has(segment.hash)) {
                // Cache hit — skip rendering this segment
                const segmentFrames = Math.max(
                    1,
                    Math.floor((segment.endTime - segment.startTime) * config.frameRate) + 1,
                );
                framesRendered += segmentFrames;
                progressReporter.reportFrame(framesRendered - 1);
                segmentPaths.push(segmentPath);
                continue;
            }

            // Cache miss — render this segment's frames to a partial video
            await this.renderSegmentToFile(
                frameRenderer,
                segmentPath,
                config.format,
                config.frameRate,
                segment,
                progressReporter,
                framesRendered,
            );

            const segmentFrames = Math.max(
                1,
                Math.floor((segment.endTime - segment.startTime) * config.frameRate) + 1,
            );
            framesRendered += segmentFrames;
            segmentPaths.push(segmentPath);
        }

        // Concatenate all segment files into final output
        await concatSegments(segmentPaths, outputPath);

        // Prune orphaned cache entries
        const activeHashes = new Set(segments.map(s => s.hash));
        await cache.prune(activeHashes);

        progressReporter.complete();
    }

    /**
     * Renders a single segment's frame range to a video file.
     */
    private async renderSegmentToFile(
        frameRenderer: FrameRenderer,
        outputPath: string,
        format: string,
        frameRate: number,
        segment: Segment,
        progressReporter: ProgressReporter,
        frameOffset: number,
    ): Promise<void> {
        const segmentDuration = segment.endTime - segment.startTime;
        const totalFrames = Math.max(1, Math.floor(segmentDuration * frameRate) + 1);
        const { width, height } = frameRenderer.getDimensions();

        const ffmpegArgs = [
            '-y',
            '-f', 'image2pipe',
            '-vcodec', 'png',
            '-r', frameRate.toString(),
            '-i', '-',
        ];

        // Always encode segments as mp4 for consistent concat
        ffmpegArgs.push(
            '-c:v', 'libx264',
            '-pix_fmt', 'yuv420p',
            '-crf', '18',
        );

        ffmpegArgs.push(outputPath);

        const process = Bun.spawn(['ffmpeg', ...ffmpegArgs], {
            stdin: 'pipe',
        });

        try {
            for (let i = 0; i < totalFrames; i++) {
                const time = segment.startTime + (i / frameRate);
                const canvas = frameRenderer.renderFrame(time);
                const pngBuffer = await canvas.toBuffer('image/png');
                process.stdin.write(pngBuffer);
                progressReporter.reportFrame(frameOffset + i);
            }

            process.stdin.end();
            const status = await process.exited;

            if (status !== 0) {
                throw new Error(`FFmpeg segment render exited with code ${status}`);
            }
        } catch (error) {
            process.kill();
            throw error;
        }
    }
}
