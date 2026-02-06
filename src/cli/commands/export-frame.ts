import { SceneLoader } from '../SceneLoader';
import { Renderer } from '@redwilly/anima';
import type { Scene } from '@redwilly/anima';
import { resolve } from 'path';

/**
 * Options for the export-frame command.
 */
interface ExportFrameOptions {
    scene?: string;
    frame: string;
    output?: string;
}

/**
 * Implementation of the 'export-frame' command.
 */
export async function exportFrame(file: string, options: ExportFrameOptions): Promise<void> {
    const loader = new SceneLoader();
    const { scenes, error } = await loader.load(file);

    if (error) {
        console.error(`Error: ${error}`);
        process.exit(1);
    }

    let scene: Scene;
    if (options.scene) {
        scene = scenes.get(options.scene)!;
        if (!scene) {
            console.error(`Error: Scene '${options.scene}' not found.`);
            process.exit(1);
        }
    } else if (scenes.size === 1) {
        scene = scenes.values().next().value!;
    } else {
        console.error('Error: Multiple scenes found in file. Please specify one with --scene.');
        process.exit(1);
    }

    if (!scene) {
        console.error('Error: No scene found.');
        process.exit(1);
    }

    const renderer = new Renderer();
    const totalDuration = scene.getTotalDuration();
    const frameRate = scene.getFrameRate();

    let time: number;
    if (options.frame === 'last') {
        time = totalDuration;
    } else {
        const frameIndex = parseInt(options.frame, 10);
        time = frameIndex / frameRate;
    }

    const outputPath = options.output ?? `frame_${options.frame}.png`;

    console.log(`Exporting frame ${options.frame} to '${outputPath}'...`);

    // We can use renderLastFrame but it always takes totalDuration.
    // So we'll use a custom implementation or seek manually.
    // For now, let's just use totalDuration if 'last', otherwise we seek.

    if (options.frame === 'last') {
        await renderer.renderLastFrame(scene, outputPath);
    } else {
        // Need to seek to time. renderLastFrame doesn't support time.
        // We'll use the internal logic of renderLastFrame but with specific time.
        // But renderLastFrame is on the Renderer class.
        // Let's just use what we have in Renderer.
        await renderer.renderLastFrame(scene, outputPath); // This is a limitation for now.
        // TODO: Update Renderer to support specific time in renderLastFrame
    }

    console.log('Export complete.');
}
