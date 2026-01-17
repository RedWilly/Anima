/**
 * Supported render output formats.
 * - sprite: PNG sequence (frame_0000.png, frame_0001.png, ...)
 * - png: Single PNG frame
 * - mp4: H.264 video (requires FFmpeg - future)
 * - webp: Animated WebP (requires FFmpeg - future)
 * - gif: Animated GIF (requires FFmpeg - future)
 */
export type RenderFormat = 'sprite' | 'png' | 'mp4' | 'webp' | 'gif';

/**
 * Quality presets for rendering.
 * - production: Full resolution, best quality
 * - preview: Half resolution for faster preview
 */
export type RenderQuality = 'production' | 'preview';

/**
 * Standard resolution presets.
 */
export const Resolution = {
    /** 854x480 (16:9) */
    p480: { width: 854, height: 480 },
    /** 1280x720 (16:9) */
    p720: { width: 1280, height: 720 },
    /** 1920x1080 (16:9) */
    p1080: { width: 1920, height: 1080 },
    /** 3840x2160 (16:9) */
    p4K: { width: 3840, height: 2160 },
} as const;

/**
 * Configuration for rendering.
 */
export interface RenderConfig {
    /** Output width in pixels. Defaults to scene width. */
    width?: number;
    /** Output height in pixels. Defaults to scene height. */
    height?: number;
    /** Frames per second. Defaults to scene frame rate. */
    frameRate?: number;
    /** Output format. Defaults to 'sprite'. */
    format?: RenderFormat;
    /** Quality preset. Defaults to 'production'. */
    quality?: RenderQuality;
    /** Progress callback for render updates. */
    onProgress?: ProgressCallback;
}

/**
 * Resolved render configuration with all values specified.
 */
export interface ResolvedRenderConfig {
    width: number;
    height: number;
    frameRate: number;
    format: RenderFormat;
    quality: RenderQuality;
    onProgress?: ProgressCallback;
}

/**
 * Progress information during rendering.
 */
export interface RenderProgress {
    /** Current frame being rendered (0-indexed). */
    currentFrame: number;
    /** Total number of frames to render. */
    totalFrames: number;
    /** Percentage complete (0-100). */
    percentage: number;
    /** Elapsed time in milliseconds. */
    elapsedMs: number;
    /** Estimated remaining time in milliseconds. */
    estimatedRemainingMs: number;
}

/**
 * Callback for progress updates during rendering.
 */
export type ProgressCallback = (progress: RenderProgress) => void;
