/**
 * Frame exporter for server-side rendering.
 */

import type { Scene } from '@anima/core';
import { ServerCanvasAdapter } from './adapter';

export interface ExportOptions {
    /** Frames per second (default: 60) */
    fps?: number;
    /** Output format (default: 'png') */
    format?: 'png' | 'jpeg';
}

export interface ExportResult {
    /** Frame buffers */
    frames: Buffer[];
    /** Total frames */
    frameCount: number;
    /** Duration in seconds */
    duration: number;
    /** Frames per second */
    fps: number;
}

/**
 * Exports a scene to a sequence of frame buffers.
 */
export class FrameExporter {
    private scene: Scene;
    private adapter: ServerCanvasAdapter;
    private fps: number;
    private format: 'png' | 'jpeg';

    constructor(scene: Scene, options?: ExportOptions) {
        this.scene = scene;
        this.fps = options?.fps ?? 60;
        this.format = options?.format ?? 'png';
        this.adapter = new ServerCanvasAdapter(scene.width, scene.height);
    }

    /**
     * Export all frames as buffers.
     */
    async exportFrames(): Promise<ExportResult> {
        const duration = this.scene.duration;
        const frameCount = Math.ceil(duration * this.fps);
        const frames: Buffer[] = [];
        const ctx = this.adapter.getContext();

        for (let i = 0; i < frameCount; i++) {
            const time = i / this.fps;

            // Seek to time
            this.scene.seek(time);

            // Render frame
            this.scene.render(ctx as unknown as CanvasRenderingContext2D);

            // Capture buffer
            const buffer = await this.adapter.toBuffer(this.format);
            frames.push(buffer);
        }

        return {
            frames,
            frameCount,
            duration,
            fps: this.fps,
        };
    }

    /**
     * Export a single frame at a specific time.
     */
    async exportFrame(time: number): Promise<Buffer> {
        const ctx = this.adapter.getContext();
        this.scene.seek(time);
        this.scene.render(ctx as unknown as CanvasRenderingContext2D);
        return this.adapter.toBuffer(this.format);
    }
}

/**
 * Export a scene to frame buffers.
 */
export async function exportFrames(
    scene: Scene,
    options?: ExportOptions
): Promise<ExportResult> {
    const exporter = new FrameExporter(scene, options);
    return exporter.exportFrames();
}
