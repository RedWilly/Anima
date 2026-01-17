import type { Color } from '../math/color/Color';

/**
 * Configuration options for Scene.
 */
export interface SceneConfig {
    /** Pixel width of the scene. Default: 1920 */
    readonly width?: number;
    /** Pixel height of the scene. Default: 1080 */
    readonly height?: number;
    /** Background color. Default: BLACK */
    readonly backgroundColor?: Color;
    /** Frames per second. Default: 60 */
    readonly frameRate?: number;
}

/**
 * Resolved scene configuration with all defaults applied.
 */
export interface ResolvedSceneConfig {
    readonly width: number;
    readonly height: number;
    readonly backgroundColor: Color;
    readonly frameRate: number;
}
