import { SceneLoader } from '../SceneLoader';
import { Renderer } from '../../core/renderer/Renderer';
import { Resolution, type RenderFormat, type RenderQuality } from '../../core/renderer/types';
import type { Scene } from '../../core/scene/Scene';

/**
 * Options for the render command.
 */
interface RenderOptions {
    scene?: string;
    format?: string;
    resolution?: string;
    fps?: string;
    quality?: string;
    output?: string;
}

/**
 * Implementation of the 'render' command.
 */
export async function render(file: string, options: RenderOptions): Promise<void> {
    const loader = new SceneLoader();
    const { scenes, error } = await loader.load(file);

    if (error) {
        console.error(`Error: ${error}`);
        process.exit(1);
    }

    let scene: Scene;
    if (options.scene) {
        const found = scenes.get(options.scene);
        if (!found) {
            console.error(`Error: Scene '${options.scene}' not found in file.`);
            console.log('Available scenes:');
            for (const name of scenes.keys()) {
                console.log(`  - ${name}`);
            }
            process.exit(1);
        }
        scene = found;
    } else {
        if (scenes.size === 1) {
            scene = scenes.values().next().value!;
        } else {
            console.error('Error: Multiple scenes found in file. Please specify one with --scene.');
            for (const name of scenes.keys()) {
                console.log(`  - ${name}`);
            }
            process.exit(1);
        }
    }

    if (!scene) {
        console.error('Error: No scene found to render.');
        process.exit(1);
    }

    const renderer = new Renderer();
    const outputPath = options.output ?? `output.${options.format ?? 'mp4'}`;

    // Resolve resolution preset
    let width = scene.getWidth();
    let height = scene.getHeight();
    if (options.resolution) {
        const presetKey = `p${options.resolution}` as keyof typeof Resolution;
        const preset = Resolution[presetKey];
        if (preset) {
            width = preset.width;
            height = preset.height;
        } else {
            console.warn(`Warning: Resolution preset '${options.resolution}' not found. Using scene defaults.`);
        }
    }

    console.log(`Rendering scene to '${outputPath}'...`);

    await renderer.render(scene, outputPath, {
        width,
        height,
        frameRate: options.fps ? parseInt(options.fps, 10) : undefined,
        format: options.format as RenderFormat,
        quality: options.quality as RenderQuality,
        onProgress: (progress) => {
            const percent = progress.percentage.toFixed(1);
            const eta = (progress.estimatedRemainingMs / 1000).toFixed(1);
            process.stdout.write(`\rProgress: ${percent}% | ETA: ${eta}s    `);
            if (progress.percentage === 100) {
                process.stdout.write('\n');
            }
        },
    });

    console.log('Rendering complete.');
}
