import { Vector2 } from '../math/Vector2/Vector2';
import { Matrix3x3 } from '../math/matrix/Matrix3x3';
import { CameraFrame } from './CameraFrame';
import { hashNumber, hashFloat32Array, hashCompose } from '../cache/Hashable';
import { MANIM_FRAME_HEIGHT, type CameraConfig, type ResolvedCameraConfig } from './types';

/**
 * Camera manages the view into the scene.
 * Uses CameraFrame (a Mobject) to store transform state, enabling camera animations.
 *
 * The Camera provides both instant manipulation methods (panTo, zoomTo) and
 * access to the CameraFrame for fluent animation APIs.
 *
 * @example
 * // Instant camera manipulation
 * camera.zoomTo(2);
 * camera.panTo(new Vector2(5, 3));
 *
 * @example
 * // Animated camera movement via frame
 * this.play(this.frame.zoomIn(2).duration(1));
 * this.play(this.frame.centerOn(circle).duration(0.5));
 */
export class Camera {
    private readonly config: ResolvedCameraConfig;
    /** The CameraFrame that stores the camera's transform state. Use this for animations. */
    readonly frame: CameraFrame;

    /**
     * Creates a new Camera with the specified viewport dimensions.
     *
     * @param config - Configuration options
     * @param config.pixelWidth - Width of the viewport in pixels (default: 1920)
     * @param config.pixelHeight - Height of the viewport in pixels (default: 1080)
     */
    constructor(config: CameraConfig = {}) {
        this.config = {
            pixelWidth: config.pixelWidth ?? 1920,
            pixelHeight: config.pixelHeight ?? 1080,
        };
        this.frame = new CameraFrame({
            pixelWidth: this.config.pixelWidth,
            pixelHeight: this.config.pixelHeight,
        });
    }

    // ========== Frame Dimensions (Manim-compatible) ==========

    get frameHeight(): number {
        return MANIM_FRAME_HEIGHT;
    }

    get frameWidth(): number {
        const aspectRatio = this.config.pixelWidth / this.config.pixelHeight;
        return MANIM_FRAME_HEIGHT * aspectRatio;
    }

    get frameYRadius(): number {
        return this.frameHeight / 2;
    }

    get frameXRadius(): number {
        return this.frameWidth / 2;
    }

    // ========== Pixel Dimensions ==========

    get pixelWidth(): number {
        return this.config.pixelWidth;
    }

    get pixelHeight(): number {
        return this.config.pixelHeight;
    }

    // ========== Camera Transform Properties (read from frame) ==========

    get position(): Vector2 {
        return this.frame.position;
    }

    get zoom(): number {
        return 1 / this.frame.scale.x;
    }

    get rotation(): number {
        return this.frame.rotation;
    }

    // ========== Pan Operations (proxy to frame) ==========

    pan(delta: Vector2): this {
        const current = this.frame.position;
        this.frame.pos(current.x + delta.x, current.y + delta.y);
        return this;
    }

    panTo(position: Vector2): this {
        this.frame.pos(position.x, position.y);
        return this;
    }

    // ========== Zoom Operations (proxy to frame) ==========

    zoomTo(level: number): this {
        if (level <= 0) {
            throw new Error('Zoom level must be positive');
        }
        const frameScale = 1 / level;
        this.frame.setScale(frameScale, frameScale);
        return this;
    }

    // ========== Rotation Operations (proxy to frame) ==========

    rotateTo(angle: number): this {
        this.frame.setRotation(angle);
        return this;
    }

    // ========== View Matrix ==========

    getViewMatrix(): Matrix3x3 {
        const framePos = this.frame.position;
        const frameScale = this.frame.scale;
        const frameRotation = this.frame.rotation;

        const zoomX = 1 / frameScale.x;
        const zoomY = 1 / frameScale.y;

        const translate = Matrix3x3.translation(-framePos.x, -framePos.y);
        const rotate = Matrix3x3.rotation(-frameRotation);
        const scale = Matrix3x3.scale(zoomX, zoomY);

        return scale.multiply(rotate).multiply(translate);
    }

    // ========== Coordinate Transforms ==========

    /**
     * Transforms a world-space position to screen-space (pixel) coordinates.
     *
     * Screen coordinates have origin at top-left, with x increasing right
     * and y increasing downward.
     *
     * @param pos - Position in world coordinates
     * @returns Position in screen coordinates (pixels)
     *
     * @example
     * const screenPos = camera.worldToScreen(circle.position);
     * console.log(`Circle is at pixel (${screenPos.x}, ${screenPos.y})`);
     */
    worldToScreen(pos: Vector2): Vector2 {
        const viewMatrix = this.getViewMatrix();
        const transformed = viewMatrix.transformPoint(pos);
        const screenX = (transformed.x + 1) * 0.5 * this.config.pixelWidth;
        const screenY = (1 - transformed.y) * 0.5 * this.config.pixelHeight;
        return new Vector2(screenX, screenY);
    }

    /**
     * Transforms a screen-space (pixel) position to world coordinates.
     * This is the inverse of worldToScreen.
     *
     * @param pos - Position in screen coordinates (pixels, origin at top-left)
     * @returns Position in world coordinates
     *
     * @example
     * // Convert a mouse click position to world coordinates
     * const worldPos = camera.screenToWorld(new Vector2(mouseX, mouseY));
     */
    screenToWorld(pos: Vector2): Vector2 {
        const ndcX = (pos.x / this.config.pixelWidth) * 2 - 1;
        const ndcY = 1 - (pos.y / this.config.pixelHeight) * 2;
        const viewMatrix = this.getViewMatrix();
        const inverseView = viewMatrix.inverse();
        return inverseView.transformPoint(new Vector2(ndcX, ndcY));
    }

    /**
     * Checks if a world-space position is currently visible within the camera frame.
     *
     * @param pos - Position in world coordinates to check
     * @returns True if the position is within the visible frame bounds
     *
     * @example
     * if (camera.isInView(object.position)) {
     *   console.log('Object is visible');
     * }
     */
    isInView(pos: Vector2): boolean {
        const framePos = this.frame.position;
        const halfWidth = this.frame.width / 2;
        const halfHeight = this.frame.height / 2;

        return (
            pos.x >= framePos.x - halfWidth &&
            pos.x <= framePos.x + halfWidth &&
            pos.y >= framePos.y - halfHeight &&
            pos.y <= framePos.y + halfHeight
        );
    }

    reset(): this {
        this.frame.pos(0, 0);
        this.frame.setScale(1, 1);
        this.frame.setRotation(0);
        return this;
    }

    /**
     * Hashes camera config and the CameraFrame's full transform state.
     */
    computeHash(): number {
        return hashCompose(
            hashNumber(this.config.pixelWidth),
            hashNumber(this.config.pixelHeight),
            hashFloat32Array(this.frame.matrix.values),
        );
    }
}
