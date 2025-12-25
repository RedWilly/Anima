/**
 * @anima/server-renderer - Server-side rendering with @napi-rs/canvas
 */

// Adapter
export { ServerCanvasAdapter } from './adapter';
export type { ServerRenderAdapter } from './adapter';

// Exporter
export { FrameExporter, exportFrames } from './exporter';
export type { ExportOptions, ExportResult } from './exporter';

// Video
export { VideoEncoder, exportVideo } from './video';
export type { VideoOptions, VideoFormat } from './video';

// Re-export core for convenience
export {
    Scene,
    scene,
    Circle,
    circle,
    Rectangle,
    rectangle,
    linear,
    easeIn,
    easeOut,
    easeInOut,
    elastic,
    bounce,
} from '@anima/core';

export type {
    SceneOptions,
    CircleOptions,
    RectangleOptions,
    AnimationOptions,
    EasingName,
} from '@anima/core';
