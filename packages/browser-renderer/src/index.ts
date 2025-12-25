/**
 * @anima/browser-renderer - Browser Canvas rendering adapter
 */

// Renderer
export { CanvasAdapter } from './adapter';
export type { RenderAdapter } from './adapter';

// Playback
export { PlaybackController } from './playback';
export type { PlaybackControls, PlaybackOptions } from './playback';

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
