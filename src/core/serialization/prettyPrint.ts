/**
 * Pretty printer for serialized scenes.
 */

import type { SerializedScene } from './types';

/**
 * Pretty print a serialized scene with indentation.
 */
export function prettyPrint(scene: SerializedScene): string {
    return JSON.stringify(scene, null, 2);
}

/**
 * Pretty print a scene to a JSON string with custom formatting.
 */
export function prettyPrintCompact(scene: SerializedScene): string {
    // Use 2-space indentation
    return JSON.stringify(scene, null, 2);
}
