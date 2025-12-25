/**
 * Render command - exports animation to video file.
 */

import { resolve, basename, extname } from 'path';
import { logger, Spinner } from '../utils/logger';
import { getString, getNumber } from '../utils/args';
import type { Scene } from '@anima/core';
import { VideoEncoder } from '@anima/server-renderer';
import type { VideoFormat } from '@anima/server-renderer';

export interface RenderOptions {
    flags: Record<string, string | boolean>;
}

/**
 * Execute the render command.
 */
export async function renderCommand(inputPath: string, options: RenderOptions): Promise<void> {
    const { flags } = options;

    // Resolve input path
    const absolutePath = resolve(process.cwd(), inputPath);

    // Validate input file exists
    const file = Bun.file(absolutePath);
    if (!(await file.exists())) {
        logger.error(`File not found: ${inputPath}`);
        logger.dim(`Looked for: ${absolutePath}`);
        process.exit(1);
    }

    // Parse options
    const inputBasename = basename(inputPath, extname(inputPath));
    const output = getString(flags, ['o', 'output'], `${inputBasename}.mp4`);
    const format = getString(flags, ['f', 'format'], 'mp4') as VideoFormat;
    const fps = getNumber(flags, ['fps'], 60);
    const quality = getNumber(flags, ['quality'], 80);

    // Validate format
    if (!['mp4', 'webm', 'gif'].includes(format)) {
        logger.error(`Invalid format: ${format}`);
        logger.dim('Supported formats: mp4, webm, gif');
        process.exit(1);
    }

    logger.heading('Anima Render');
    logger.info(`Input: ${inputPath}`);
    logger.info(`Output: ${output}`);
    logger.info(`Format: ${format} @ ${fps}fps`);
    logger.newline();

    // Import animation file
    const spinner = new Spinner('Loading animation...').start();
    let scene: Scene;

    try {
        const module = await import(absolutePath);
        scene = module.default;

        if (!scene || typeof scene.render !== 'function') {
            spinner.fail();
            logger.error('File must export a Scene as default export.');
            logger.dim('Example: export default scene({ width: 800, height: 600 });');
            process.exit(1);
        }
    } catch (err) {
        spinner.fail();
        logger.error(`Failed to import animation: ${(err as Error).message}`);
        process.exit(1);
    }

    spinner.stop();

    // Render to video
    const renderSpinner = new Spinner(`Rendering ${scene.duration.toFixed(2)}s animation...`).start();

    try {
        const encoder = new VideoEncoder(scene, {
            output: resolve(process.cwd(), output),
            fps,
            format,
            quality,
        });

        await encoder.encode();
        renderSpinner.stop();

        logger.success(`Video saved to ${output}`);
        logger.dim(`Duration: ${scene.duration.toFixed(2)}s, Frames: ${Math.ceil(scene.duration * fps)}`);
    } catch (err) {
        renderSpinner.fail();
        logger.error(`Render failed: ${(err as Error).message}`);

        if ((err as Error).message.includes('FFmpeg')) {
            logger.newline();
            logger.warn('FFmpeg is required for video encoding.');
            logger.dim('Install: https://ffmpeg.org/download.html');
        }

        process.exit(1);
    }
}

/**
 * Show help for render command.
 */
export function showRenderHelp(): void {
    logger.heading('anima render <file>');
    console.log('Render an animation to video.\n');
    console.log('Usage:');
    console.log('  anima render animation.ts');
    console.log('  anima render animation.ts -o output.mp4');
    console.log('  anima render animation.ts --format webm --fps 30\n');
    console.log('Options:');
    console.log('  -o, --output <path>   Output file path (default: <input>.mp4)');
    console.log('  -f, --format <fmt>    Format: mp4, webm, gif (default: mp4)');
    console.log('  --fps <number>        Frames per second (default: 60)');
    console.log('  --quality <1-100>     Video quality (default: 80)');
    console.log('  -h, --help            Show this help');
}
