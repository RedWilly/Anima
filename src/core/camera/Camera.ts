import { Vector2 } from '../math/Vector2/Vector2';
import { Matrix3x3 } from '../math/matrix/Matrix3x3';
import type { CameraConfig, ResolvedCameraConfig } from './types';

/**
 * Manim-compatible fixed frame height in logical units.
 * This is the standard Manim value that ensures consistent vertical scale.
 */
const MANIM_FRAME_HEIGHT = 8.0;

/**
 * Camera manages the view into the scene, calculating frame dimensions
 * from pixel resolution and providing pan/zoom/rotation controls.
 *
 * Frame dimensions use Manim's coordinate system:
 * - frameHeight is fixed at 8.0 units
 * - frameWidth is calculated based on aspect ratio
 */
export class Camera {
    private readonly config: ResolvedCameraConfig;
    private positionValue: Vector2;
    private zoomValue: number;
    private rotationValue: number;

    constructor(config: CameraConfig = {}) {
        this.config = {
            pixelWidth: config.pixelWidth ?? 1920,
            pixelHeight: config.pixelHeight ?? 1080,
        };
        this.positionValue = Vector2.ZERO;
        this.zoomValue = 1;
        this.rotationValue = 0;
    }

    // ========== Frame Dimensions (Manim-compatible) ==========

    /**
     * Frame height in logical units. Fixed at 8.0 (Manim standard).
     */
    get frameHeight(): number {
        return MANIM_FRAME_HEIGHT;
    }

    /**
     * Frame width in logical units, calculated from aspect ratio.
     * frameWidth = frameHeight * (pixelWidth / pixelHeight)
     */
    get frameWidth(): number {
        const aspectRatio = this.config.pixelWidth / this.config.pixelHeight;
        return MANIM_FRAME_HEIGHT * aspectRatio;
    }

    /**
     * Half of frame height (4.0 for standard Manim).
     */
    get frameYRadius(): number {
        return this.frameHeight / 2;
    }

    /**
     * Half of frame width.
     */
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

    // ========== Camera Transform Properties ==========

    get position(): Vector2 {
        return this.positionValue;
    }

    get zoom(): number {
        return this.zoomValue;
    }

    get rotation(): number {
        return this.rotationValue;
    }

    // ========== Pan Operations ==========

    /**
     * Pan the camera by a delta offset.
     */
    pan(delta: Vector2): this {
        this.positionValue = this.positionValue.add(delta);
        return this;
    }

    /**
     * Pan the camera to an absolute position.
     */
    panTo(position: Vector2): this {
        this.positionValue = position;
        return this;
    }

    // ========== Zoom Operations ==========

    /**
     * Set the zoom level. 1 = normal, 2 = 2x magnification.
     */
    zoomTo(level: number): this {
        if (level <= 0) {
            throw new Error('Zoom level must be positive');
        }
        this.zoomValue = level;
        return this;
    }

    // ========== Rotation Operations ==========

    /**
     * Set the rotation angle in radians.
     */
    rotateTo(angle: number): this {
        this.rotationValue = angle;
        return this;
    }

    // ========== View Matrix ==========

    /**
     * Get the view transformation matrix.
     * Combines pan, zoom, and rotation into a single Matrix3x3.
     * This matrix transforms world coordinates to camera/screen coordinates.
     */
    getViewMatrix(): Matrix3x3 {
        // Order: translate to camera position, then rotate, then scale (zoom)
        const translate = Matrix3x3.translation(
            -this.positionValue.x,
            -this.positionValue.y
        );
        const rotate = Matrix3x3.rotation(-this.rotationValue);
        const scale = Matrix3x3.scale(this.zoomValue, this.zoomValue);

        // Combined: scale * rotate * translate
        return scale.multiply(rotate).multiply(translate);
    }

    /**
     * Reset camera to default state (center, no zoom, no rotation).
     */
    reset(): this {
        this.positionValue = Vector2.ZERO;
        this.zoomValue = 1;
        this.rotationValue = 0;
        return this;
    }
}
