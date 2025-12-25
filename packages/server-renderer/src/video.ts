/**
 * Video encoder using FFmpeg.
 */

import type { Scene } from '@anima/core';
import { FrameExporter } from './exporter';

export type VideoFormat = 'mp4' | 'webm' | 'gif';

export interface VideoOptions {
    /** Output file path */
    output: string;
    /** Frames per second (default: 60) */
    fps?: number;
    /** Output format (default: 'mp4') */
    format?: VideoFormat;
    /** Video quality 1-100 (default: 80) */
    quality?: number;
}

/**
 * Encodes frames to video using FFmpeg.
 */
export class VideoEncoder {
    private scene: Scene;
    private options: Required<VideoOptions>;

    constructor(scene: Scene, options: VideoOptions) {
        this.scene = scene;
        this.options = {
            output: options.output,
            fps: options.fps ?? 60,
            format: options.format ?? 'mp4',
            quality: options.quality ?? 80,
        };
    }

    /**
     * Encode the scene to a video file.
     */
    async encode(): Promise<void> {
        const exporter = new FrameExporter(this.scene, { fps: this.options.fps });
        const result = await exporter.exportFrames();

        // Get FFmpeg arguments based on format
        const ffmpegArgs = this.getFFmpegArgs(result.fps);

        // Spawn FFmpeg process
        const proc = Bun.spawn(['ffmpeg', ...ffmpegArgs], {
            stdin: 'pipe',
            stdout: 'inherit',
            stderr: 'inherit',
        });

        // Write frames to stdin
        for (const frame of result.frames) {
            proc.stdin.write(frame);
        }
        proc.stdin.end();

        // Wait for completion
        const exitCode = await proc.exited;
        if (exitCode !== 0) {
            throw new Error(`FFmpeg exited with code ${exitCode}`);
        }
    }

    /**
     * Get FFmpeg arguments for the specified format.
     */
    private getFFmpegArgs(fps: number): string[] {
        const baseArgs = [
            '-y', // Overwrite output
            '-f', 'image2pipe',
            '-framerate', String(fps),
            '-i', 'pipe:0', // Read from stdin
        ];

        switch (this.options.format) {
            case 'mp4':
                return [
                    ...baseArgs,
                    '-c:v', 'libx264',
                    '-pix_fmt', 'yuv420p',
                    '-crf', String(Math.round(51 - (this.options.quality / 100) * 51)),
                    this.options.output,
                ];
            case 'webm':
                return [
                    ...baseArgs,
                    '-c:v', 'libvpx-vp9',
                    '-crf', String(Math.round(63 - (this.options.quality / 100) * 63)),
                    '-b:v', '0',
                    this.options.output,
                ];
            case 'gif':
                return [
                    ...baseArgs,
                    '-filter_complex', `fps=${fps},scale=-1:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`,
                    this.options.output,
                ];
            default:
                throw new Error(`Unsupported format: ${this.options.format}`);
        }
    }
}

/**
 * Export a scene to a video file.
 */
export async function exportVideo(
    scene: Scene,
    options: VideoOptions
): Promise<void> {
    const encoder = new VideoEncoder(scene, options);
    await encoder.encode();
}
