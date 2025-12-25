/**
 * Scene factory function.
 */

import { Scene } from './scene';
import type { SceneOptions } from './scene';

/**
 * Create a new scene.
 * 
 * @example
 * const myScene = scene({ width: 1920, height: 1080 });
 * myScene.add(circle()).moveTo(100, 100).fadeOut();
 */
export function scene(options?: SceneOptions): Scene {
    return new Scene(options);
}
