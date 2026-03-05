import { createCanvas, type Canvas } from '@napi-rs/canvas';
import type { Scene } from '../scene';
import { Matrix4x4 } from '../math';
import { drawMobject } from './drawMobject';
import { MANIM_FRAME_HEIGHT } from '../camera';

/**
 * Renders individual frames from a Scene.
 * Responsible for drawing mobjects to a canvas at a specific point in time.
 */
export class FrameRenderer {
    private readonly scene: Scene;
    private readonly width: number;
    private readonly height: number;

    constructor(scene: Scene, width: number, height: number) {
        this.scene = scene;
        this.width = width;
        this.height = height;
    }

    /**
     * Calculates the matrix that transforms Manim world coordinates to screen pixels.
     *
     * Manim coordinate system:
     * - Origin at center of screen
     * - Y-axis points up
     * - frameHeight = 8.0 units
     *
     * Screen coordinate system:
     * - Origin at top-left
     * - Y-axis points down
     * - Width x Height pixels
     */
    private calculateWorldToScreenMatrix(): Matrix4x4 {
        const camera = this.scene.getCamera();
        const viewMatrix = camera.getViewMatrix();

        // Scale from Manim units to pixels
        // pixelHeight / MANIM_FRAME_HEIGHT = pixels per unit
        const scale = this.height / MANIM_FRAME_HEIGHT;

        // Build the world-to-screen transform:
        // 1. Apply camera view transform (pan, zoom, rotation)
        // 2. Scale from units to pixels
        // 3. Flip Y-axis (Manim Y-up to screen Y-down)
        // 4. Translate origin to screen center

        const scaleMatrix = Matrix4x4.scale(scale, -scale, 1); // Flip Y
        const translateToCenter = Matrix4x4.translation(
            this.width / 2,
            this.height / 2,
            0
        );

        // Combined: translate * scale * view
        return translateToCenter.multiply(scaleMatrix).multiply(viewMatrix);
    }

    /**
     * Renders a single frame at the specified time.
     */
    renderFrame(time: number): Canvas {
        const canvas = createCanvas(this.width, this.height);
        const ctx = canvas.getContext('2d');

        // Evaluate scene state at the specified time (animations + updaters).
        this.scene.evaluateFrame(time);

        // Draw background
        const bgColor = this.scene.getBackgroundColor();
        ctx.fillStyle = `rgb(${bgColor.r}, ${bgColor.g}, ${bgColor.b})`;
        ctx.fillRect(0, 0, this.width, this.height);

        // Calculate world-to-screen matrix each frame to pick up camera animations
        const worldToScreen = this.calculateWorldToScreenMatrix();

        // Draw all mobjects in order
        const mobjects = this.scene.getMobjects();
        for (const mobject of mobjects) {
            drawMobject(ctx, mobject, worldToScreen);
        }

        return canvas;
    }

    /**
     * Gets the canvas dimensions.
     */
    getDimensions(): { width: number; height: number } {
        return { width: this.width, height: this.height };
    }
}
