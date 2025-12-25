/**
 * Preview command - renders animation and opens in system video player.
 */

import { resolve, basename, extname, join } from 'path';
import { tmpdir } from 'os';
import { logger, Spinner } from './utils/logger';
import { getNumber } from './utils/args';
import type { Scene } from '@anima/core';
import { VideoEncoder } from '../video';

export interface PreviewOptions {
    flags: Record<string, string | boolean>;
}

/**
 * Execute the preview command.
 * Renders animation to a temporary video file and opens in system player.
 */
export async function previewCommand(inputPath: string, options: PreviewOptions): Promise<void> {
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
    const fps = getNumber(flags, ['fps'], 60);

    logger.heading('Anima Preview');
    logger.info(`Input: ${inputPath}`);

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

    // Create temp output path
    const inputBasename = basename(inputPath, extname(inputPath));
    const tempDir = tmpdir();
    const tempVideo = join(tempDir, `anima-preview-${inputBasename}-${Date.now()}.mp4`);

    // Render to temp video
    const renderSpinner = new Spinner(`Rendering ${scene.duration.toFixed(2)}s animation...`).start();

    try {
        const encoder = new VideoEncoder(scene, {
            output: tempVideo,
            fps,
            format: 'mp4',
            quality: 90,
        });

        await encoder.encode();
        renderSpinner.stop();

        logger.success(`Preview ready: ${tempVideo}`);
    } catch (err) {
        renderSpinner.fail();
        logger.error(`Render failed: ${(err as Error).message}`);
        process.exit(1);
    }

    // Open in system video player
    logger.info('Opening in video player...');
    try {
        const isWindows = process.platform === 'win32';
        const isMac = process.platform === 'darwin';

        if (isWindows) {
            Bun.spawn(['cmd', '/c', 'start', '', tempVideo]);
        } else if (isMac) {
            Bun.spawn(['open', tempVideo]);
        } else {
            Bun.spawn(['xdg-open', tempVideo]);
        }

        logger.success('Opened in default video player');
        logger.dim(`File: ${tempVideo}`);
    } catch {
        logger.warn('Could not auto-open video player');
        logger.dim(`Open manually: ${tempVideo}`);
    }
}

/**
 * Show help for preview command.
 */
export function showPreviewHelp(): void {
    logger.heading('anima preview <file>');
    console.log('Render animation and open in system video player.\n');
    console.log('Usage:');
    console.log('  anima preview animation.ts');
    console.log('  anima preview animation.ts --fps 30\n');
    console.log('Options:');
    console.log('  --fps <number>        Frames per second (default: 60)');
    console.log('  -h, --help            Show this help');
}
