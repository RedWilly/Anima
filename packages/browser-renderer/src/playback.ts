/**
 * Playback controller for browser animations.
 */

import type { Scene } from '@anima/core';

export interface PlaybackControls {
    /** Pause the animation */
    pause(): void;
    /** Resume the animation */
    resume(): void;
    /** Seek to a specific time in seconds */
    seek(time: number): void;
    /** Set playback speed multiplier (1 = normal, 2 = double, 0.5 = half) */
    setSpeed(multiplier: number): void;
    /** Stop and dispose the controller */
    dispose(): void;
    /** Check if currently playing */
    isPlaying(): boolean;
    /** Get current playback time */
    getCurrentTime(): number;
}

export interface PlaybackOptions {
    /** Auto-start playback (default: true) */
    autoplay?: boolean;
    /** Loop the animation (default: false) */
    loop?: boolean;
    /** Playback speed multiplier (default: 1) */
    speed?: number;
}

/**
 * Controls animation playback in the browser using requestAnimationFrame.
 */
export class PlaybackController implements PlaybackControls {
    private scene: Scene;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private animationFrameId: number | null = null;
    private lastFrameTime: number = 0;
    private playing = false;
    private speed = 1;
    private loop = false;

    constructor(scene: Scene, canvas: HTMLCanvasElement, options?: PlaybackOptions) {
        this.scene = scene;
        this.canvas = canvas;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Failed to get 2D context from canvas');
        }
        this.ctx = ctx;

        // Apply options
        this.speed = options?.speed ?? 1;
        this.loop = options?.loop ?? false;

        // Size canvas to match scene
        canvas.width = scene.width;
        canvas.height = scene.height;

        // Initial render
        this.renderFrame();

        // Auto-start if requested
        if (options?.autoplay !== false) {
            this.resume();
        }
    }

    /**
     * Start or resume playback.
     */
    resume(): void {
        if (this.playing) return;

        this.playing = true;
        this.scene.play();
        this.lastFrameTime = performance.now();
        this.scheduleFrame();
    }

    /**
     * Pause playback.
     */
    pause(): void {
        this.playing = false;
        this.scene.pause();

        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    /**
     * Seek to a specific time.
     */
    seek(time: number): void {
        this.scene.seek(time);
        this.renderFrame();
    }

    /**
     * Set playback speed.
     */
    setSpeed(multiplier: number): void {
        this.speed = Math.max(0.1, multiplier);
    }

    /**
     * Check if playing.
     */
    isPlaying(): boolean {
        return this.playing;
    }

    /**
     * Get current time.
     */
    getCurrentTime(): number {
        return this.scene.currentTime;
    }

    /**
     * Stop and clean up.
     */
    dispose(): void {
        this.pause();
        // Release references
    }

    /**
     * Schedule the next animation frame.
     */
    private scheduleFrame(): void {
        this.animationFrameId = requestAnimationFrame((timestamp) => {
            this.onFrame(timestamp);
        });
    }

    /**
     * Handle animation frame.
     */
    private onFrame(timestamp: number): void {
        if (!this.playing) return;

        const deltaTime = ((timestamp - this.lastFrameTime) / 1000) * this.speed;
        this.lastFrameTime = timestamp;

        // Advance timeline
        this.scene.timeline.tick(deltaTime);

        // Check if complete
        if (this.scene.timeline.playbackState === 'complete') {
            if (this.loop) {
                this.scene.reset();
                this.scene.play();
            } else {
                this.playing = false;
                return;
            }
        }

        // Render the frame
        this.renderFrame();

        // Schedule next frame
        this.scheduleFrame();
    }

    /**
     * Render the current frame.
     */
    private renderFrame(): void {
        this.scene.render(this.ctx);
    }
}

/**
 * Create a playback controller for a scene and canvas.
 */
export function createPlayback(
    scene: Scene,
    canvas: HTMLCanvasElement,
    options?: PlaybackOptions
): PlaybackController {
    return new PlaybackController(scene, canvas, options);
}
