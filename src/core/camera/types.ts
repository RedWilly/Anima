import type { Vector2 } from '../math/Vector2/Vector2';

/**
 * Configuration options for Camera.
 */
export interface CameraConfig {
    /** Pixel width for aspect ratio calculation. Default: 1920 */
    readonly pixelWidth?: number;
    /** Pixel height for aspect ratio calculation. Default: 1080 */
    readonly pixelHeight?: number;
}

/**
 * Resolved camera configuration with all defaults applied.
 */
export interface ResolvedCameraConfig {
    readonly pixelWidth: number;
    readonly pixelHeight: number;
}
