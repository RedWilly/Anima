/**
 * Pretty printer for serialized scenes.
 */

import type { SerializedScene } from './types';

/**
 * Formats a serialized scene as a JSON string with 2-space indentation.
 */
export function prettyPrint(scene: SerializedScene): string {
    return JSON.stringify(scene, null, 2);
}

/**
 * Formats a serialized scene as a JSON string using a compact yet readable format.
 */
export function prettyPrintCompact(scene: SerializedScene): string {
    // Current implementation uses 2-space indentation; could be adjusted for more compactness.
    return JSON.stringify(scene, null, 2);
}
