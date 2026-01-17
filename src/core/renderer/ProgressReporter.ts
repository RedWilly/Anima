import type { RenderProgress, ProgressCallback } from './types';

/**
 * Tracks rendering progress and reports updates via callback.
 */
export class ProgressReporter {
    private readonly totalFrames: number;
    private readonly onProgress?: ProgressCallback;
    private readonly startTime: number;
    private currentFrame = 0;

    constructor(totalFrames: number, onProgress?: ProgressCallback) {
        this.totalFrames = totalFrames;
        this.onProgress = onProgress;
        this.startTime = Date.now();
    }

    /**
     * Report progress for the current frame.
     */
    reportFrame(frameIndex: number): void {
        this.currentFrame = frameIndex;
        if (!this.onProgress) return;

        const elapsedMs = Date.now() - this.startTime;
        const framesComplete = frameIndex + 1;
        const percentage = this.totalFrames > 0
            ? (framesComplete / this.totalFrames) * 100
            : 100;

        // Estimate remaining time based on average time per frame
        let estimatedRemainingMs = 0;
        if (framesComplete > 0 && framesComplete < this.totalFrames) {
            const msPerFrame = elapsedMs / framesComplete;
            const framesRemaining = this.totalFrames - framesComplete;
            estimatedRemainingMs = msPerFrame * framesRemaining;
        }

        const progress: RenderProgress = {
            currentFrame: frameIndex,
            totalFrames: this.totalFrames,
            percentage: Math.min(100, Math.max(0, percentage)),
            elapsedMs,
            estimatedRemainingMs,
        };

        this.onProgress(progress);
    }

    /**
     * Report rendering complete.
     */
    complete(): void {
        if (!this.onProgress) return;

        const elapsedMs = Date.now() - this.startTime;
        const progress: RenderProgress = {
            currentFrame: this.totalFrames - 1,
            totalFrames: this.totalFrames,
            percentage: 100,
            elapsedMs,
            estimatedRemainingMs: 0,
        };

        this.onProgress(progress);
    }
}
