import { Scene } from '@redwilly/anima';
import { pathToFileURL } from 'url';
import { resolve } from 'path';

/**
 * Result of loading scenes from a file.
 */
export interface LoadedScenes {
    /** Map of class name to Scene instance. */
    scenes: Map<string, Scene>;
    /** Error message if loading failed. */
    error?: string;
}

/**
 * Dynamically loads Scene classes from a TypeScript file.
 */
export class SceneLoader {
    /**
     * Loads all scenes from the specified file.
     *
     * @param filePath Path to the TypeScript file containing scenes
     * @returns Loaded scenes and any error
     */
    async load(filePath: string): Promise<LoadedScenes> {
        const absolutePath = resolve(filePath);
        const fileUrl = pathToFileURL(absolutePath).href;

        try {
            // Dynamically import the file
            const module = await import(fileUrl);
            const scenes = new Map<string, Scene>();

            for (const [name, exportValue] of Object.entries(module)) {
                // Check if export is a class that extends Scene
                if (
                    typeof exportValue === 'function' &&
                    exportValue.prototype instanceof Scene
                ) {
                    try {
                        const SceneClass = exportValue as new () => Scene;
                        const instance = new SceneClass();
                        scenes.set(name, instance);
                    } catch (err) {
                        console.warn(`Failed to instantiate scene '${name}':`, err);
                    }
                }
            }

            if (scenes.size === 0) {
                return { scenes, error: 'No Scene subclasses found in file.' };
            }

            return { scenes };
        } catch (err) {
            return {
                scenes: new Map(),
                error: `Failed to load file: ${err instanceof Error ? err.message : String(err)}`,
            };
        }
    }
}
