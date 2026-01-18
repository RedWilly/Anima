import { SceneLoader } from '../SceneLoader';
import { resolve } from 'path';

/**
 * Implementation of the 'list-scenes' command.
 * Loads a file and prints the names of all Scene classes found.
 */
export async function listScenes(file: string): Promise<void> {
    const loader = new SceneLoader();
    const { scenes, error } = await loader.load(file);

    if (error) {
        console.error(`Error: ${error}`);
        process.exit(1);
    }

    if (scenes.size === 0) {
        console.log('No scenes found in this file.');
        return;
    }

    console.log(`Found ${scenes.size} scene(s) in '${resolve(file)}':`);
    for (const name of scenes.keys()) {
        console.log(`  - ${name}`);
    }
}
